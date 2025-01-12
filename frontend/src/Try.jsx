import "@asymmetrik/leaflet-d3";
import { MapContainer, TileLayer, GeoJSON, useMap } from "react-leaflet";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

import { coords as stateCoords } from "./helpers/constants";
import { DotDensity, DotDistribution } from "./plots";
import Legend from "./components/Legend";
import { newYorkText } from "./helpers/text";
import { sort } from "d3";

// import "./basemap.css";

gsap.registerPlugin(ScrollTrigger);

const BaseMap = ({
  data,
  state,
  children,
  legend = true,
  distributionData,
}) => {
  const parksData = data.parks;
  const censusData = data.census;

  const mapRef = useRef(null);
  const mapContainerRef = useRef();
  const containerRef = useRef();
  const textRef = useRef();

  const [mapHeight, setMapHeight] = useState(0);

  let offset = 3;
  const reorgParksData = useMemo(
    () =>
      parksData.features.map((feature, index) => {
        const { properties } = feature;
        const { name: parkName } = properties;
        if (parkName === "Central Park") {
          feature["appearanceOrder"] = 0;
          offset -= 1;
        } else if (parkName === "Prospect Park") {
          feature["appearanceOrder"] = 1;
          offset -= 1;
        } else if (parkName === "Sunset Park") {
          feature["appearanceOrder"] = 2;
          offset -= 1;
        } else {
          feature["appearanceOrder"] = index + offset;
        }
        return feature;
      }),
    []
  );

  const sorted = useMemo(
    () =>
      Object.values(reorgParksData).sort((parkData1, parkData2) => {
        const { appearanceOrder: firstAppearance } = parkData1;
        const { appearanceOrder: secondAppearance } = parkData2;
        return firstAppearance - secondAppearance;
      }),
    [reorgParksData]
  );
  //   console.log(sorted);

  //   console.log("LENGTH", sorted.length);

  const coords = useMemo(
    () =>
      sorted.map((feature, index) => {
        if (index === 0) return [40.78166117469302, -73.96880877926723];
        const coords = feature.geometry.coordinates[0][0][0];
        return [coords[1], coords[0]];
      }),
    [sorted]
  );

  const [currentIndex, setCurrentIndex] = useState(0);

  const handleScroll = useCallback(
    (self) => {
      if (self.progress === 1) return;
      let newIndex = Math.floor(self.progress * coords.length);
      console.log("progress", self.progress.toPrecision(3));
      console.log("index", newIndex);
      setCurrentIndex(newIndex);

      if (mapRef.current) {
        const newCoords = coords[newIndex];
        const zoomLevel = 14;
        mapRef.current.flyTo(newCoords, zoomLevel, {
          animate: true,
          duration: 1,
        });
      }
    },
    [coords]
  );

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(mapContainerRef.current, {
        scrollTrigger: {
          trigger: mapContainerRef.current,
          scrub: true,
          pin: "#pinElement",
          pinSpacing: false,
          onUpdate: (self) => handleScroll(self),
          markers: true,
        },
      });
    }, containerRef);

    return () => ctx.revert();
  }, [coords, handleScroll, mapHeight]);

  useEffect(() => {
    const ztx = gsap.context(() => {
      gsap.to("#textContent", {
        y: -window.innerHeight,
        ease: "none",
        scrollTrigger: {
          trigger: mapContainerRef.current,
          start: "50% 50%",
          markers: true,
          scrub: true,
          id: "sentence",
        },
      });
    }, containerRef);

    return () => ztx.revert();
  }, [mapHeight]);

  useEffect(() => {
    const updateRightColumnHeight = () => {
      if (mapContainerRef.current) {
        const { height } = mapContainerRef.current.getBoundingClientRect();
        setMapHeight(height);
      }
    };

    updateRightColumnHeight();
    window.addEventListener("resize", updateRightColumnHeight);

    return () => {
      window.removeEventListener("resize", updateRightColumnHeight);
    };
  }, []);

  return (
    <div className='w-full h-screen flex justify-between' ref={containerRef}>
      <div className='h-screen w-full flex' id='pinElement'>
        <div className='absolute top-0 left-0 p-4 z-[2000]' id='legend'>
          {legend && <Legend />}
        </div>
        <div className='w-1/2 h-screen flex' ref={mapContainerRef}>
          <MapContainer
            center={stateCoords[state]}
            zoom={12}
            style={{ width: "100%", height: "100%" }}
            ref={mapRef}
            scrollWheelZoom={false}
            zoomControl={false}
            doubleClickZoom={false}
          >
            <TileLayer
              url='https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
              attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              maxZoom={20}
            />
            <GeoJSON
              data={parksData}
              style={{
                color: "#660000",
                weight: 2,
                opacity: "85%",
              }}
              pointToLayer={() => null}
              onEachFeature={(feature, layer) => {
                if (
                  (feature.geometry.type === "Polygon" ||
                    feature.geometry.type === "MultiPolygon") &&
                  feature.properties.name
                ) {
                  layer.bindTooltip(feature.properties.name, {
                    direction: "center",
                    permanent: true,
                  });
                }
              }}
            />
            {children}
            <DotDensity data={censusData} />
          </MapContainer>
        </div>
        <div
          className='w-1/2 self-end translate-y-full'
          id='textContent'
          ref={textRef}
        >
          {Object.values(newYorkText).map(({ text, showTitle }, index) => {
            const parkName = sorted[index].properties.name;
            return (
              <div
                className={`h-[${mapHeight}px] ml-6`}
                key={`${parkName}-text`}
                id='text-block'
              >
                {text}
                <DotDistribution
                  data={distributionData}
                  state='NYC'
                  selectedPark={parkName}
                  layers={["race"]}
                  legend={false}
                  showTitle={showTitle}
                />
              </div>
            );
          })}
          {Object.values(sorted)
            .slice(3)
            .map(({ properties }) => {
              const { name } = properties;
              return (
                <div className={`h-[${mapHeight}px] ml-6`} key={`${name}-text`}>
                  <DotDistribution
                    data={distributionData}
                    state='NYC'
                    selectedPark={name}
                    layers={["race"]}
                    legend={false}
                    showTitle
                  />
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};

// Nearby park space per person effectively measures the available park space within a 10-minute walk
// of a micro-neighborhood, identified as those with the highest concentrations (top 20% of all census
// block groups in a city) of people of color or white population and high-income or low-income
// households. Households with income less than 75% of city median income (less than $59,000 in New
// York City) are considered low-income; households with income greater than 125% of city median
// income (greater than $98,000 in New York City) are high-income.
// In New York City, neighborhoods of color have 29% less park space than white neighborhoods, and
// low-income neighborhoods have 19% less than high-income neighborhoods.
// The metrics for people of color reflect each of the Census-designated race/ethnicity groups: Black,
// Hispanic, and Indigenous and Native American, Asian Americans, Pacific Islanders, multiple races, and
// other communities of color.
// Demographic profiles are based on 2020 Forecast block groups provided by Esri.

export default BaseMap;

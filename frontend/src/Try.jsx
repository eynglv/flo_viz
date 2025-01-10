import "@asymmetrik/leaflet-d3";
import { MapContainer, TileLayer, GeoJSON, useMap } from "react-leaflet";
import { useState, useEffect, useRef, useLayoutEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

import { coords as stateCoords } from "./helpers/constants";
import { DotDensity, DotDistribution } from "./plots";
import Legend from "./components/Legend";
import Modal from "./components/Modal";

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

  const [openModal, setOpenModal] = useState(false);
  const [modalPark, setModalPark] = useState(null);

  let offset = 3;
  const reorgParksData = parksData.features.map((feature, index) => {
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
  });

  const sorted = Object.values(reorgParksData).sort((parkData1, parkData2) => {
    const { appearanceOrder: firstAppearance } = parkData1;
    const { appearanceOrder: secondAppearance } = parkData2;
    return firstAppearance - secondAppearance;
  });

  const coords = sorted.map((feature, index) => {
    if (index === 0) return [40.78166117469302, -73.96880877926723];
    const coords = feature.geometry.coordinates[0][0][0];
    return [coords[1], coords[0]];
  });

  useEffect(() => {
    const handleScroll = (self) => {
      if (self.progress === 1) return;
      let newIndex = Math.floor(self.progress * coords.length);

      if (mapRef.current) {
        const newCoords = coords[newIndex];
        const zoomLevel = 14;
        mapRef.current.flyTo(newCoords, zoomLevel, {
          animate: true,
          duration: 1,
        });
      }
    };

    const ctx = gsap.context(() => {
      gsap.to(mapContainerRef.current, {
        scrollTrigger: {
          trigger: mapContainerRef.current,
          start: "50% 50%",
          end: "+=3000 top",
          toggleActions: "play pause resume reset",
          scrub: true,
          pin: "#pinElement",
          pinSpacing: false,
          onUpdate: (self) => handleScroll(self),
          markers: true,
        },
      });
    }, containerRef);

    return () => ctx.revert();
  }, [coords]);

  //   useGSAP(
  //     () => {
  //       if (mapContainerRef.current) {
  //         ScrollTrigger.create({
  //           trigger: mapContainerRef.current,
  //           start: "50% 50%",
  //           end: "+=100 top",
  //           toggleActions: "play pause resume reset",
  //           markers: true,
  //           scrub: true,
  //           pin: "#pinElement",
  //           pinSpacing: false,
  //           onUpdate: (self) => handleScroll(self),
  //         });
  //       }
  //     },
  //   {
  //     scope: containerRef,
  //     dependencies: [mapContainerRef.current],
  //   }
  //   );

  useGSAP(() => {
    gsap.to("#firstSentence", {
      y: -window.innerHeight,
      duration: 3,
      ease: "power2.out",
      scrollTrigger: {
        trigger: mapContainerRef.current,
        start: "50% 50%",
        // half of map end length
        end: "+=1500 top",
        toggleActions: "play pause resume reset",
        markers: true,
        scrub: true,
        id: "sentence",
      },
    });
  });

  return (
    <div className='w-full h-screen flex justify-between' ref={containerRef}>
      <div className='h-screen w-full flex' id='pinElement'>
        <div className='w-2/3 h-screen flex' ref={mapContainerRef}>
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

                  layer.on("click", () => {
                    setOpenModal(true);
                    setModalPark(feature.properties.name);
                  });
                }
              }}
            />
            {children}
            <DotDensity data={censusData} />
          </MapContainer>
          <div className='mr-3' />
          {legend && <Legend />}
        </div>
        <div className='w-1/3 self-end translate-y-full' id='firstSentence'>
          <div className='mb-[400px]' id='hello'>
            <p className='text-2xl px-4'>
              Around Central Park, Olmsted's first project, white households
              represent a majority of the micro-neighborhoods in which the park
              is a 10 minute walk away.
            </p>
            <DotDistribution
              data={distributionData}
              state='NYC'
              selectedPark={"Central Park"}
              layers={["race"]}
              legend={false}
            />
          </div>
          <div className='mb-[400px]' id='bye'>
            <p className='text-2xl px-4'>
              Prospect Park, in comparison, sees a more even ratio of white to
              people of color.
            </p>
            <DotDistribution
              data={distributionData}
              state='NYC'
              selectedPark={"Prospect Park"}
              layers={["race"]}
              legend={false}
            />
          </div>
          {/* <div>
            <p className='text-2xl px-4'>
              Nearby, Sunset Park, is one of 4 parks where more people of color
              reside.
            </p>
            <DotDistribution
              data={distributionData}
              state='NYC'
              selectedPark={"Sunset Park"}
              layers={["race"]}
              legend={false}
            />
          </div> */}
        </div>
        {openModal && (
          <Modal isOpen={openModal} onClose={() => setOpenModal(false)}>
            <DotDistribution
              data={distributionData}
              state='NYC'
              selectedPark={modalPark}
              layers={["race"]}
              legend={false}
            />
          </Modal>
        )}
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

import "@asymmetrik/leaflet-d3";
import { MapContainer, TileLayer, GeoJSON, useMap } from "react-leaflet";
import { useState, useEffect, useRef, forwardRef } from "react";

import { coords as stateCoords } from "./helpers/constants";
import DotDensity from "./plots/DotDensity";
import Legend from "./components/Legend";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

// import "./basemap.css";

gsap.registerPlugin(ScrollTrigger);

const BaseMap = ({ data, state, children, legend = true }) => {
  const parksData = data.parks;
  const censusData = data.census;

  const [currentIndex, setCurrentIndex] = useState(0);
  const mapRef = useRef(null);
  const containerRef = useRef();

  const [mapCenter, setMapCenter] = useState(stateCoords[state]);
  const [mapZoom, setMapZoom] = useState(12);

  const coords = parksData.features.map((feature) => {
    const coords = feature.geometry.coordinates[0][0][0];
    return [coords[1], coords[0]];
  });

  //   const handleScroll = (event) => {
  //     // Determine the scroll direction (up or down)
  //     const scrollDirection = event.deltaY > 0 ? "down" : "up";
  //     let newIndex = currentIndex;

  //     // Scroll down: move to the next polygon
  //     if (scrollDirection === "down") {
  //       newIndex = (currentIndex + 1) % coords.length; // Loop around to the first polygon
  //     }
  //     // Scroll up: move to the previous polygon
  //     else {
  //       newIndex = (currentIndex - 1 + coords.length) % coords.length; // Loop around to the last polygon
  //     }

  //     setCurrentIndex(newIndex);

  //     // Move/zoom the map to the new polygon
  //     if (mapRef.current) {
  //       const newCoords = coords[newIndex];
  //       const zoomLevel = 14; // You can dynamically adjust this based on the polygon size

  //       mapRef.current.flyTo(newCoords, zoomLevel, {
  //         animate: true,
  //         duration: 1,
  //       }); // Smooth animation
  //     }
  //   };

  //   // Attach scroll event listener to window
  //   useEffect(() => {
  //     window.addEventListener("scroll", handleScroll, { passive: true });

  //     // Cleanup event listener
  //     return () => {
  //       window.removeEventListener("scroll", handleScroll);
  //     };
  //   }, [currentIndex]);

  const handleScroll = (self) => {
    if (self.progress === 1) return;
    let newIndex = Math.floor(self.progress * coords.length);

    setCurrentIndex(newIndex);
    if (mapRef.current) {
      const newCoords = coords[newIndex];
      const zoomLevel = 14;
      mapRef.current.flyTo(newCoords, zoomLevel, {
        animate: true,
        duration: 1,
      });
    }
  };

  useGSAP(
    () => {
      if (containerRef.current) {
        gsap.to(containerRef.current, {
          y: 0,
          scrollTrigger: {
            trigger: containerRef.current,
            start: "50% 50%",
            toggleActions: "play pause resume reset",
            markers: true,
            scrub: true,
            pin: containerRef.current,
            onUpdate: (self) => handleScroll(self),
          },
        });

        // ScrollTrigger.create({
        //   trigger: containerRef.current,
        //   start: "50% 50%",
        //   toggleActions: "play pause resume reset",
        //   markers: true,
        //   scrub: true,
        //   pin: containerRef.current,
        //   //   pinnedContainer: gsapRef.current,
        //   //   pinSpacing: false,
        //   //   pinType: "fixed",
        //   //   pinReparent: true,
        //   //   animation:
        //   onEnter: () => {
        //     mapRef.current.setView([41.62333291567816, -72.47077885636101]);
        //   },
        //   onUpdate: (self) => {
        //     console.log(self.progress);
        //   },
        // });
      }
    },
    {
      scope: containerRef,
      dependencies: [containerRef.current],
    }
  );

  return (
    <div className='w-3/4 h-screen flex' ref={containerRef}>
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
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
                // className: "custom-tooltip", // Uncomment if you want to style the tooltip
              });

              // Show the tooltip on hover
              layer.on("mouseover", () => {
                layer.openTooltip();
              });

              // Hide the tooltip when the mouse leaves
              layer.on("mouseout", () => {
                layer.closeTooltip();
              });
            }
          }}
        />
        {children}
        {/* <DotDensity data={censusData} /> */}
      </MapContainer>
      <div className='mr-3' />
      {legend && <Legend />}
    </div>
  );
};

export default BaseMap;

// window event listener code
// const handleScroll = (event) => {
//     // Determine the scroll direction (up or down)
//     const scrollDirection = event.deltaY > 0 ? 'down' : 'up';
//     let newIndex = currentIndex;

//     // Scroll down: move to the next polygon
//     if (scrollDirection === 'down') {
//       newIndex = (currentIndex + 1) % coords.length;  // Loop around to the first polygon
//     }
//     // Scroll up: move to the previous polygon
//     else {
//       newIndex = (currentIndex - 1 + coords.length) % coords.length;  // Loop around to the last polygon
//     }

// setCurrentIndex(newIndex);

// // Move/zoom the map to the new polygon
// if (mapRef.current) {
//   const newCoords = coords[newIndex];
//   const zoomLevel = 14; // You can dynamically adjust this based on the polygon size

//   mapRef.current.flyTo(newCoords, zoomLevel, { animate: true, duration: 1 });  // Smooth animation
// }
//   };

//   // Attach scroll event listener to window
//   useEffect(() => {
//     window.addEventListener('wheel', handleScroll, { passive: true });

//     // Cleanup event listener
//     return () => {
//       window.removeEventListener('wheel', handleScroll);
//     };
//   }, [currentIndex]);

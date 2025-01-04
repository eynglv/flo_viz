import { MapContainer, TileLayer } from "react-leaflet";
import { useEffect, useRef } from "react";

import { coords } from "../../helpers/constants";
import "./animatedMap.css";

const AnimatedMap = ({ parksData }) => {
  const mapRef = useRef(null);

  useEffect(() => {
    if (mapRef.current) {
      const layerGroup = new window.L.LayerGroup();

      const animateGeoJSON = () => {
        parksData.features.forEach((feature, index) => {
          if (
            feature.geometry.type === "Polygon" ||
            feature.geometry.type === "MultiPolygon"
          ) {
            const geoJSONLayer = new window.L.GeoJSON(feature, {
              style: {
                color: "#660000",
                weight: 2,
                opacity: "85%",
              },
              onEachFeature: (feature, layer) => {
                if (
                  feature.properties.name &&
                  feature.properties.name !== "Quaker Cemetery"
                ) {
                  if (
                    feature.properties.name === "Herbert Von King Park" ||
                    feature.properties.name === "Harlem River Park"
                  ) {
                    layer.bindTooltip(feature.properties.name, {
                      permanent: true,
                      direction: "bottom",
                      className: "custom-tooltip",
                      offset: [10, 0],
                    });
                  } else {
                    layer.bindTooltip(feature.properties.name, {
                      permanent: true,
                      direction: "left",
                      className: "custom-tooltip",
                      offset: [-15, 10],
                    });
                  }
                }
              },
            });

            setTimeout(() => {
              layerGroup.addLayer(geoJSONLayer);
            }, index * 2000);
          }
        });
      };

      animateGeoJSON();

      layerGroup.addTo(mapRef.current);
    }
  }, [parksData]);

  return (
    <div className='w-[70%] h-[90%]'>
      <MapContainer
        ref={mapRef}
        center={[40.754701524748846, -73.93749692362799]}
        zoom={12}
        style={{ position: "sticky", right: 0, width: "50%", height: "100%" }}
        scrollWheelZoom={false}
        zoomControl={false}
        doubleClickZoom={false}
      >
        <TileLayer
          url='https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          maxZoom={20}
        />
      </MapContainer>
    </div>
  );
};

export default AnimatedMap;

import L from "leaflet";
import "@asymmetrik/leaflet-d3";
import { useEffect } from "react";
import { MapContainer, TileLayer, GeoJSON, useMap } from "react-leaflet";
import "d3-hexbin";

import { coords } from "../helpers/constants";
import DotDensity from "./DotDensity";

const BaseMap = ({ data, censusData, state }) => {
  return (
    <MapContainer
      center={coords[state]}
      zoom={12}
      style={{ height: "100vh", width: "100%", backgroundColor: "lightgrey" }}
      scrollWheelZoom={false}
    >
      <TileLayer
        url='https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
        // url='https://tiles.stadiamaps.com/tiles/outdoors/{z}/{x}/{y}{r}.png'
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        maxZoom={20}
      />
      {/* Parks */}
      <GeoJSON
        data={data}
        style={{ color: "green", weight: 2 }}
        pointToLayer={() => null}
      />
      {/* Data */}
      <DotDensity data={censusData} />
      {/* {censusData && <HexbinLayer censusData={censusData} />} */}
    </MapContainer>
  );
};

// TODO: change this for economic layers
const HexbinLayer = ({ censusData }) => {
  const map = useMap();

  useEffect(() => {
    if (!censusData) return;

    // Function to extract points from GeoJSON
    const extractPointsFromGeoJSON = (geojson) => {
      return geojson.features
        .filter((feature) => feature.geometry.type === "Point")
        .map((feature) => {
          const [lon, lat] = feature.geometry.coordinates;
          return [lon, lat];
        });
    };
    const points = extractPointsFromGeoJSON(censusData);

    const hexbinLayer = L.hexbinLayer({
      radius: 10,
      opacity: 0.8,
      colorRange: ["#f7fbff", "#08306b"],
      zIndex: 10000,
      duration: 500,
    })
      .data(points)
      .addTo(map);

    hexbinLayer
      .lng(function (d) {
        return d[0];
      })
      .lat(function (d) {
        return d[1];
      });

    return () => {
      if (hexbinLayer) {
        map.removeLayer(hexbinLayer);
      }
    };
  }, [censusData, map]);

  return null;
};

export default BaseMap;

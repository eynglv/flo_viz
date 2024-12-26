import L, { featureGroup } from "leaflet";
import "@asymmetrik/leaflet-d3";
import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, GeoJSON, useMap } from "react-leaflet";
import "d3-hexbin";

import { coords, adjustedBins, incomeColorScale } from "../helpers/constants";
import DotDensity from "./DotDensity";
import Legend from "../components/Legend";
import { hexbin } from "d3-hexbin";
import * as d3 from "d3";
import { geoPath, geoAlbers, geoMercator } from "d3";

const BaseMap = ({ data, state, children }) => {
  const parksData = data.parks;
  const censusData = data.census;

  return (
    <div className='w-3/4 h-screen flex'>
      <MapContainer
        center={coords[state]}
        zoom={12}
        style={{ width: "100%", height: "100%" }}
        scrollWheelZoom={false}
      >
        <TileLayer
          url='https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          maxZoom={20}
        />
        {/* Parks */}
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
                permanent: true,
                direction: "center",
                className: "polygon-label",
              });
            }
          }}
        />
        {children}
        <DotDensity data={censusData} />
        {/* {censusData && <HexbinLayer censusData={censusData} />} */}
        {/* <GeoJSON data={censusData} style={getStyle} pointToLayer={() => null} /> */}
        {/* <GeoJSON
        data={censusData}
        style={{ color: "blue", weight: 2 }}
        pointToLayer={() => null}
      /> */}
        {/* Data */}
        {/* <TestHexbinLayer center={coords[state]} /> */}
        {/* <MoreHexbinLayers width='200' height='200' filteredTracts={censusData} /> */}
      </MapContainer>
      <div className='mr-3' />
      <Legend />
    </div>
  );
};

const MoreHexbinLayers = ({ width, height, filteredTracts, hexRadius = 5 }) => {
  const map = useMap();

  useEffect(() => {
    const pane = map.createPane("hexbinPane");
    pane.style.zIndex = 20000;
    const svg = d3.select(pane).append("svg").attr("class", "hexbin-svg");
    // .style("position", "absolute");

    const g = svg.append("g").attr("class", "hexbin-layer");
    const updateHexbins = () => {
      const bounds = map.getBounds();
      const topLeft = map.latLngToLayerPoint(bounds.getNorthWest());
      const bottomRight = map.latLngToLayerPoint(bounds.getSouthEast());

      svg
        .style("width", `${bottomRight.x - topLeft.x}px`)
        .style("height", `${bottomRight.y - topLeft.y}px`)
        .style("left", `${topLeft.x}px`)
        .style("top", `${topLeft.y}px`);

      g.attr("transform", `translate(${-topLeft.x},${-topLeft.y})`);

      const points = filteredTracts.features.map((feature) => {
        const [lat, lng] = feature.geometry.coordinates;

        const point = map.latLngToLayerPoint([lat, lng]);
        return [point.x, point.y];
      });

      // const points = filteredTracts.features.flatMap((feature) => {
      //   const coordinates = feature.geometry.coordinates;

      //   return coordinates[0][0].map(([lng, lat]) => {
      //     const point = map.latLngToLayerPoint([lat, lng]);
      //     return [point.x, point.y];
      //   });
      // });

      const hexbinGenerator = hexbin()
        .extent([
          [0, 0],
          [bottomRight.x - topLeft.x, bottomRight.y - topLeft.y],
        ])
        .radius(10);

      const hexagons = g.selectAll(".hexagon").data(hexbinGenerator(points));

      hexagons
        .enter()
        .append("path")
        .attr("class", "hexagon")
        .merge(hexagons)
        .attr("d", (d) => hexbinGenerator.hexagon())
        .attr("transform", (d) => `translate(${d.x},${d.y})`)
        .style("fill", "blue")
        .style("stroke", "black")
        .style("stroke-width", 0.5);

      hexagons.exit().remove();
    };

    map.on("moveend", updateHexbins);
    map.on("zoomend", updateHexbins);

    updateHexbins();

    return () => {
      map.removeLayer(pane);
    };
  }, [filteredTracts, height, hexRadius, map, width]);

  return null;
};

const TestHexbinLayer = ({ center }) => {
  const map = useMap();
  const latFn = d3.randomNormal(center[0], 0.01);
  const longFn = d3.randomNormal(center[1], 0.01);

  useEffect(() => {
    const generateTestData = function () {
      const data = [];
      for (let i = 0; i < 1000; i++) {
        data.push([longFn(), latFn()]);
      }
      return data;
    };
    const data = generateTestData();
    const hexbinLayer = L.hexbinLayer({
      radius: 10,
      opacity: 0.8,
      colorRange: ["#af8dc3", "#2ca25f"],
      zIndex: 10000,
      duration: 500,
    })
      .data(data)
      .addTo(map);

    hexbinLayer
      .radiusRange([6, 11])
      .lng(function (d) {
        return d[0];
      })
      .lat(function (d) {
        return d[1];
      });
  }, [latFn, longFn, map]);

  return null;
};

// TODO: change this for economic layers
const HexbinLayer = ({ censusData }) => {
  const map = useMap();

  useEffect(() => {
    if (!censusData) return;

    // Function to extract points from GeoJSON
    let points = [];
    const colorValueHash = {};
    const extractPointsFromGeoJSON = (geojson) => {
      return geojson.features
        .filter((feature) => feature.geometry.type === "Point")
        .forEach((feature) => {
          const [lon, lat] = feature.geometry.coordinates;
          const incomeLevel = feature.properties.layer;
          const key = `${lon},${lat}`;
          points.push([lon, lat]);
          colorValueHash[key] = incomeLevel;
        });
    };

    extractPointsFromGeoJSON(censusData);

    const hexbinLayer = L.hexbinLayer({
      radius: 20,
      opacity: 0.8,
      colorRange: ["#fde0dd", "#c51b8a"],
      zIndex: 0,
      duration: 200,
    })
      .data(points)
      .addTo(map);

    const incomeMap = Object.keys(incomeColorScale).reduce(
      (colorsHash, currVal, currIndex) => {
        colorsHash[currVal] = currIndex + 1;
        return colorsHash;
      },
      {}
    );

    hexbinLayer
      .lng((d) => d[0])
      .lat((d) => d[1])
      .colorValue((data) => {
        const point = data[0];
        const center = point.o;
        const key = `${center[0]},${center[1]}`;
        const incomeLevel = colorValueHash[key];

        return incomeMap[incomeLevel] || 0;
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

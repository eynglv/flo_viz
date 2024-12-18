import L from "leaflet";
import { GeoJSON } from "react-leaflet";
import { raceColorScale } from "../helpers/constants";

const DotDensity = ({ data }) => {
  const getTailwindColor = (className) => {
    const div = document.createElement("div");
    div.className = className;
    document.body.appendChild(div);
    const color = getComputedStyle(div).backgroundColor;
    document.body.removeChild(div);
    return color;
  };

  const tailwindColorMap = Object.keys(raceColorScale).reduce((acc, key) => {
    acc[key] = getTailwindColor(raceColorScale[key][0]);
    return acc;
  }, {});

  return (
    <GeoJSON
      data={data}
      pointToLayer={(feature, latlng) => {
        const marker = L.circleMarker(latlng, {
          radius: 2,
          fillColor: tailwindColorMap[feature.properties.layer],
          fillOpacity: 0.85,
          stroke: false,
        });
        return marker;
      }}
    />
  );
};

export default DotDensity;

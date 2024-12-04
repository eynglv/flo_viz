import L from "leaflet";
import { GeoJSON } from "react-leaflet";
import { raceColorScale } from "../helpers/constants";

const DotDensity = ({ data }) => {
  return (
    <GeoJSON
      data={data}
      pointToLayer={(feature, latlng) => {
        const marker = L.circleMarker(latlng, {
          radius: 2,
          fillColor: raceColorScale[feature.properties.layer],
          fillOpacity: 0.85,
          stroke: false,
        });
        return marker;
      }}
    />
  );
};

export default DotDensity;

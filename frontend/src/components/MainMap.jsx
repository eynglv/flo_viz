import {
  MapContainer,
  TileLayer,
  GeoJSON,
  Marker,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import { useRef, useState } from "react";

import { coords as stateCoords } from "../helpers/constants";

const useZoomLevel = (setZoomLevel) => {
  useMapEvents({
    zoom: (e) => {
      setZoomLevel(e.target.getZoom());
    },
  });
  return null;
};

const MainMap = ({ mapsData, censusData }) => {
  const mapRef = useRef();
  const [zoomLevel, setZoomLevel] = useState(6);
  console.log(zoomLevel);

  return (
    <div className='w-full h-full'>
      <MapContainer
        center={[37.64778732914184, -82.73974810380669]}
        zoom={6}
        style={{ width: "100%", height: "100%" }}
        minZoom={6}
        ref={mapRef}
        whenCreated={(mapInstance) => {
          mapRef.current = mapInstance;
        }}
      >
        <TileLayer
          url='https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          maxZoom={20}
        />
        <ZoomLevel setZoomLevel={setZoomLevel} />
        {zoomLevel < 12 && (
          <CustomMarker
            onClick={(target) => {
              const { lat, lng } = target.latlng;
              mapRef.current.flyTo([lat, lng], 14, {
                animate: true,
                duration: 1,
              });
            }}
            setZoomLevel={setZoomLevel}
            zoomLevel={zoomLevel}
          />
        )}
      </MapContainer>
    </div>
  );
};

const ZoomLevel = ({ setZoomLevel }) => {
  return <div>{useZoomLevel(setZoomLevel)}</div>;
};

const CustomMarker = ({ onClick, zoomLevel }) => {
  const defaultIcon = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  return (
    <div>
      {Object.entries(stateCoords).map(([state, coords]) => {
        return (
          <Marker
            position={coords}
            key={state}
            icon={defaultIcon}
            eventHandlers={{
              click: onClick,
            }}
            style={{
              display: zoomLevel >= 12 ? "none" : "block",
            }}
          />
        );
      })}
    </div>
  );
};

export default MainMap;

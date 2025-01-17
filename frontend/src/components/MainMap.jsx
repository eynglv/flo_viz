import {
  MapContainer,
  TileLayer,
  GeoJSON,
  Marker,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import { useMemo, useRef, useState } from "react";

import { coords as stateCoords } from "../helpers/constants";
import { DotDensity, DotDistribution } from "../plots";
import Modal from "./Modal";
import BubbleContent from "../content/BubbleContent";

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
  //   set custom zoom options
  const [zoomLevel, setZoomLevel] = useState(6);
  const [state, setState] = useState(null);
  const [selectedPark, setSelectedPark] = useState(null);
  const [openModal, setOpenModal] = useState(false);

  const focusedStateData = useMemo(() => mapsData[state], [mapsData, state]);

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
          <div>
            {Object.entries(stateCoords).map(([state, coords]) => {
              return (
                <CustomMarker
                  onClick={(target) => {
                    const { lat, lng } = target.latlng;
                    mapRef.current.flyTo([lat, lng], 12, {
                      animate: true,
                      duration: 1,
                    });
                    setState(state);
                  }}
                  setZoomLevel={setZoomLevel}
                  zoomLevel={zoomLevel}
                  state={state}
                  coords={coords}
                  key={state}
                />
              );
            })}
          </div>
        )}
        {zoomLevel >= 12 && (
          <div>
            <GeoJSON
              data={focusedStateData.parks}
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
                    setSelectedPark(feature.properties.name);
                  });
                }
              }}
            />
            <DotDensity data={focusedStateData.census} />
          </div>
        )}
      </MapContainer>
      {openModal && (
        <Modal isOpen={openModal} onClose={() => setOpenModal(false)}>
          <BubbleContent
            censusData={censusData}
            state={state}
            selectedPark={selectedPark}
          />
        </Modal>
      )}
    </div>
  );
};

const ZoomLevel = ({ setZoomLevel }) => {
  return <div>{useZoomLevel(setZoomLevel)}</div>;
};

const CustomMarker = ({ onClick, zoomLevel, coords, state }) => {
  const defaultIcon = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  return (
    <Marker
      position={coords}
      icon={defaultIcon}
      eventHandlers={{
        click: onClick,
      }}
      style={{
        display: zoomLevel >= 12 ? "none" : "block",
      }}
    />
  );
};

export default MainMap;

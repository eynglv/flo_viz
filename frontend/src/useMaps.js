import { createContext, useContext, useState, useEffect } from "react";

import { coords, layers } from "./helpers/constants";

const MapsContext = createContext(null);

export const MapsProvider = ({ children }) => {
    const [mapsData, setMapsData] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);


    const fetchData = async (state, layerType, layerFileName) => {

        try {
            const parksResponse = await fetch(`http://localhost:5050/api/geojson?state=${state}&file=parks.geojson`);
            const censusResponse = await fetch(`http://localhost:5050/api/geojson?state=${state}&subdir=${layerType}&file=${layerFileName}`)

            if (parksResponse.ok && censusResponse.ok) {
                const parks = await parksResponse.json();
                const census = await censusResponse.json();
                const newMapData = { parks, census };

                setMapsData((prev) => ({ ...prev, [state]: newMapData }));
                return newMapData;
            }
        } catch (error) {
            console.error(`Error fetching data for ${state}:`, error);
        }
    };

    useEffect(() => {
        const states = Object.keys(coords);
        const fileName = 'parks.geojson'
        const layerFileName = 'total_distribution.geojson'
        const layerType = layers.Race.layer

        const fetchAllData = async () => {
            try {
                const data = {};
                for (const state of states) {
                    const parksResponse = await fetch(`http://localhost:5050/api/geojson?state=${state}&file=${fileName}`);
                    const censusResponse = await fetch(`http://localhost:5050/api/geojson?state=${state}&subdir=${layerType}&file=${layerFileName}`)

                    if (parksResponse.ok && censusResponse.ok) {
                        const parks = await parksResponse.json();
                        const census = await censusResponse.json();
                        data[state] = { parks, census };
                    } else {
                        throw new Error(`Failed to fetch data for ${state}`);
                    }
                }
                setMapsData(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }

        }
        fetchAllData();
    }, [])


    return (
        <MapsContext.Provider value={{ mapsData, fetchData, loading, error }}>
            {children}
        </MapsContext.Provider>
    );
}

export const useMaps = () => useContext(MapsContext);
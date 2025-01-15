import { createContext, useContext, useState, useEffect } from "react";
import { coords, layers } from "./helpers/constants";

const HomeContext = createContext(null);

export const HomeProvider = ({ children }) => {
    const [censusData, setCensusData] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const states = Object.keys(coords);
        const fileNames = ['race_data.csv', 'income_data.csv', 'age_data.csv'];

        const fetchAllData = async () => {
            try {
                const data = {};
                for (const state of states) {

                    for (const fileName of fileNames) {
                        const nominalName = fileName.split('.')[0]
                        const censusResponse = await fetch(`http://localhost:5050/api/data?state=${state}&file=${fileName}`);

                        if (censusResponse.ok) {
                            const censusData = await censusResponse.json();
                            data[state] = {
                                ...data[state], [nominalName]: censusData
                            };
                        } else {
                            throw new Error(`Failed to fetch data for ${state}`);
                        }
                    }
                }
                setCensusData(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }

        }
        fetchAllData();
    }, [])

    return (
        <HomeContext.Provider value={{ censusData, loading, error }}>{children}</HomeContext.Provider>
    )
}

export const useHome = () => useContext(HomeContext)


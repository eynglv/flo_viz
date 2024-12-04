import './App.css';
import { useState, useEffect } from 'react';
import 'leaflet/dist/leaflet.css';


import { StackedBarChart, BaseMap } from './Plots';
import { raceCategories, incomeCategories, raceColorScale, incomeColorScale } from './helpers/constants'


function App() {
  const [data, setData] = useState(null);
  const [state, setState] = useState("NYC")
  const [fileName, setFileName] = useState("parks.geojson")
  const [layerFileName, , setlayerFileName] = useState("total_distribution.geojson")
  const [hispanicData, setHispanicData] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`http://localhost:5050/api/geojson?state=${state}&file=${fileName}`);
        const censusResponse = await fetch(`http://localhost:5050/api/geojson?state=${state}&subdir=race_layers&file=${layerFileName}`)

        const result = await response.json();
        const censusResult = await censusResponse.json()

        if (response.ok && censusResponse.ok) {
          setData(result);
          setHispanicData(censusResult)
        } else {
          console.error('Error:', result.error);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }
    fetchData()
  }, [fileName, layerFileName, state]);
  if (!data || !hispanicData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="App">
      <div style={{ marginTop: 100 }}>
        <BaseMap data={data} censusData={hispanicData} state={state} />
      </div>
    </div>
  );
}

export default App;

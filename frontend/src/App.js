import './App.css';
import { useState, useEffect } from 'react';
import { StackedBarChart } from './Plots';

import { raceCategories, incomeCategories, raceColorScale, incomeColorScale } from './helpers/constants'

function App() {
  const [data, setData] = useState(null);
  const [state, setState] = useState("Massachusetts")
  const [fileName, setFileName] = useState("income_data.csv")

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`http://localhost:5050/api/data?state=${state}&file=${fileName}`);

        const result = await response.json();

        if (response.ok) {
          setData(result);
        } else {
          console.error('Error:', result.error);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }
    fetchData()
  }, [fileName, state]);

  if (!data) {
    return <div>Loading...</div>;
  }

  return (
    <div className="App">
      <div style={{ marginTop: 100 }}>
        <StackedBarChart data={data} selectedPark={"Olmsted Park"} domainCategories={incomeCategories} totalSelector={'total_households_income_benefits'} colorScale={incomeColorScale} />
      </div>
    </div>
  );
}

export default App;

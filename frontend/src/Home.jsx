import { BaseMap } from "./Plots";
import { useMaps } from "./useMaps";

const Home = () => {
  const { mapsData, loading, error } = useMaps();

  if (loading) {
    return <h1>Loading...</h1>;
  } else if (error) {
    return null;
  }

  return (
    <div>
      <BaseMap
        data={mapsData["NYC"].parks}
        censusData={mapsData["NYC"].census}
        state={"NYC"}
      />
    </div>
  );
};

export default Home;

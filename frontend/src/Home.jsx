import { BaseMap } from "./plots";
import { useMaps } from "./useMaps";
import { useHome } from "./useHome";
import { GridContainer } from "./components/Grid";
import Legend from "./components/Legend";
import DotDistribution from "./plots/DotDistribution";
import StackedBarChart from "./plots/StackedBarChart";
import {
  raceColorScale,
  raceCategories,
  incomeColorScale,
  incomeCategories,
  layers,
} from "./helpers/constants";
import AnimatedMap from "./components/AnimatedMap/AnimatedMap";

const Home = () => {
  const { mapsData, loading, error } = useMaps();
  const { censusData, loading: censusLoading, error: censusError } = useHome();

  if (loading || censusLoading) {
    return <h1>Loading...</h1>;
  } else if (error || censusError) {
    return null;
  }

  return (
    <div className='w-screen mx-8'>
      <div className='w-full h-svh flex justify-between items-center'>
        <div>
          <h1 className='text-5xl mb-3'>TLDR of essay</h1>
          <div className='flex items-center animate-bounce'>
            <DownArrowIcon />
            <p className='ml-2'>Scroll</p>
          </div>
        </div>
        <AnimatedMap parksData={mapsData["NYC"].parks} />
        {/* <BaseMap data={mapsData["Massachusetts"]} state={"Massachusetts"} /> */}
        {/* <StackedBarChart
        data={censusData["Massachusetts"]}
        selectedPark={"Franklin Park"}
        type={layers.Income}
      /> */}
        {/* <DotDistribution data={censusData} state='Massachusetts' /> */}
        {/* <GridContainer data={mapsData} /> */}
      </div>
    </div>
  );
};

const DownArrowIcon = () => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    fill='none'
    viewBox='0 0 24 24'
    strokeWidth={1.5}
    stroke='currentColor'
    className='size-6'
  >
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      d='m9 12.75 3 3m0 0 3-3m-3 3v-7.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z'
    />
  </svg>
);

export default Home;

import { raceColorScale, raceCategories } from "../helpers/constants";

const Legend = () => (
  <div className='w-44 h-60 border-4 border-slate-900 rounded-md flex flex-col flex-wrap justify-evenly content-center text-black bg-gray-100'>
    <p className='font-semibold text-lg'>Map Key</p>
    <p className='text-xs'>one dot = 100 people</p>
    {Object.entries(raceCategories).map(([key, displayName]) => {
      return (
        <div className='w-4/5 flex flex-wrap items-center' key={displayName}>
          <div className={`w-4 h-4 rounded-full ${raceColorScale[key][0]}`} />
          <div className='mr-4' />
          <p className='text-center'>{displayName}</p>
        </div>
      );
    })}
  </div>
);
export default Legend;

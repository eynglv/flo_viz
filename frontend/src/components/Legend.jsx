import { raceColorScale, raceCategories } from "../helpers/constants";

const Legend = () => (
  <div className='w-32 h-48 border-2 border-slate-900 rounded-md flex flex-col flex-wrap justify-evenly content-center text-black bg-gray-100'>
    <p className='font-semibold text-base'>Map Key</p>
    <p className='text-xs'>one dot = 100 people</p>
    {Object.entries(raceCategories).map(([key, displayName]) => {
      return (
        <div className='w-4/5 flex flex-wrap items-center' key={displayName}>
          <div className={`w-3 h-3 rounded-full ${raceColorScale[key][0]}`} />
          <div className='mr-4' />
          <p className='text-center text-sm'>{displayName}</p>
        </div>
      );
    })}
  </div>
);
export default Legend;

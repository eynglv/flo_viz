import { raceColorScale, raceCategories } from "../helpers/constants";

const Legend = () => (
  <div className='w-32 h-48 border-4 border-slate-900 rounded-md flex flex-col flex-wrap justify-evenly content-center'>
    <p className='font-semibold text-lg'>Map Key</p>
    {Object.entries(raceCategories).map(([key, displayName]) => {
      return (
        <div
          className='w-4/5 flex flex-wrap items-center justify-between'
          key={displayName}
        >
          <div className={`w-4 h-4 rounded-full ${raceColorScale[key]}`} />
          <p className='text-center'>{displayName}</p>
        </div>
      );
    })}
  </div>
);
export default Legend;

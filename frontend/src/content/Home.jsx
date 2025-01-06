const Home = () => (
  <div className='w-full h-svh flex flex-col justify-evenly'>
    <div>
      <h1 className='text-4xl mb-3'>
        Frederick Law Olmsted, known best for his epochal design of New York's
        Central Park, is regarded as the father of American landscape
        architecture.
      </h1>
      <div className='flex items-center animate-bounce'>
        <DownArrowIcon />
        <p className='ml-2 text-xl'>Scroll</p>
      </div>
    </div>
    <p className=''>By Elvy Yang</p>
  </div>
);

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

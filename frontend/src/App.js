import './App.css';
import 'leaflet/dist/leaflet.css';

import { MapsProvider } from './useMaps';
import { HomeProvider } from './useHome';
import Home from './Home';


function App() {
  return (
    <div className='font-serif bg-green-900 min-h-screen text-green-100'>
      <HomeProvider>
        <MapsProvider>
          <Home />
        </MapsProvider>
      </HomeProvider>
    </div>
  );
}

export default App;

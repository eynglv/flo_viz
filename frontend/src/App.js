import './App.css';
import { useState, useEffect } from 'react';
import 'leaflet/dist/leaflet.css';


import { layers, coords } from './helpers/constants'
import { MapsProvider } from './useMaps';
import { HomeProvider } from './useHome';
import Home from './Home';


function App() {
  return (
    <div className="App">
      <HomeProvider>
        <MapsProvider>
          <Home />
        </MapsProvider>
      </HomeProvider>
    </div>
  );
}

export default App;

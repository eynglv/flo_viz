import './App.css';
import { useState, useEffect } from 'react';
import 'leaflet/dist/leaflet.css';


import { layers, coords } from './helpers/constants'
import { MapsProvider } from './useMaps';
import Home from './Home';


function App() {
  return (
    <div className="App">
      <MapsProvider>
        <Home />
      </MapsProvider>
    </div>
  );
}

export default App;

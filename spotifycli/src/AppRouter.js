// import  from "react";
import HomePage from "./components/Homepage";
import { BrowserRouter as Router, Route } from "react-router-dom";
import React from 'react';
// import './index.css';

// import SpotifyArtists from './components/SpotifyArtists'
import SpotifyArtists from './components/Examples/Exam'
// import SpotifyTracks from './components/SpotifyTracks'
export const AppRouter = () => {

  return (
    <Router>
      <div>
        <Route exact path="/" component={HomePage} />
        <Route exact path="/artists" component={SpotifyArtists} />
   
        {/* <Route exact path="/tracks" component={SpotifyTracks} /> */}
      </div>
    </Router>
  );
};
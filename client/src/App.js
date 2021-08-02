import React, { useEffect, useState} from "react";
import "./App.css";
import Centerpiece from "./Components/Centerpiece/Centerpiece";
import Search from "./Components/Search/Search";
import SpotifyLogin from "./Components/SpotifyLogin/SpotifyLogin";
import Weather from "./Components/Weather/Weather"
// import Landing from "/assets/Landing.gif"

function App() {
  const [weather, setWeather] = useState({});
  const [showPlayer, setShowPlayer] = useState(false)
  const [tracks, setTracks] = useState({})

  function offPlayer() {
    setShowPlayer(false)
    setTracks({})
    setWeather({})
  }

  function callback(val) {
    setShowPlayer(true)
    setWeather(val);
  }

  return (
    // <div className='App' style={ !showPlayer ? {backgroundImage: `url('/assets/Landing.gif')`} : {}}>
    <div className='App'>
      {!showPlayer &&
        <video className={'landing bg'} autoPlay={true} loop={true} muted={true} controls={false}>
          <source src={`/assets/Landing.mp4`} type='video/mp4'/>
        </video>
      }
      
      <div className={`header ${showPlayer ? "expand" : ""}`}>
        <h1 onClick={offPlayer} className={`heading ${showPlayer ? "expand" : ""}`}><p className="transition">v</p>ibes</h1>
        <SpotifyLogin/>
      </div>

      <Weather weather={weather? weather : ''}/>
      
      <Centerpiece weather={weather? weather : ''}/>

      <div className={`main ${showPlayer ? "expand" : ""}`}>
        {!showPlayer
          ? <Search callback={callback} mode={"Submit"}/>
          : <Search callback={callback} mode={"Refresh"}/>
        }
      </div>
    </div>
  );
}

export default App;


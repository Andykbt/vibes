import { useState, useReducer, useEffect } from "react"
import fetch from "node-fetch";
import classes from './Search.module.css'
import Recommendations from "../Recommendations/Recommendations";
import { animated, useSpring } from 'react-spring';

const formReducer = (state, event) => {
    return {
      [event.name]: event.value
    }
}
  
const Search = (props) => {
  {/*
      FORM HANDLING and rendering search results
  */}
  const [formData, setFormData] = useReducer(formReducer, {})
  const [submitting, setSubmitting] = useState(false)
  const [results, setResults] = useState(null);

  const handleChange = event => {
    setFormData({
      name: event.target.name,
      value: event.target.value
    })
  }

  const handleSubmit = event => {
      event.preventDefault();
      setSubmitting(true)

      if (props.mode === "Submit") {
        setTimeout(() => {
        Object.entries(formData).map(([name, value]) => (
            getCity(value.toString())
        ))

        setSubmitting(false)
        }, 0)
      } else {
        
      }
  }

  function renderResults() {
    if (results === 0) {
        return(<h1>No results found</h1>)
      } else {
        let cities = [];
  
        for (var i = 0; i < results.length; i++) {
          let cityName = results[i].matching_full_name
          let str = results[i]._links['city:item'].href
          let n = str.lastIndexOf("geonameid:") + 10; 
  
          str = str.substring(n).slice(0, -1)
  
          cities.push({
            city: cityName,
            geocodeID: str
          })
        }
        return(
          cities.map((data, index) => <a id={index} onClick={() => {getWeather(data.geocodeID);}}>{data.city}</a>)
        )
      }
    }
    
  function getCity(city) {
    fetch('/city', {
      method: 'post',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({
          city: city
      })
    }).then(res => res.json())
    .then(data => {
      setResults(data)
    });
  }

  {/*
    Getting weather
  */}
  const [weather, setWeather] = useState({})
  function getWeather(cityID) {
    setResults({})
    fetch('/weather', {
      method: 'post',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({
          cityID: cityID
      })
    }).then(res => res.json())
      .then(data => {
        setWeather(data)
        props.callback(data)
        getRecommendations()
      });
  }

  /*
    Getting recommendations
  */
  const [tracks, setTracks] = useState({})
  function getRecommendations() {
    fetch('/recommendations')
    .then(res => res.json())
    .then(res => res.tracks)
    .then(tracks => {
      var queue = []
      for (var i = 0; i < tracks.length; i++) {
        queue.push({
            Title: tracks[i].name,
            Artist: tracks[i].artists[0].name,
            Image: tracks[i].album.images[1].url,
            External_link: tracks[i].external_urls.spotify
          })
      }
      setTracks(queue)
    })
  }

  const [loading, setLoading] = useState(false);

  function refreshRecommendations() {
    if (!loading) {
      setLoading(true)
      setTracks({})
      
      setTimeout(() => {
        console.log("getting new tracks")
        getRecommendations()

        setTimeout(() => {
          setLoading(false)
        }, 4000)

      }, 3000)
    }
  }

  useEffect(() => {
    if (props.mode === "Submit") {
      setTracks({})
    }
  }, [props.mode])



  return(
      <div>
          <form className={classes.searchbox} onSubmit={handleSubmit}>
            {props.mode === "Submit" ?
              <input className={classes.searchbox} type="text" placeholder="Enter a city..." onChange={handleChange}></input>
              : <Recommendations tracks={tracks}/> 
            }
            <button className={`${props.mode === "Refresh" ? classes.refresh : classes.sub} ${loading ? classes.spin : ""}`}
              onClick={props.mode === "Refresh" ? refreshRecommendations : null}
            />
          </form>
  
          {results && props.mode == "Submit" &&
              <section className={classes.resultsContainer}>
                  { renderResults() }
              </section>
          }
      </div>
  )
}

export default Search
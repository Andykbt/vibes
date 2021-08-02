const cookieParser = require('cookie-parser')
const querystring = require('querystring');
const fetch = require('node-fetch');
const request = require('request');
const express = require("express");
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: require('find-config')('.env') })

const client_id = process.env.spotify_client
const client_secret = process.env.spotify_secret
const redirect_uri = 'http://localhost:3000/callback'

const PORT = process.env.PORT || 3001;
const app = express();

var spotifyAccessToken = "";
var cityID = "";
var weather = {};

app.use(cors())
.use(express.urlencoded())
.use(express.json())
.use(cookieParser())

app.use(express.static(path.join(__dirname, 'build')));

app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'build/', 'index.html'))
})

const spotifyGenres = [
    "acoustic",
    "chill",
    "classical",
    "club",
    "country",
    "dance",
    "deep-house",
    "disco",
    "edm",
    "electronic",
    "folk",
    "french",
    "funk",
    "happy",
    "hip-hop",
    "house",
    "indie-pop",
    "jazz",
    "k-pop",
    "latin",
    "movies",
    "party",
    "pop",
    "piano",
    "punk",
    "r-n-b",
    "rainy-day",
    "road-trip",
    "rock",
    "romance",
    "sad",
    "soul",
    "study",
    "summer",
    "work-out",
];

const setAccessToken = () => {
  request.post({
    url: 'https://accounts.spotify.com/api/token',
    headers: {
      'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
    },
    form: {
      grant_type: 'client_credentials'
    },
    json: true
  }, function(err, response, body) {
    if (!err && response.statusCode === 200) {
      spotifyAccessToken = body.access_token;
    }
  })
}

const tokenRefresher = () => {
  setAccessToken()
  setTimeout(() => {
    tokenRefresher()
  }, 3500000)
}

tokenRefresher();

app.post('/city', function(req, res) {
    fetch(`https://api.teleport.org/api/cities/?search=${req.body.city}&limit=10`)
    .then(response => response.json())
    .then(response => {
        res.send(response._embedded['city:search-results']);
    })
    .catch(err => console.log(err))
});

app.post('/weather', function(req, res){
    console.log("Getting weather data...")
    cityID = req.body.cityID
    fetch(`http://api.openweathermap.org/data/2.5/weather?id=${cityID}&appid=${process.env.weather_key}&units=metric`)
    .then(response => response.json())
    .then(response => {
      weather = response;
      console.log(response);
      res.send(response)
    })
    .catch(err => console.log(err))
});

//
//  Get Recommendations from Spotify
// 

var generateRandomString = function(length) {
    var text = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  
    for (var i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  };

var stateKey = 'spotify_auth_state';

app.get('/login', function(req, res) {
    var scope = 'user-read-private user-read-email streaming user-read-email';
    var state = generateRandomString(16);
    res.cookie(stateKey, state)

    res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri,
      state: state
    }));
})

app.get('/callback', function(req, res) {
  var code = req.query.code || null;
  var state = req.query.state || null;
  var storedState = req.cookies ? req.cookies[stateKey] : null;

  if (state === null || state !== storedState) {
    res.redirect('/#' +
      querystring.stringify({
        error: 'state_mismatch'
      }));
  } else {
    res.clearCookie(stateKey);
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: redirect_uri,
        grant_type: 'authorization_code'
      },
      headers: {
        'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
      },
      json: true
    };

    request.post(authOptions, function(error, response, body) {
      if (!error && response.statusCode === 200) {

        var access_token = body.access_token,
            refresh_token = body.refresh_token;
        
        spotifyAccessToken = access_token;

        res.redirect('http://localhost:3000/#' +
          querystring.stringify({
            access_token: access_token,
            refresh_token: refresh_token
          }));
      } else {
        res.redirect('/#' +
          querystring.stringify({
            error: 'invalid_token'
          }));
      }
    });
  }
})


app.get('/recommendations', function(req, res) {
  console.log("Getting recommendations...")
  var weatherID = weather?.weather[0].ID
  var features = {};

  features.min_popularity = 70;

  if (weatherID < 300) {  //Thunder
    features.min_danceability = 0.75,
    features.min_energy = 0.75,
    features.min_tempo = 140
  } else if (weatherID < 600) { //Rain
    features.max_valence = 0.5,
    features.max_tempo = 120,
    features.max_energy = 0.6
  } else if (weatherID < 800) { //Snow
    min_danceability = 0.65,
    min_valence = 0.4,
    max_tempo = 150,
    min_tempo = 100
  } else if (weatherID === 800) { //Clear
    features.min_valence = 0.5,
    features.min_tempo = 100,
    features.min_energy = 0.6
  } else if (weatherID > 800) { //Cloudy
    features.max_valence = 0.7,
    features.min_valence = 0.3
  }
  
  const shuffled = spotifyGenres.sort(() => .5 - Math.random());
  let genres = shuffled.slice(0,2).join(',') ;

  features = JSON.stringify(features)
  features = features.replace(/[{}'"]+/g, '');
  features = features.split(':').join('=');
  features = features.split(',').join('&');

  fetch(`https://api.spotify.com/v1/recommendations?limit=5&market=AU&seed_genres=${genres}&${features}`, {
      headers: {  'Authorization': `Bearer ${spotifyAccessToken}`  },
  }).then(response => response.json())
  .then(response => {
    console.log(response)
    res.json(response)
  })
  .catch(err => console.log(err))
})
  
app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
});


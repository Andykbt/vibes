import fetch from "node-fetch";
import React, { useEffect, useState } from "react";


function getHashParams() {
    var hashParams = {};
    var e, r = /([^&;=]+)=?([^&;]*)/g,
        q = window.location.hash.substring(1);
    while ( e = r.exec(q)) {
      hashParams[e[1]] = decodeURIComponent(e[2]);
    }
  
    return hashParams;
  }

const SpotifyLogin = () => {
    const [params, setParams] = useState({});
    const [displayName, setDisplayName] = useState("")
    
    useEffect(() => {
        setParams(getHashParams());
    }, [])

    useEffect(() => {
        getUser()
    }, [params])

    const getUser = () => {
        fetch('https://api.spotify.com/v1/me', {
            headers: {'Authorization': 'Bearer ' + params.access_token},
            json: true
        }).then(res => res.json())
        .then(res => {
            setDisplayName(res.display_name)
        })
    }

    return(
        <div className="spotify">
            {params.access_token ?
                <div>
                    {displayName ?
                        <a href="">Hi, <span>{displayName}</span></a>
                    :   <a href="">Logout</a>
                    }
                </div>
            :<a href="https://vibes-spotify.herokuapp.com/login">Login with <span>Spotify</span></a>
            }
        </div>
    )
}

export default SpotifyLogin
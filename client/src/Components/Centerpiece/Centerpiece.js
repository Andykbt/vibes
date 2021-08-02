import { useEffect, useState } from 'react'
import { animated, useSpring, useSpringRef, useTransition, useChain } from 'react-spring';
import classes from './Centerpiece.module.css'

export default function Centerpiece({weather}) {
    const [imageSrc, setSrc] = useState("")

    const transition = useTransition(weather.cod === 200 ? weather : [], {
        from: { opacity: 0, transform: "translateX(-50%) translateY(0%)", scale: 0 },
        enter: { opacity: 1, transform: "translateX(-50%) translateY(0%)", scale: 1 },
        leave: { opacity: 0, transform: "translateX(-50%) translateY(0%)", scale: 0 },
        config: { duration: 1000, delay: 1000 }
    });

    function handleWeather(weather) {
        var weatherID = weather?.weather[0].id;
        if (weatherID < 300) {  //Thunder
            setSrc("/assets/Thunder.mp4")
        } else if (weatherID < 600) { //Rain
            setSrc("/assets/Rainy.mp4")
        } else if (weatherID < 800) { //Snow
            setSrc("/assets/Snowy.mp4")
        } else if (weatherID === 800) { //Clear
            setSrc(`/assets/Sunny.mp4`)
        } else if (weatherID > 800) { //Cloudy
            setSrc("/assets/Cloudy.mp4")
        }
    }
    
    useEffect(() => {
        if (weather.cod === 200)
            handleWeather(weather);
            console.log(process.env.PUBLIC_URL)
    }, [weather])

    return (transition((style) => (
        <animated.div className={classes.Centerpiece} style={{...style}}>
            <video className={''} autoPlay={true} loop={true} muted={true} controls={false}>
                <source src={imageSrc} type='video/mp4'/>
            </video>
        </animated.div>
    )))
}
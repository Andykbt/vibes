import React, { useEffect, useState } from 'react'
import classes from './Weather.module.css'
import { useSpring, useTransition, animated as a } from 'react-spring'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faWind, faTemperatureHigh, faTemperatureLow, faTint } from '@fortawesome/free-solid-svg-icons'

export default function Weather({weather}) {

    const transitions = useTransition(weather.cod === 200 ? weather : [], {
        from:   { left: '-100%'  },
        enter:  { left: '13%' },
        leave:  { left: '-100%' }, 
        config: { tension: 170, friction: 50 }
    })

    return transitions((style, item) => (
        <a.section className={classes.container} style={{ ...style}}>
            <div>    
                <h1 className={classes.temp}>{item.main.temp}&deg;C</h1>
                <h2 className={classes.city}>{item.name}</h2>
            </div>
            <div className={classes.secondaryContainer}>    
                <div className={classes.secondary}><FontAwesomeIcon icon={faTint} /><span>{item.main.humidity}%</span></div>
                <div className={classes.secondary}><FontAwesomeIcon icon={faWind} /><span>{item.wind.speed}km/hr</span></div>
                <div className={classes.secondary}><FontAwesomeIcon icon={faTemperatureHigh} /><span>{item.main.temp_max}/{item.main.temp_min}</span></div>
            </div>
        </a.section>
    ))
}

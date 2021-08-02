import React, { useEffect, useState } from "react"
import { animated, useSpring, useSpringRef, useTransition, useChain } from 'react-spring';
import classes from './Recommendations.module.css'

export default function Recommendations({tracks}) {
    const transApi = useSpringRef();
    const [hoveredTrack, setHovered] = useState({});

    const transition = useTransition( Object.keys(tracks).length === 5 ? tracks : [], {
        ref: transApi,
        trail: 400,
        from: { opacity: 0, scale: 0 },
        enter: { opacity: 1, scale: 1 },
        leave: { opacity: 0, scale: 0 }
    });

    const props = useSpring({
        opacity: Object.keys(hoveredTrack).length !== 0 ? 1 : 0,
        right: Object.keys(hoveredTrack).length !== 0 ? '0em' : '-30em'
    })

    useChain([transApi], [1])

    return (
        <div className={classes.container}>
            <div className={classes.box}>
                {transition((style, item) => (
                    <animated.article style={{ ...style}}
                        onMouseEnter={() => setHovered(item)}
                    >
                        <a href={item.External_link} target="_blank">
                            <img src={item.Image}></img>
                        </a>
                    </animated.article>
                ))}
            </div>

            {Object.keys(hoveredTrack).length !== 0 &&
                <animated.article className={classes.rightContainer} style={props}>
                    <a href={hoveredTrack.External_link} target="_blank"><img src={hoveredTrack.Image} /></a>
                    <a href={hoveredTrack.External_link} target="_blank">
                        <h1>{hoveredTrack.Title}</h1>
                        <p>{hoveredTrack.Artist}</p>
                    </a>
                </animated.article>
            }
        </div>
        
    );
}
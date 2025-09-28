import { t } from "i18next";
import styles from "./Home.module.css"
import Matter, { Engine, Body, Events, Mouse, MouseConstraint, World,  Render, Runner, Bodies, Composite } from "matter-js";
import { useRef, useEffect, useState } from "react";
import PoolTable from "../../components/PoolTable/PoolTable";
import Ball0 from '../../assets/balls/0.png';
import Ball1  from '../../assets/balls/1.png';
import Ball2  from '../../assets/balls/2.png';
import Ball3  from '../../assets/balls/3.png';
import Ball4  from '../../assets/balls/4.png';
import Ball5  from '../../assets/balls/5.png';
import Ball6  from '../../assets/balls/6.png';
import Ball7  from '../../assets/balls/7.png';
import Ball8  from '../../assets/balls/8.png';
import Ball9  from '../../assets/balls/9.png';
import Ball10 from '../../assets/balls/10.png';
import Ball11 from '../../assets/balls/11.png';
import Ball12 from '../../assets/balls/12.png';
import Ball13 from '../../assets/balls/13.png';
import Ball14 from '../../assets/balls/14.png';
import Ball15 from '../../assets/balls/15.png';
import { RotateCcw } from "lucide-react";


import Navbar from "../../components/Navbar/Navbar";
import Tooltip from "../../components/Tooltip/Tooltip";
import { useTranslation } from "react-i18next";











const Home = () => {
    const {t} = useTranslation();
    const [scoredBalls, setScoredBalls] = useState<number[]>([]);
    const [strokes, setStrokes] = useState<number>(0);
    const SPRITES: (string | undefined)[] = [
        Ball0,  // 0 = cue
        Ball1,  // 1
        Ball2,  // 2
        Ball3,  // 3
        Ball4,  // 4
        Ball5,  // 5
        Ball6,  // 6
        Ball7,  // 7
        Ball8,  // 8
        Ball9,  // 9
        Ball10, // 10
        Ball11, // 11
        Ball12, // 12
        Ball13, // 13
        Ball14, // 14
        Ball15  // 15
    ];
    

    return (
        <>
            <div className={styles.Page}>
                <Navbar/>

                <div className={styles.Content}>

                    

                    <PoolTable setScoredBalls={setScoredBalls} setStrokes={setStrokes}/>
                    <div className={styles.CounterWrap}>
                        <div className={styles.Hud}>
                            <div className={styles.powerWrap} title="Shot power">
                                <div id="powerBar" className={styles.powerBar} />
                            </div>
                            <button
                                className={styles.resetBtn}
                                onClick={() => document.dispatchEvent(new CustomEvent('POOL_RESET'))}
                            >
                                <RotateCcw/>
                            </button>
                        </div>
                        <div className={styles.StrokeData}>
                            <div className={styles.StrokeCount}>
                                <p>{t("hud.strokes")}: <span>{strokes}</span></p>
                                <p>{t("hud.scored")}: <span>{scoredBalls.length}/15</span>
                                </p>
                            </div>

                            <div className={styles.BallCounter}>
                                {SPRITES.map((ball, index)=>(
                                    <div className={styles.Ball} style={{backgroundImage: `url(${SPRITES[index]})`}}></div>
                                ))}
                            </div>

                        </div>
                    </div>
                    
                    <Tooltip/>
                </div>
            </div>
        </>
    )
}

export default Home;




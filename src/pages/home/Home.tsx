import styles from "./Home.module.css"
import { useState, useRef, useEffect, useCallback } from "react";
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
import { Helmet } from "react-helmet-async";







type ballList = {
    full: number[];
    stripped: number[];
};

const Home = () => {
    const {t} = useTranslation();
    const [scoredBalls, setScoredBalls] = useState<number[]>([]);
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
    const balls: ballList = {
        "full": [1, 2, 3, 4, 5, 6, 7],
        "stripped": [9, 10, 11, 12, 13, 14, 15]
    }

    // What user has what flag
    const [firstCol, setFirstCol] = useState<"stripped"|"full">();
    const [secondCol, setSecondCol] = useState<"stripped"|"full">();
    const [firstStrokes, setFirstStrokes] = useState<number>(0);
    const [secondStrokes, setSecondStrokes] = useState<number>(0);
    const cuePocketedRef = useRef(false);
    const shotInProgressRef = useRef(false);
    const [shotInProgress, setShotInProgress] = useState(false);
    const [strokes, setStrokes] = useState<number>(0);

    const [multiplayer, setMultiplayer] = useState<boolean>(false);
    const ref = useRef<HTMLDivElement>(null);
    const [isWaiting, setIsWaiting] = useState<boolean>(false);
    const [currPlayer, setCurrPlayer] = useState<1 | 2>(1);

    const [hasWon, setHasWon] = useState<number>()


    const prevScoredCountRef = useRef(0);

    // Track the previous score
    useEffect(() => {
        if (!multiplayer) return;
        prevScoredCountRef.current = scoredBalls.length;
    }, [strokes, multiplayer]);

    // Update players strokes
    useEffect(()=>{
        if(strokes === 0) return;
        if (currPlayer === 1) {
            setFirstStrokes(firstStrokes+1);
        } else {
            setSecondStrokes(secondStrokes+1);
        }
    },[strokes])



    // Helper to find balls color
    const findBallsColor = (ballId: number) => {
        if(balls.full.includes(ballId)){
            return"full";
        }else{
            return "stripped";
        }
    }
    useEffect(()=>{
        console.log(scoredBalls)
    },[scoredBalls])

    // Handle all balls stopped
    const handleBallsStopped = useCallback(() => {
        
        if (!multiplayer) {
            shotInProgressRef.current = false;
            setShotInProgress(false); 
            return
        }

        // Only balls potted in THIS shot, excluding the cue (0)
        const pottedThisShot = scoredBalls
            .slice(prevScoredCountRef.current)
            .filter(id => id !== 0);
        console.log(pottedThisShot)

        // Set player colors on first scored
        const currentColor = currPlayer === 1 ? firstCol : secondCol;
        // Keep turn
        let keepTurn = false;
        let shouldSwitch = false;

        if (cuePocketedRef.current) {
            // Cue scratch → foul → switch AFTER this handler (once)
            shouldSwitch = true;
        } else {
            // Normal logic
            if (!currentColor) {
                // Run only if something ws potted
                if (pottedThisShot.length > 0) {
                    // Get first hit color
                    const firstColHit = findBallsColor(pottedThisShot[0]);
                    const other = firstColHit === "full" ? "stripped" : "full";
                    if (currPlayer === 1) {
                        setFirstCol(firstColHit);
                        setSecondCol(other);
                    } else {
                        setSecondCol(firstColHit);
                        setFirstCol(other);
                    }
                    keepTurn = true;
                }
            } else {
                // Find if user potted a ball of their color
                keepTurn = pottedThisShot.some(id => balls[currentColor].includes(id));
            }
            shouldSwitch = !keepTurn;
        }
        
        // 8-ball win/lose check uses only object balls potted this shot
        if (pottedThisShot.includes(8)) {
            const scoredNumber = scoredBalls.filter(
                ball => currentColor !== undefined && balls[currentColor].includes(ball)
            ).length;

            // Find and set winner
            const winner =
                scoredNumber >= 7 ? currPlayer : (currPlayer === 1 ? 2 : 1);

            setHasWon(winner);

            // Snapshot and clear flags; do NOT switch players
            prevScoredCountRef.current = scoredBalls.length;
            cuePocketedRef.current = false;
            shotInProgressRef.current = false;
            setShotInProgress(false);
            return;
        }
        // Switch player if needed
        if (shouldSwitch && !hasWon) {
            setIsWaiting(true);
            setTimeout(() => setIsWaiting(false), 1000);
            setCurrPlayer(p => (p === 1 ? 2 : 1));
        }


        // Snapshot and clear cue flag for next shot
        prevScoredCountRef.current = scoredBalls.length;
        cuePocketedRef.current = false;
        shotInProgressRef.current = false;
        setShotInProgress(false);  
    }, [multiplayer, currPlayer, scoredBalls, firstCol, secondCol, balls]);

    // Reset the game -  potrebuje resetovat i game screen 
    const restartGame = () => {
        setScoredBalls([]);
        setStrokes(0);
        setFirstStrokes(0);
        setSecondStrokes(0);
        setFirstCol(undefined);
        setSecondCol(undefined);
        setCurrPlayer(1);
        setIsWaiting(false);
        prevScoredCountRef.current = 0;
        setHasWon(undefined);
        cuePocketedRef.current = false;
        shotInProgressRef.current = false;
        setShotInProgress(false); 
        document.dispatchEvent(new Event('POOL_RESET'))
    }
    const onCuePocketed = useCallback(() => {
        cuePocketedRef.current = true;
    }, []);

    useEffect(() => {
        if (!multiplayer) return;

        document.addEventListener('CUE_POCKETED', onCuePocketed);
        return () => {
            document.removeEventListener('CUE_POCKETED', onCuePocketed);
        };
    }, [multiplayer, onCuePocketed]);

    useEffect(() => {
        restartGame();
    },[multiplayer])

    // Shot active flag
    useEffect(() => {
        if (strokes > 0) {
            shotInProgressRef.current = true;
            setShotInProgress(true);
        }
    }, [strokes]);


    return (
        <>
            <main className={styles.Page}>
                <Helmet>
                    <title>SBPool</title>
                    <meta
                        name="description"
                        content="SBPool - 8Ball Pool game made in react, typescript and matterjs by Stepan Blaha"
                    />
                </Helmet>
                <Navbar/>
                
                <div className={styles.Content}>

                    {!hasWon && isWaiting && (
                        <div className={styles.Overlay}>
                            <div className={styles.OverlayBlur}></div>
                            <p className={styles.OverlayText}>{t("hud.player")} {currPlayer}</p>
                        </div>
                    )}
                    {hasWon && (
                        <div className={styles.Overlay}>
                            <div className={styles.OverlayBlur}></div>
                            <div className={styles.OverlayContent}>
                                <p className={styles.OverlayText}>{t("hud.player")} {hasWon} {t("hud.win")}</p>
                                <div className={styles.OverlayButton} onClick={restartGame}>
                                    <p>{t("hud.reset")}</p>
                                </div>
                            </div>
                        </div>
                    )}
                    <div className={styles.CounterWrap}>
                        
                        <div className={styles.Hud}>
                            <div className={styles.powerWrap} title="Shot power">
                                <div id="powerBar" className={styles.powerBar} />
                            </div>
                            <button
                                name="Reset game button"
                                className={`${styles.resetBtn} ${shotInProgress ? styles.MultDisabled : "" }`}
                                onClick={() => {
                                    document.dispatchEvent(new CustomEvent('POOL_RESET'));
                                    restartGame();
                                    }
                                }
                                disabled={shotInProgress}
                            >
                                <RotateCcw/>
                            </button>
                            <div
                                className={`${styles.toggle} ${multiplayer ? styles.active : ""} ${shotInProgress ? styles.MultDisabled : "" }`}
                                ref={ref}
                                onClick={() => {
                                    if (shotInProgress) return;
                                    setMultiplayer(!multiplayer);
                                }}
                                aria-disabled={shotInProgress}
                                aria-checked={multiplayer}
                                aria-label={multiplayer ? 'Switch to single player mode' : 'Switch to multi player mode'} // accessible name
                                tabIndex={0}           
                                role="switch"
                            >     
                            </div>
                        </div>
                        {multiplayer ? (
                            <>
                            <div className={styles.StrokeDataWrap}>
                                <div className={styles.StrokeData}>
                                    <div className={`${styles.StrokeCount}`}>
                                        <p>{t("hud.player")}: <span className={`${currPlayer === 1 ? styles.ActiveHud : ""}`}>1</span></p>
                                        <p>{t("hud.color")}: <span>{firstCol}</span></p>
                                        <p>{t("hud.strokes")}: <span>{firstStrokes}</span></p>
                                        <p>{t("hud.scored")}: <span>{scoredBalls.filter(ball => firstCol && balls[firstCol].includes(ball)).length}/7</span></p>
                                    </div>

                                    <div className={styles.BallCounter}>
                                        {[...scoredBalls].sort((a,b)=>a-b).map(ball=>{
                                            if (firstCol !== undefined && balls[firstCol].includes(ball)) {
                                                return(
                                                <div className={styles.Ball} style={{backgroundImage: `url(${SPRITES[ball]})`}}></div>
                                                )
                                            }
                                        })}
                                    </div>

                                </div>
                                <div className={styles.StrokeData}>
                                    <div className={styles.StrokeCount}>
                                        <p>{t("hud.player")}: <span className={`${currPlayer === 2 ? styles.ActiveHud : ""}`}>2</span></p>
                                        <p>{t("hud.color")}: <span>{secondCol}</span></p>
                                        <p>{t("hud.strokes")}: <span>{secondStrokes}</span></p>
                                        <p>{t("hud.scored")}: <span>{scoredBalls.filter(ball => secondCol && balls[secondCol].includes(ball)).length}/7</span></p>
                                    </div>

                                    <div className={styles.BallCounter}>
                                        {[...scoredBalls].sort((a,b)=>a-b).map(ball=>{
                                            if (secondCol !== undefined && balls[secondCol].includes(ball)) {
                                                return(
                                                <div className={styles.Ball} style={{backgroundImage: `url(${SPRITES[ball]})`}}></div>
                                                )
                                            }
                                        })}
                                    </div>

                                </div>
                            </div>
                            </>
                        ) : (
                            <div className={styles.StrokeData}>
                                <div className={styles.StrokeCount}>
                                    <p>{t("hud.strokes")}: <span>{strokes}</span></p>
                                    <p>{t("hud.scored")}: <span>{scoredBalls.length}/15</span>
                                    </p>
                                </div>

                                <div className={styles.BallCounter}>
                                    {[...scoredBalls].sort((a,b)=>a-b).map(ball=>(
                                        <div className={styles.Ball} style={{backgroundImage: `url(${SPRITES[ball]})`}}></div>
                                    ))}
                                </div>

                            </div>
                        )}

                    </div>
                    
                    <PoolTable
                    setScoredBalls={setScoredBalls}
                    setStrokes={setStrokes}
                    onBallsStopped={handleBallsStopped}
                    />

                    
                    <Tooltip/>
                </div>
            </main>
        </>
    )
}

export default Home;



/*

Without multiplayer
import styles from "./Home.module.css"
import { useState } from "react";
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
import { Helmet } from "react-helmet-async";










const Home = () => {
    const {t} = useTranslation();
    const [scoredBalls, setScoredBalls] = useState<number[]>([]);
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
    const [strokes, setStrokes] = useState<number>(0);

    const [multiplayer, setMultiplayer] = useState<boolean>(false);
    const ref = useRef<HTMLDivElement>(null);

    return (
        <>
            <main className={styles.Page}>
                <Helmet>
                    <title>Horáci stav, stavební firma</title>
                    <meta
                        name="description"
                        content="My jsme stavební firma Horáci stav, děláme kompletní stavby, rekonstrukce, tesařské práce, pokrývačské práce, elektroinstalace a hromosvody."
                    />
                </Helmet>
                <Navbar/>
                
                <div className={styles.Content}>
                    <div className={styles.CounterWrap}>
                        <div
            className={`${styles.toggle} ${multiplayer ? styles.active : ""}`}
            ref={ref}
            onClick={()=>setMultiplayer(!multiplayer)}
            aria-checked={multiplayer}                // REQUIRED for role="switch"
            aria-label={multiplayer ? 'Switch to single player mode' : 'Switch to multi player mode'} // accessible name
            tabIndex={0}           
            role="switch"
        >     
        </div>
                        <div className={styles.Hud}>
                            <div className={styles.powerWrap} title="Shot power">
                                <div id="powerBar" className={styles.powerBar} />
                            </div>
                            <button
                                name="Reset game button"
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
                                {scoredBalls.map(ball=>(
                                    <div className={styles.Ball} style={{backgroundImage: `url(${SPRITES[ball]})`}}></div>
                                ))}
                            </div>

                        </div>
                    </div>
                    <PoolTable
                    setScoredBalls={setScoredBalls}
                    setStrokes={setStrokes}
                    />

                    
                    <Tooltip/>
                </div>
            </main>
        </>
    )
}


export default Home;






















*/








/*



Realtime -version wop



import { t } from "i18next";
import styles from "./Home.module.css"
import {socket} from "../../lib/socket"
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

import NamePanel from "../../components/NamePanel/NamePanel";
import Navbar from "../../components/Navbar/Navbar";
import Tooltip from "../../components/Tooltip/Tooltip";
import { useTranslation } from "react-i18next";











const Home = () => {
    const {t} = useTranslation();
    const [scoredBalls, setScoredBalls] = useState<number[]>([]);
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
    type Participant = {
  socketId: string;
  name?: string;
  userId?: string | null;
  deviceId?: string | null;
  tabId?: string | null;
};

  const [myName, setMyName] = useState('');
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [scored, setScored] = useState<number[]>([]);
  const [strokes, setStrokes] = useState<number>(0);

  // Listen for presence updates (join/leave/update + initial list)
  useEffect(() => {
    const upsert = (who: Participant) => {
      setParticipants((prev) => {
        const idx = prev.findIndex((p) => p.socketId === who.socketId);
        if (idx === -1) return [...prev, who];
        const next = prev.slice();
        next[idx] = { ...prev[idx], ...who };
        return next;
      });
    };

    const onJoin = (msg: { roomId: string; who: Participant }) => upsert(msg.who);
    const onUpdate = (msg: { roomId: string; who: Participant; name: string }) =>
      upsert({ ...msg.who, name: msg.name });
    const onLeave = (msg: { roomId: string; who: Participant }) => {
      setParticipants((prev) => prev.filter((p) => p.socketId !== msg.who.socketId));
    };
    const onList = (msg: { roomId: string; list: Participant[] }) => {
      setParticipants(msg.list || []);
    };
    const onMe = (me: { name?: string }) => {
      if (typeof me?.name === 'string') setMyName(me.name);
    };

    socket.on('presence:join', onJoin);
    socket.on('presence:update', onUpdate);
    socket.on('presence:leave', onLeave);
    socket.on('presence:list', onList);
    socket.on('user:me', onMe);

    // Ask for presence list for the current match
    const params = new URLSearchParams(window.location.search);
    const matchId = params.get('match') || 'room-1';
    socket.emit('presence:list', { roomId: matchId });

    return () => {
      socket.off('presence:join', onJoin);
      socket.off('presence:update', onUpdate);
      socket.off('presence:leave', onLeave);
      socket.off('presence:list', onList);
      socket.off('user:me', onMe);
    };
  }, []);

  const reset = () => {
    document.dispatchEvent(new Event('POOL_RESET'));
  };
    

    return (
        <>
            <div className={styles.Page}>
                <Navbar/>
                <div>
                <NamePanel valueFromParent={myName} onNameChange={setMyName} />
                <div style={{ marginTop: 16 }}>
                    <button onClick={reset}>Reset Table</button>
                </div>

                <div style={{ marginTop: 16 }}>
                    <div><strong>Strokes:</strong> {strokes}</div>
                    <div><strong>Scored:</strong> {scored.join(', ') || '—'}</div>
                </div>

                <div style={{ marginTop: 16 }}>
                    <strong>Players in room</strong>
                    <ul style={{ paddingLeft: 16, marginTop: 6 }}>
                    {participants.map((p) => (
                        <li key={p.socketId}>
                        {p.name || `Guest-${p.socketId.slice(0, 5)}`} <small style={{ color: '#999' }}>({p.socketId})</small>
                        </li>
                    ))}
                    </ul>
                </div>
                </div>

                <div className={styles.Content}>


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
                    <PoolTable
                    setScoredBalls={setScoredBalls}
                    setStrokes={setStrokes}
                    setUsers={setMyName}
                    />

                    
                    <Tooltip/>
                </div>
            </div>
        </>
    )
}


export default Home;



*/

































































/*
Normal version

import { t } from "i18next";
import styles from "./Home.module.css"
import {socket} from "../../lib/socket"
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

import NamePanel from "../../components/NamePanel/NamePanel";
import Navbar from "../../components/Navbar/Navbar";
import Tooltip from "../../components/Tooltip/Tooltip";
import { useTranslation } from "react-i18next";











const Home = () => {
    const {t} = useTranslation();
    const [scoredBalls, setScoredBalls] = useState<number[]>([]);
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
    const [strokes, setStrokes] = useState<number>(0);


    return (
        <>
            <div className={styles.Page}>
                <Navbar/>


                <div className={styles.Content}>


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
                    <PoolTable
                    setScoredBalls={setScoredBalls}
                    setStrokes={setStrokes}
                    />

                    
                    <Tooltip/>
                </div>
            </div>
        </>
    )
}


export default Home;


*/
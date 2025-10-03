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
            </div>
        </>
    )
}


export default Home;









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
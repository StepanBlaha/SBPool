import React, { useEffect, useRef, useState } from 'react'
import {Engine, Render, Runner, Composite, Bodies, Body, Events, Vector, Mouse, MouseConstraint} from 'matter-js';
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
import styles from "./PoolTable.module.css"













// Set physical variable

// Aspect used to compute sizes
const ASPECT_W = 900;
const ASPECT_H = 500;
const MAX_LOGICAL_W = 1100;

// viewport padding so it doesn’t touch edges
const VPAD_X = 16;
const VPAD_Y = 16;

// Physics tuning (dimensionless)
const MAX_PULL = 140;
const MIN_SHOT_SPEED = 0.05;
const FRICTION_AIR = 0.012;
const BALL_RESTITUTION = 0.96;
const BALL_FRICTION = 0.01;
const CUSHION_RESTITUTION = 0.9;

// Colors
const felt = 'var(--accent-color)';
const cushion = '#2E4E1E';
const pocketCol = '#111';

// Ball sprites
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

// Ball rim colors (optional)
const poolColors = [
    '#ffd54f','#ef5350','#42a5f5','#ab47bc','#66bb6a','#ffa726','#26c6da','#8d6e63',
    '#ffd54f','#ef5350','#42a5f5','#ab47bc','#66bb6a','#ffa726','#26c6da'
];

interface PoolTableProps {
    setScoredBalls: React.Dispatch<React.SetStateAction<number[]>>;
    setStrokes: React.Dispatch<React.SetStateAction<number>>
}
// Table
export default function PoolTable({setScoredBalls, setStrokes}: PoolTableProps) {

    // Calculate size
    function computeSize(rotated: boolean) {
        const vw = window.innerWidth - VPAD_X * 2;
        const vh = window.innerHeight - VPAD_Y * 2;

        // natural logical size
        let W0 = Math.min(MAX_LOGICAL_W, Math.floor(vw * 0.95));
        let H0 = Math.round(W0 * (ASPECT_H / ASPECT_W));

        // visual box we must fit into the viewport
        // when rotated 90°, visual width = H0 and visual height = W0
        const visW = rotated ? H0 : W0;
        const visH = rotated ? W0 : H0;

        const scale = Math.min(vw / visW, vh / visH, 1);

        // final logical canvas size (we rebuild world to these)
        const width = Math.round(W0 * scale);
        const height = Math.round(H0 * scale);

        return { width, height };
    }

    const [rotated, setRotated] = useState<boolean>(window.innerWidth < 1400);
    const [size, setSize] = useState(() => computeSize(rotated));
    const rotatedRef = useRef(rotated);
    useEffect(() => { rotatedRef.current = rotated; }, [rotated]);

    // respond to window resize + media query
    useEffect(() => {
        const mq = window.matchMedia('(max-width: 1400px)');
        const onChange = () => {
            const r = mq.matches;
            setRotated(r);
            setSize(computeSize(r));
        };
        mq.addEventListener('change', onChange);

        const onResize = () => setSize(computeSize(rotatedRef.current));
        window.addEventListener('resize', onResize);

        return () => {
            mq.removeEventListener('change', onChange);
            window.removeEventListener('resize', onResize);
        };
    }, []);


    // Table ref
    const hostRef = useRef<HTMLDivElement>(null)

    // Pocket centers helper (parametric)
    function pocketCenters(W: number, H: number, TABLE_INSET: number) {
        const left = TABLE_INSET;
        const right = W - TABLE_INSET;
        const top = TABLE_INSET;
        const bottom = H - TABLE_INSET;
        return {
            tl: { x: left, y: top },
            tm: { x: W / 2, y: top },
            tr: { x: right, y: top },
            bl: { x: left, y: bottom },
            bm: { x: W / 2, y: bottom },
            br: { x: right, y: bottom }
        };
    }

    useEffect(() => {
        // Return on no table
        if (!hostRef.current) return;
        // Current logical canvas size
        const WIDTH = size.width;
        const HEIGHT = size.height;

        // Scale geometry from a 900x500 logical design space
        const S = WIDTH / ASPECT_W;
        const TABLE_INSET = 36 * S;
        const POCKET_R = 22 * S;

        // Sprite scale (textures are 256px)
        const VISUAL_DIAM = 27 * S;

        // sprite size is locked to visual
        const SPRITE_PX = 1000;
        const SCALE = VISUAL_DIAM / SPRITE_PX;

        // physics radius — bump it a hair so it "fills" the painted disc
        const HITBOX_SCALE = 1.0;                  // try 1.02–1.06
        const BALL_R = (VISUAL_DIAM / 2) * HITBOX_SCALE;
        
        // Get the hud power bar - outside of this elemend
        const powerBar = document.getElementById('powerBar') as HTMLDivElement
        // Engine & render
        const engine = Engine.create()
        engine.world.gravity.y = 0 // Unset gravity

        const render = Render.create({
            element: hostRef.current,
            engine,
            options: {
                width: WIDTH, 
                height: HEIGHT, 
                wireframes: false,
                background: felt, 
                pixelRatio: 1
            }
        })
        Render.run(render);
        // Starts the game loop
        const runner = Runner.create();
        Runner.run(runner, engine);

        // Bounds helpers - Physical borders for the table
        const bounds = { 
            left: TABLE_INSET, 
            right: WIDTH - TABLE_INSET, 
            top: TABLE_INSET, 
            bottom: HEIGHT - TABLE_INSET 
        }

        // Add cushions between the pockets
        const addCushions = () => {
            const table = TABLE_INSET * 0.6;
            const options = { isStatic: true, restitution: CUSHION_RESTITUTION, render: { fillStyle: cushion } };
            const pockets = pocketCenters(WIDTH, HEIGHT, TABLE_INSET);
            // Build all the segments [{startx, starty},{endx, endy}, table size]
            const segments: [{ x: number, y: number }, { x: number, y: number }, number][] = [
                [{ x: pockets.tl.x + POCKET_R, y: bounds.top - table / 2 }, { x: pockets.tm.x - POCKET_R, y: bounds.top - table / 2 }, table],
                [{ x: pockets.tm.x + POCKET_R, y: bounds.top - table / 2 }, { x: pockets.tr.x - POCKET_R, y: bounds.top - table / 2 }, table],
                [{ x: pockets.bl.x + POCKET_R, y: bounds.bottom + table / 2 }, { x: pockets.bm.x - POCKET_R, y: bounds.bottom + table / 2 }, table],
                [{ x: pockets.bm.x + POCKET_R, y: bounds.bottom + table / 2 }, { x: pockets.br.x - POCKET_R, y: bounds.bottom + table / 2 }, table],
                [{ x: bounds.left - table / 2, y: pockets.tl.y + POCKET_R }, { x: bounds.left - table / 2, y: pockets.bl.y - POCKET_R }, table],
                [{ x: bounds.right + table / 2, y: pockets.tr.y + POCKET_R }, { x: bounds.right + table / 2, y: pockets.br.y - POCKET_R }, table],
            ];
            // Create all the cushions -  need to compute center points, length, angle and then create
            // a - {startx, starty}, b - {endx, endy}, th - table size
            for (const [a,b,th] of segments) {
                const centerx = (a.x+b.x)/2;
                const centery = (a.y+b.y)/2;
                const length = Math.hypot(b.x-a.x,b.y-a.y);
                const angle = Math.atan2(b.y-a.y,b.x-a.x);
                // Create the rect
                const rect =  Bodies.rectangle(centerx, centery, length, th, options);
                // Add angle to the rect
                Body.setAngle(rect, angle)
                // Add to the scene
                Composite.add(engine.world, rect)
            }
        }

        // Pockets
        const pocketsBodies: Matter.Body[] = []
        // Generate pockets
        const addPockets = () => {
            // Get pocket sizes and generate
            const pockets = pocketCenters(WIDTH, HEIGHT, TABLE_INSET);
            const pocketArray = Object.values(pockets).map(p =>
                Bodies.circle(p.x, p.y, POCKET_R, { isStatic: true, isSensor: true, render: { fillStyle: pocketCol } })
            )
            // Add to scene
            pocketsBodies.push(...pocketArray)
            Composite.add(engine.world, pocketArray)
        }

        // Generate ball
        const  makeBall = (x:number, y:number, color='#fff', sprite: string | undefined, id?: number) => {
            const b = Bodies.circle(x, y, BALL_R, {
                restitution: BALL_RESTITUTION,
                frictionAir: FRICTION_AIR,
                friction: BALL_FRICTION,
                density: 0.0018,
                render: {
                    fillStyle: color,
                    strokeStyle: 'rgba(0,0,0,0.25)',
                    lineWidth: 1,
                    sprite: sprite ? { texture: sprite, xScale: SCALE, yScale: SCALE } : undefined,
                }
            });
            (b as any).ballId = id ?? null;
            b.label = id ? `ball-${id}` : b.label;
            return b;
        }

        // Generate rack with the balls
        const rackTriangle = (cx:number, cy:number) => {
            // gap between the balls
            const gap = BALL_R * 2.4;
            const rows = 5;
            let id = 1; // start after cue
            const balls: Matter.Body[] = [];
            for (let row=0; row<rows; row++){
                for (let i=0; i<=row; i++){
                    const x = cx + row*gap;
                    const y = cy - (row*gap)/2 + i*gap;
                    const sprite = SPRITES[id];
                    const color = poolColors[(id - 1) % poolColors.length];
                    balls.push(makeBall(x, y, color, sprite, id)); // sprite auto-picked from SPRITES[id]
                    id++;
                }
            }
            return balls
        }
        // Add the Pockets and cushions
        addPockets()
        addCushions()

        // -------------------------------------------
        // Draw the background before render to be under the balls and such
        Events.on(render as unknown as Matter.Events, 'beforeRender', () => {
            const ctx = (render as any).context as CanvasRenderingContext2D
            // Felt gradient
            const grad = ctx.createLinearGradient(0,0,0,HEIGHT)
            // Draw the felt
            grad.addColorStop(0,'#188a45'); 
            grad.addColorStop(1,'#0f5a2c')
            ctx.fillStyle = grad; 
            ctx.fillRect(0,0,WIDTH,HEIGHT)
        })

        // Felt gradient & rails + shadows + cue render
        Events.on(render as unknown as Matter.Events, 'afterRender', () => {
            // Create the context
            const ctx = (render as any).context as CanvasRenderingContext2D

            // Draw the rails
            ctx.save();
            ctx.strokeStyle = '#733515';
            ctx.lineWidth = 14 * S;
            ctx.strokeRect(7 * S, 7 * S, WIDTH - 14 * S, HEIGHT - 14 * S);
            ctx.restore();

            // Shadows
            ctx.save();
            ctx.globalCompositeOperation = 'destination-over';
            ctx.fillStyle = 'rgba(0,0,0,0.22)';
            for (const body of Composite.allBodies(engine.world)) {
                if (!body.circleRadius || body.isStatic) continue;
                ctx.beginPath();
                ctx.ellipse(
                body.position.x + 3 * S,
                body.position.y + 6 * S,
                body.circleRadius * 1.05,
                body.circleRadius * 0.8,
                0, 0, Math.PI * 2
                );
                ctx.fill();
            }
            ctx.restore();




            // Cue ball (the ball we hit) + Guide lines
            if (cueBall && canShoot() ) {
                const start = cueBall.position; // Start of the guide lines
                const lineLen = 180 * S; // Length og the guide lines
                // End of the guide lines
                const guideEnd = Vector.add(start, Vector.mult(aimDir, lineLen));
                // Draw the guide lines
                ctx.save();
                ctx.beginPath();
                ctx.moveTo(start.x,start.y); 
                ctx.lineTo(guideEnd.x,guideEnd.y);
                ctx.lineWidth = 2 * S;
                ctx.setLineDash([6 * S, 6 * S]);
                ctx.strokeStyle='rgba(255,255,255,0.45)';
                ctx.stroke(); 
                ctx.restore();

                // Stick sizes
                const baseLength = 160 * S; // Base length
                const extra = pull*0.75 * S; // Add the pull 
                const stickLen = baseLength + extra; // Final length
                const stickWidth = 8 * S; // Width
                const back = Vector.add(start, Vector.mult(aimDir, -(BALL_R+6 * S+stickLen)))
                const angle = Math.atan2(aimDir.y, aimDir.x); // Aimed angle
                // Draw the stick
                ctx.save()
                ctx.translate(back.x, back.y)
                ctx.rotate(angle)
                // Make stick have a gradient
                const stickGradient = ctx.createLinearGradient(0,0,stickLen,0)
                stickGradient.addColorStop(0,'#d8863a'); 
                stickGradient.addColorStop(0.75,'#d8863a'); 
                stickGradient.addColorStop(1,'#d8863a')
                ctx.fillStyle=stickGradient; 
                ctx.fillRect(0,-stickWidth/2,stickLen,stickWidth)
                ctx.fillStyle='#733515'; 
                ctx.fillRect(stickLen-6,-stickWidth/2,6 * S,stickWidth)
                ctx.restore()

                ctx.save();
                ctx.globalCompositeOperation = 'destination-over';
                ctx.fillStyle = 'rgba(0,0,0,0.22)';
                ctx.translate(back.x +6, back.y+ 6)
                ctx.rotate(angle)
                ctx.fillRect(0,-stickWidth/2,stickLen,stickWidth)

                ctx.fillRect(stickLen-6,-stickWidth/2,6 * S,stickWidth)
                ctx.restore()

                
            }
        })

        // Rack + Cue ball
        let cueBall: Matter.Body | null = null;
        const poolBalls: Matter.Body[] = [];

        // Respawn cue ball 
        const respawnCueBall = () => {
            // Remove if it exists
            if (cueBall){
                Composite.remove(engine.world, cueBall)
            }
            // Create and add tp the left quarter of the table - can tweek 
            cueBall = makeBall(WIDTH*0.25, HEIGHT/2, '#ffffff', SPRITES[0], 0)
            cueBall.label = 'cueBall'
            Composite.add(engine.world, cueBall)
        }

        // Reset ball rack
        const resetRack = () => {
            // Remove all the balls
            poolBalls.forEach(b => Composite.remove(engine.world,b))
            poolBalls.length = 0;
            // Remove and respawn cue ball
            if (cueBall){
                Composite.remove(engine.world, cueBall); 
                cueBall = null;
            }
            respawnCueBall();
            // Generate new triangle and add to the world
            const startX = WIDTH*0.62;
            const startY = HEIGHT/2;
            const racked = rackTriangle(startX, startY);
            poolBalls.push(...racked);
            Composite.add(engine.world, racked);
            // Reset strokes and scored balls
            setScoredBalls([]);
            setStrokes(0);
        }
        // Reset rack
        resetRack();

        // Input
        const rect = (render as any).canvas.getBoundingClientRect();
        console.log(
            'canvas backing store:', (render as any).canvas.width, (render as any).canvas.height,
            'css size:', rect.width, rect.height,
            'render pixelRatio:', (render as any).options.pixelRatio
        );
        // Flags
        let aiming = false;
        let aimDir = Vector.create(1,0);
        let pull = 0;
        const MAX_SPEED = 25

        // Check if all balls stand stilll
        const ballsAreSleeping = () => {
            // Get the balls and the cue ball
            const bodies = poolBalls.slice();
            if (cueBall){
                bodies.push(cueBall);
            }
            // Check all the velocities
            for (const body of bodies) {
                const velocity = body.velocity; // Normal velocity
                const w = body.angularVelocity; // Angular velocity
                if (Math.hypot(velocity.x,velocity.y) > MIN_SHOT_SPEED) return false
                if (Math.abs(w) > 0.02) return false
            }
            return true
        }

        // Return true if balls are not moving and cueball exists
        const canShoot = () => { 
            return !!cueBall && ballsAreSleeping() 
        }

        const mouse = Mouse.create((render as any).canvas);
        (mouse as any).pixelRatio = 1; // we’ll map coords manually

        const mc = MouseConstraint.create(engine, {
        mouse,
        constraint: { stiffness: 0.2, render: { visible: false } }
        });
        mc.collisionFilter.mask = 0x0000;
        Composite.add(engine.world, mc);

        // Mapper for correct mouse function after rotate
        function updateMouseFromEvent(e: MouseEvent) {
            const rect = (render as any).canvas.getBoundingClientRect();
            const cssW = rect.width;   // visual width  = HEIGHT when rotated
            const cssH = rect.height;  // visual height = WIDTH  when rotated
            const canW = (render as any).options.width;   // logical canvas width  = WIDTH
            const canH = (render as any).options.height;  // logical canvas height = HEIGHT

            const u = e.clientX - rect.left; // screen X in rotated box
            const v = e.clientY - rect.top;  // screen Y in rotated box

            let xCanvas: number, yCanvas: number;

            if (rotatedRef.current) {
                // 90° CW inverse:
                // x = v' ; y = H - u'
                const vToX = canW / cssH; // v spans cssH -> x spans canW
                const uToY = canH / cssW; // u spans cssW -> y spans canH
                xCanvas = v * vToX;
                yCanvas = canH - (u * uToY);
            } else {
                const uToX = canW / cssW;
                const vToY = canH / cssH;
                xCanvas = u * uToX;
                yCanvas = v * vToY;
            }

            mouse.position.x = xCanvas;
            mouse.position.y = yCanvas;
        }

        // Ball place 
        const onMouseDown = () => {
            if (!canShoot()) return
            // Set aiming
            aiming = true;
            if (cueBall) {
                // Vector.sub subtracts two vectors
                const v = Vector.sub(mouse.position, cueBall.position)
                // If the vector length is big enough set aim direction 
                if (Vector.magnitude(v) > 0.0001) {
                    aimDir = Vector.normalise(v);
                }
            }
            // Reset pull force
            pull = 0
        }
        const onMouseMove = () => {
            if (!aiming || !cueBall) return
            // Get the offset of the mouse pos and cueball pos
            const off = Vector.sub(mouse.position, cueBall.position)
            // Get the dot product - angle between them - Skalarni soucin 24.9.2025 hodina matematiky
            // dot > 0  - mouse is *in front of* the cue ball (same direction as aimDir)
            // dot < 0  - mouse is *behind* the cue ball (opposite aimDir) - pulling back
            const dot = Vector.dot(off, aimDir)
            // Calculate pull strength - how far in the opposite of aim direction is mouse
            pull = Math.max(0, Math.min(MAX_PULL, -dot))
            // Update powerbar ui
            if (powerBar){
                powerBar.style.height = ((pull / MAX_PULL) * 100).toFixed(1) + '%';
            }
        }
        const onMouseUp = () => {
            if (!aiming || !cueBall) return
            aiming = false; // Reset aiming
            if (pull > 1) {
                // Calculate power and velocity
                const power = pull / MAX_PULL
                const shotVel = Vector.mult(aimDir, MAX_SPEED * power)
                // Set velocity to the cueball
                Body.setVelocity(cueBall, shotVel)
            }
            // Increment stroke
            setStrokes((prev)=>prev+1)
            pull = 0; // Reset pull
            // Clean the power bar
            if (powerBar){
                powerBar.style.height = '0%';
            }
        }

        const onDown = (e: MouseEvent) => { updateMouseFromEvent(e); onMouseDown(); };
        const onMove = (e: MouseEvent) => { updateMouseFromEvent(e); onMouseMove(); };
        const onUp   = (e: MouseEvent) => { updateMouseFromEvent(e); onMouseUp(); };

        (render.canvas as HTMLCanvasElement).addEventListener('mousedown', onDown);
        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);


        // Keep aim updated when not pulling
        Events.on(runner as unknown as Matter.Events, 'beforeTick', () => {            
            if (canShoot() && !aiming && cueBall) {

                const v = Vector.sub(mouse.position, cueBall.position)
                if (Vector.magnitude(v) > 0.0001) {
                    aimDir = Vector.normalise(v);
                }
            }
        })

        // PocketxBalls collision handling - listens for any colision
        Events.on(engine, 'collisionStart', (ev: Matter.IEventCollision<Matter.Engine>) => {
            // Event can contain multiple pairs so we go through all
            for (const pair of ev.pairs) {
                // Get the collision pair
                const { bodyA, bodyB } = pair;
                // Is A or B a pocket
                const AisPocket = pocketsBodies.includes(bodyA);
                const BisPocket = pocketsBodies.includes(bodyB);
                // Find if one is a ball
                // If either one is not static its a ball
                const ball = (AisPocket && !bodyB.isStatic) ? bodyB
                        : (BisPocket && !bodyA.isStatic) ? bodyA
                        : null
                // If its a ball continue
                if (ball && (ball as any).circleRadius === BALL_R) {
                    const id = (ball as any).ballId as number | null; // 0..15 (0 = cue), or null if unset
                    if(id && id>0){
                        setScoredBalls((prev: number[]) => [...prev, id].sort((a, b) => a - b));
                    }
                    // If its cueball respawn it
                    if (ball.label === 'cueBall') {
                        setTimeout(() => respawnCueBall(), 30)
                    }
                    // Remove the ball and remove it from poolBalls array
                    Composite.remove(engine.world, ball);
                    const idx = poolBalls.indexOf(ball);
                    if (idx >= 0){
                        poolBalls.splice(idx,1);
                    }
                }
            }
        })


        // Listen to Reset button from App
        const resetHandler: EventListener = () => resetRack()
        document.addEventListener('POOL_RESET', resetHandler)

        // Cleanup on unmount
        return () => {
        document.removeEventListener('POOL_RESET', resetHandler);

        (render.canvas as HTMLCanvasElement).removeEventListener('mousedown', onMouseDown)
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
        
        (render.canvas as HTMLCanvasElement).removeEventListener('mousedown', onDown);
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onUp);

        Render.stop(render); 
        Runner.stop(runner)
        Composite.clear(engine.world, false); 
        Engine.clear(engine)
        render.canvas.remove(); 
        (render as any).textures = {}
        }
    }, [size, rotated, setScoredBalls])

    return (
        <div className={styles.TableWrap}>

            <div
            className={`${rotated ? styles.rotApply : ''} ${styles.rotOuter}`}
            style={{
            // visual box: when rotated, it’s HEIGHT x WIDTH
            width: rotated ? `${size.height}px` : `${size.width}px`,
            height: rotated ? `${size.width}px` : `${size.height}px`,
            }}
        >
            <div className={rotated ? styles.rotInner : ''}>
            <div
                id="tableWrap"
                ref={hostRef}
                className={styles.Table}
                style={{ width: size.width, height: size.height }}
            />
            </div>
        </div>

        </div>
    )
}






































/*
Normal version




import React, { useEffect, useRef, useState } from 'react'
import {Engine, Render, Runner, Composite, Bodies, Body, Events, Vector, Mouse, MouseConstraint} from 'matter-js';
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
import styles from "./PoolTable.module.css"













// Set physical variable

// Aspect used to compute sizes
const ASPECT_W = 900;
const ASPECT_H = 500;
const MAX_LOGICAL_W = 1100;

// viewport padding so it doesn’t touch edges
const VPAD_X = 16;
const VPAD_Y = 16;

// Physics tuning (dimensionless)
const MAX_PULL = 140;
const MIN_SHOT_SPEED = 0.05;
const FRICTION_AIR = 0.012;
const BALL_RESTITUTION = 0.96;
const BALL_FRICTION = 0.01;
const CUSHION_RESTITUTION = 0.9;

// Colors
const felt = 'var(--accent-color)';
const cushion = '#2E4E1E';
const pocketCol = '#111';

// Ball sprites
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

// Ball rim colors (optional)
const poolColors = [
    '#ffd54f','#ef5350','#42a5f5','#ab47bc','#66bb6a','#ffa726','#26c6da','#8d6e63',
    '#ffd54f','#ef5350','#42a5f5','#ab47bc','#66bb6a','#ffa726','#26c6da'
];

interface PoolTableProps {
    setScoredBalls: React.Dispatch<React.SetStateAction<number[]>>;
    setStrokes: React.Dispatch<React.SetStateAction<number>>
}
// Table
export default function PoolTable({setScoredBalls, setStrokes}: PoolTableProps) {

    // Calculate size
    function computeSize(rotated: boolean) {
        const vw = window.innerWidth - VPAD_X * 2;
        const vh = window.innerHeight - VPAD_Y * 2;

        // natural logical size
        let W0 = Math.min(MAX_LOGICAL_W, Math.floor(vw * 0.95));
        let H0 = Math.round(W0 * (ASPECT_H / ASPECT_W));

        // visual box we must fit into the viewport
        // when rotated 90°, visual width = H0 and visual height = W0
        const visW = rotated ? H0 : W0;
        const visH = rotated ? W0 : H0;

        const scale = Math.min(vw / visW, vh / visH, 1);

        // final logical canvas size (we rebuild world to these)
        const width = Math.round(W0 * scale);
        const height = Math.round(H0 * scale);

        return { width, height };
    }

    const [rotated, setRotated] = useState<boolean>(window.innerWidth < 1400);
    const [size, setSize] = useState(() => computeSize(rotated));
    const rotatedRef = useRef(rotated);
    useEffect(() => { rotatedRef.current = rotated; }, [rotated]);

    // respond to window resize + media query
    useEffect(() => {
        const mq = window.matchMedia('(max-width: 1400px)');
        const onChange = () => {
            const r = mq.matches;
            setRotated(r);
            setSize(computeSize(r));
        };
        mq.addEventListener('change', onChange);

        const onResize = () => setSize(computeSize(rotatedRef.current));
        window.addEventListener('resize', onResize);

        return () => {
            mq.removeEventListener('change', onChange);
            window.removeEventListener('resize', onResize);
        };
    }, []);


    // Table ref
    const hostRef = useRef<HTMLDivElement>(null)

    // Pocket centers helper (parametric)
    function pocketCenters(W: number, H: number, TABLE_INSET: number) {
        const left = TABLE_INSET;
        const right = W - TABLE_INSET;
        const top = TABLE_INSET;
        const bottom = H - TABLE_INSET;
        return {
            tl: { x: left, y: top },
            tm: { x: W / 2, y: top },
            tr: { x: right, y: top },
            bl: { x: left, y: bottom },
            bm: { x: W / 2, y: bottom },
            br: { x: right, y: bottom }
        };
    }

    useEffect(() => {
        // Return on no table
        if (!hostRef.current) return;
        // Current logical canvas size
        const WIDTH = size.width;
        const HEIGHT = size.height;

        // Scale geometry from a 900x500 logical design space
        const S = WIDTH / ASPECT_W;
        const TABLE_INSET = 36 * S;
        const POCKET_R = 22 * S;
        const BALL_R = 10.5 * S;

        // Sprite scale (textures are 256px)
        const SPRITE_PX = 700;
        const SCALE = (BALL_R * 2) / SPRITE_PX;
        // Get the hud power bar - outside of this elemend
        const powerBar = document.getElementById('powerBar') as HTMLDivElement
        // Engine & render
        const engine = Engine.create()
        engine.world.gravity.y = 0 // Unset gravity

        const render = Render.create({
            element: hostRef.current,
            engine,
            options: {
                width: WIDTH, 
                height: HEIGHT, 
                wireframes: false,
                background: felt, 
                pixelRatio: 1
            }
        })
        Render.run(render);
        // Starts the game loop
        const runner = Runner.create();
        Runner.run(runner, engine);

        // Bounds helpers - Physical borders for the table
        const bounds = { 
            left: TABLE_INSET, 
            right: WIDTH - TABLE_INSET, 
            top: TABLE_INSET, 
            bottom: HEIGHT - TABLE_INSET 
        }

        // Add cushions between the pockets
        const addCushions = () => {
            const table = TABLE_INSET * 0.6;
            const options = { isStatic: true, restitution: CUSHION_RESTITUTION, render: { fillStyle: cushion } };
            const pockets = pocketCenters(WIDTH, HEIGHT, TABLE_INSET);
            // Build all the segments [{startx, starty},{endx, endy}, table size]
            const segments: [{ x: number, y: number }, { x: number, y: number }, number][] = [
                [{ x: pockets.tl.x + POCKET_R, y: bounds.top - table / 2 }, { x: pockets.tm.x - POCKET_R, y: bounds.top - table / 2 }, table],
                [{ x: pockets.tm.x + POCKET_R, y: bounds.top - table / 2 }, { x: pockets.tr.x - POCKET_R, y: bounds.top - table / 2 }, table],
                [{ x: pockets.bl.x + POCKET_R, y: bounds.bottom + table / 2 }, { x: pockets.bm.x - POCKET_R, y: bounds.bottom + table / 2 }, table],
                [{ x: pockets.bm.x + POCKET_R, y: bounds.bottom + table / 2 }, { x: pockets.br.x - POCKET_R, y: bounds.bottom + table / 2 }, table],
                [{ x: bounds.left - table / 2, y: pockets.tl.y + POCKET_R }, { x: bounds.left - table / 2, y: pockets.bl.y - POCKET_R }, table],
                [{ x: bounds.right + table / 2, y: pockets.tr.y + POCKET_R }, { x: bounds.right + table / 2, y: pockets.br.y - POCKET_R }, table],
            ];
            // Create all the cushions -  need to compute center points, length, angle and then create
            // a - {startx, starty}, b - {endx, endy}, th - table size
            for (const [a,b,th] of segments) {
                const centerx = (a.x+b.x)/2;
                const centery = (a.y+b.y)/2;
                const length = Math.hypot(b.x-a.x,b.y-a.y);
                const angle = Math.atan2(b.y-a.y,b.x-a.x);
                // Create the rect
                const rect =  Bodies.rectangle(centerx, centery, length, th, options);
                // Add angle to the rect
                Body.setAngle(rect, angle)
                // Add to the scene
                Composite.add(engine.world, rect)
            }
        }

        // Pockets
        const pocketsBodies: Matter.Body[] = []
        // Generate pockets
        const addPockets = () => {
            // Get pocket sizes and generate
            const pockets = pocketCenters(WIDTH, HEIGHT, TABLE_INSET);
            const pocketArray = Object.values(pockets).map(p =>
                Bodies.circle(p.x, p.y, POCKET_R, { isStatic: true, isSensor: true, render: { fillStyle: pocketCol } })
            )
            // Add to scene
            pocketsBodies.push(...pocketArray)
            Composite.add(engine.world, pocketArray)
        }

        // Generate ball
        const  makeBall = (x:number, y:number, color='#fff', sprite: string | undefined, id?: number) => {
            const b = Bodies.circle(x, y, BALL_R, {
                restitution: BALL_RESTITUTION,
                frictionAir: FRICTION_AIR,
                friction: BALL_FRICTION,
                density: 0.0018,
                render: {
                    fillStyle: color,
                    strokeStyle: 'rgba(0,0,0,0.25)',
                    lineWidth: 1,
                    sprite: sprite ? { texture: sprite, xScale: SCALE, yScale: SCALE } : undefined,
                }
            });
            (b as any).ballId = id ?? null;
            b.label = id ? `ball-${id}` : b.label;
            return b;
        }

        // Generate rack with the balls
        const rackTriangle = (cx:number, cy:number) => {
            // gap between the balls
            const gap = BALL_R * 2.9;
            const rows = 5;
            let id = 1; // start after cue
            const balls: Matter.Body[] = [];
            for (let row=0; row<rows; row++){
                for (let i=0; i<=row; i++){
                    const x = cx + row*gap;
                    const y = cy - (row*gap)/2 + i*gap;
                    const sprite = SPRITES[id];
                    const color = poolColors[(id - 1) % poolColors.length];
                    balls.push(makeBall(x, y, color, sprite, id)); // sprite auto-picked from SPRITES[id]
                    id++;
                }
            }
            return balls
        }
        // Add the Pockets and cushions
        addPockets()
        addCushions()

        // -------------------------------------------
        // Draw the background before render to be under the balls and such
        Events.on(render as unknown as Matter.Events, 'beforeRender', () => {
            const ctx = (render as any).context as CanvasRenderingContext2D
            // Felt gradient
            const grad = ctx.createLinearGradient(0,0,0,HEIGHT)
            // Draw the felt
            grad.addColorStop(0,'#188a45'); 
            grad.addColorStop(1,'#0f5a2c')
            ctx.fillStyle = grad; 
            ctx.fillRect(0,0,WIDTH,HEIGHT)
        })

        // Felt gradient & rails + shadows + cue render
        Events.on(render as unknown as Matter.Events, 'afterRender', () => {
            // Create the context
            const ctx = (render as any).context as CanvasRenderingContext2D

            // Draw the rails
            ctx.save();
            ctx.strokeStyle = '#733515';
            ctx.lineWidth = 14 * S;
            ctx.strokeRect(7 * S, 7 * S, WIDTH - 14 * S, HEIGHT - 14 * S);
            ctx.restore();

            // Shadows
            ctx.save();
            ctx.globalCompositeOperation = 'destination-over';
            ctx.fillStyle = 'rgba(0,0,0,0.22)';
            for (const body of Composite.allBodies(engine.world)) {
                if (!body.circleRadius || body.isStatic) continue;
                ctx.beginPath();
                ctx.ellipse(
                body.position.x + 2 * S,
                body.position.y + 8 * S,
                body.circleRadius * 1.45,
                body.circleRadius * 0.8,
                0, 0, Math.PI * 2
                );
                ctx.fill();
            }
            ctx.restore();




            // Cue ball (the ball we hit) + Guide lines
            if (cueBall && canShoot() ) {
                const start = cueBall.position; // Start of the guide lines
                const lineLen = 180 * S; // Length og the guide lines
                // End of the guide lines
                const guideEnd = Vector.add(start, Vector.mult(aimDir, lineLen));
                // Draw the guide lines
                ctx.save();
                ctx.beginPath();
                ctx.moveTo(start.x,start.y); 
                ctx.lineTo(guideEnd.x,guideEnd.y);
                ctx.lineWidth = 2 * S;
                ctx.setLineDash([6 * S, 6 * S]);
                ctx.strokeStyle='rgba(255,255,255,0.45)';
                ctx.stroke(); 
                ctx.restore();

                // Stick sizes
                const baseLength = 160 * S; // Base length
                const extra = pull*0.75 * S; // Add the pull 
                const stickLen = baseLength + extra; // Final length
                const stickWidth = 8 * S; // Width
                const back = Vector.add(start, Vector.mult(aimDir, -(BALL_R+6 * S+stickLen)))
                const angle = Math.atan2(aimDir.y, aimDir.x); // Aimed angle
                // Draw the stick
                ctx.save()
                ctx.translate(back.x, back.y)
                ctx.rotate(angle)
                // Make stick have a gradient
                const stickGradient = ctx.createLinearGradient(0,0,stickLen,0)
                stickGradient.addColorStop(0,'#d8863a'); 
                stickGradient.addColorStop(0.75,'#d8863a'); 
                stickGradient.addColorStop(1,'#d8863a')
                ctx.fillStyle=stickGradient; 
                ctx.fillRect(0,-stickWidth/2,stickLen,stickWidth)
                ctx.fillStyle='#733515'; 
                ctx.fillRect(stickLen-6,-stickWidth/2,6 * S,stickWidth)
                ctx.restore()

                ctx.save();
                ctx.globalCompositeOperation = 'destination-over';
                ctx.fillStyle = 'rgba(0,0,0,0.22)';
                ctx.translate(back.x +6, back.y+ 6)
                ctx.rotate(angle)
                ctx.fillRect(0,-stickWidth/2,stickLen,stickWidth)

                ctx.fillRect(stickLen-6,-stickWidth/2,6 * S,stickWidth)
                ctx.restore()

                
            }
        })

        // Rack + Cue ball
        let cueBall: Matter.Body | null = null;
        const poolBalls: Matter.Body[] = [];

        // Respawn cue ball 
        const respawnCueBall = () => {
            // Remove if it exists
            if (cueBall){
                Composite.remove(engine.world, cueBall)
            }
            // Create and add tp the left quarter of the table - can tweek 
            cueBall = makeBall(WIDTH*0.25, HEIGHT/2, '#ffffff', SPRITES[0], 0)
            cueBall.label = 'cueBall'
            Composite.add(engine.world, cueBall)
        }

        // Reset ball rack
        const resetRack = () => {
            // Remove all the balls
            poolBalls.forEach(b => Composite.remove(engine.world,b))
            poolBalls.length = 0;
            // Remove and respawn cue ball
            if (cueBall){
                Composite.remove(engine.world, cueBall); 
                cueBall = null;
            }
            respawnCueBall();
            // Generate new triangle and add to the world
            const startX = WIDTH*0.62;
            const startY = HEIGHT/2;
            const racked = rackTriangle(startX, startY);
            poolBalls.push(...racked);
            Composite.add(engine.world, racked);
            // Reset strokes and scored balls
            setScoredBalls([]);
            setStrokes(0);
        }
        // Reset rack
        resetRack();

        // Input
        const rect = (render as any).canvas.getBoundingClientRect();
        console.log(
            'canvas backing store:', (render as any).canvas.width, (render as any).canvas.height,
            'css size:', rect.width, rect.height,
            'render pixelRatio:', (render as any).options.pixelRatio
        );
        // Flags
        let aiming = false;
        let aimDir = Vector.create(1,0);
        let pull = 0;
        const MAX_SPEED = 25

        // Check if all balls stand stilll
        const ballsAreSleeping = () => {
            // Get the balls and the cue ball
            const bodies = poolBalls.slice();
            if (cueBall){
                bodies.push(cueBall);
            }
            // Check all the velocities
            for (const body of bodies) {
                const velocity = body.velocity; // Normal velocity
                const w = body.angularVelocity; // Angular velocity
                if (Math.hypot(velocity.x,velocity.y) > MIN_SHOT_SPEED) return false
                if (Math.abs(w) > 0.02) return false
            }
            return true
        }

        // Return true if balls are not moving and cueball exists
        const canShoot = () => { 
            return !!cueBall && ballsAreSleeping() 
        }

        const mouse = Mouse.create((render as any).canvas);
        (mouse as any).pixelRatio = 1; // we’ll map coords manually

        const mc = MouseConstraint.create(engine, {
        mouse,
        constraint: { stiffness: 0.2, render: { visible: false } }
        });
        mc.collisionFilter.mask = 0x0000;
        Composite.add(engine.world, mc);

        // Mapper for correct mouse function after rotate
        function updateMouseFromEvent(e: MouseEvent) {
            const rect = (render as any).canvas.getBoundingClientRect();
            const cssW = rect.width;   // visual width  = HEIGHT when rotated
            const cssH = rect.height;  // visual height = WIDTH  when rotated
            const canW = (render as any).options.width;   // logical canvas width  = WIDTH
            const canH = (render as any).options.height;  // logical canvas height = HEIGHT

            const u = e.clientX - rect.left; // screen X in rotated box
            const v = e.clientY - rect.top;  // screen Y in rotated box

            let xCanvas: number, yCanvas: number;

            if (rotatedRef.current) {
                // 90° CW inverse:
                // x = v' ; y = H - u'
                const vToX = canW / cssH; // v spans cssH -> x spans canW
                const uToY = canH / cssW; // u spans cssW -> y spans canH
                xCanvas = v * vToX;
                yCanvas = canH - (u * uToY);
            } else {
                const uToX = canW / cssW;
                const vToY = canH / cssH;
                xCanvas = u * uToX;
                yCanvas = v * vToY;
            }

            mouse.position.x = xCanvas;
            mouse.position.y = yCanvas;
        }

        // Ball place 
        const onMouseDown = () => {
            if (!canShoot()) return
            // Set aiming
            aiming = true;
            if (cueBall) {
                // Vector.sub subtracts two vectors
                const v = Vector.sub(mouse.position, cueBall.position)
                // If the vector length is big enough set aim direction 
                if (Vector.magnitude(v) > 0.0001) {
                    aimDir = Vector.normalise(v);
                }
            }
            // Reset pull force
            pull = 0
        }
        const onMouseMove = () => {
            if (!aiming || !cueBall) return
            // Get the offset of the mouse pos and cueball pos
            const off = Vector.sub(mouse.position, cueBall.position)
            // Get the dot product - angle between them - Skalarni soucin 24.9.2025 hodina matematiky
            // dot > 0  - mouse is *in front of* the cue ball (same direction as aimDir)
            // dot < 0  - mouse is *behind* the cue ball (opposite aimDir) - pulling back
            const dot = Vector.dot(off, aimDir)
            // Calculate pull strength - how far in the opposite of aim direction is mouse
            pull = Math.max(0, Math.min(MAX_PULL, -dot))
            // Update powerbar ui
            if (powerBar){
                powerBar.style.height = ((pull / MAX_PULL) * 100).toFixed(1) + '%';
            }
        }
        const onMouseUp = () => {
            if (!aiming || !cueBall) return
            aiming = false; // Reset aiming
            if (pull > 1) {
                // Calculate power and velocity
                const power = pull / MAX_PULL
                const shotVel = Vector.mult(aimDir, MAX_SPEED * power)
                // Set velocity to the cueball
                Body.setVelocity(cueBall, shotVel)
            }
            // Increment stroke
            setStrokes((prev)=>prev+1)
            pull = 0; // Reset pull
            // Clean the power bar
            if (powerBar){
                powerBar.style.height = '0%';
            }
        }

        const onDown = (e: MouseEvent) => { updateMouseFromEvent(e); onMouseDown(); };
        const onMove = (e: MouseEvent) => { updateMouseFromEvent(e); onMouseMove(); };
        const onUp   = (e: MouseEvent) => { updateMouseFromEvent(e); onMouseUp(); };

        (render.canvas as HTMLCanvasElement).addEventListener('mousedown', onDown);
        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);


        // Keep aim updated when not pulling
        Events.on(runner as unknown as Matter.Events, 'beforeTick', () => {            
            if (canShoot() && !aiming && cueBall) {

                const v = Vector.sub(mouse.position, cueBall.position)
                if (Vector.magnitude(v) > 0.0001) {
                    aimDir = Vector.normalise(v);
                }
            }
        })

        // PocketxBalls collision handling - listens for any colision
        Events.on(engine, 'collisionStart', (ev: Matter.IEventCollision<Matter.Engine>) => {
            // Event can contain multiple pairs so we go through all
            for (const pair of ev.pairs) {
                // Get the collision pair
                const { bodyA, bodyB } = pair;
                // Is A or B a pocket
                const AisPocket = pocketsBodies.includes(bodyA);
                const BisPocket = pocketsBodies.includes(bodyB);
                // Find if one is a ball
                // If either one is not static its a ball
                const ball = (AisPocket && !bodyB.isStatic) ? bodyB
                        : (BisPocket && !bodyA.isStatic) ? bodyA
                        : null
                // If its a ball continue
                if (ball && (ball as any).circleRadius === BALL_R) {
                    const id = (ball as any).ballId as number | null; // 0..15 (0 = cue), or null if unset
                    if(id && id>0){
                        setScoredBalls((prev: number[]) => [...prev, id].sort((a, b) => a - b));
                    }
                    // If its cueball respawn it
                    if (ball.label === 'cueBall') {
                        setTimeout(() => respawnCueBall(), 30)
                    }
                    // Remove the ball and remove it from poolBalls array
                    Composite.remove(engine.world, ball);
                    const idx = poolBalls.indexOf(ball);
                    if (idx >= 0){
                        poolBalls.splice(idx,1);
                    }
                }
            }
        })


        // Listen to Reset button from App
        const resetHandler: EventListener = () => resetRack()
        document.addEventListener('POOL_RESET', resetHandler)

        // Cleanup on unmount
        return () => {
        document.removeEventListener('POOL_RESET', resetHandler);

        (render.canvas as HTMLCanvasElement).removeEventListener('mousedown', onMouseDown)
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
        
        (render.canvas as HTMLCanvasElement).removeEventListener('mousedown', onDown);
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onUp);

        Render.stop(render); 
        Runner.stop(runner)
        Composite.clear(engine.world, false); 
        Engine.clear(engine)
        render.canvas.remove(); 
        (render as any).textures = {}
        }
    }, [size, rotated, setScoredBalls])

    return (
        <div className={styles.TableWrap}>

            <div
            className={`${rotated ? styles.rotApply : ''} ${styles.rotOuter}`}
            style={{
            // visual box: when rotated, it’s HEIGHT x WIDTH
            width: rotated ? `${size.height}px` : `${size.width}px`,
            height: rotated ? `${size.width}px` : `${size.height}px`,
            }}
        >
            <div className={rotated ? styles.rotInner : ''}>
            <div
                id="tableWrap"
                ref={hostRef}
                className={styles.Table}
                style={{ width: size.width, height: size.height }}
            />
            </div>
        </div>

        </div>
    )
}
*/
































































































/*
Realtime version wop
import React, { useEffect, useRef, useState } from 'react';
import {
  Engine, Render, Runner, Composite, Bodies, Body, Events,
  Vector, Mouse, MouseConstraint
} from 'matter-js';
import type { IEventCollision, Engine as MatterEngine } from 'matter-js';
import { socket } from '../../lib/socket';
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
import styles from "./PoolTable.module.css";

// ------- config -------
// If the server is connected, we run in server-authoritative mode
const USE_SERVER = true;
function getMatchId() {
  const sp = new URLSearchParams(window.location.search);
  return sp.get('match') || 'room-1';
}
const MATCH_ID = getMatchId();

// canvas / physics
const ASPECT_W = 900;
const ASPECT_H = 500;
const MAX_LOGICAL_W = 1100;
const VPAD_X = 16, VPAD_Y = 16;

const MAX_PULL = 140;
const MIN_SHOT_SPEED = 0.05;
const FRICTION_AIR = 0.012;
const BALL_RESTITUTION = 0.96;
const BALL_FRICTION = 0.01;
const CUSHION_RESTITUTION = 0.9;

const felt = 'var(--accent-color)';
const cushion = '#2E4E1E';
const pocketCol = '#111';

// interpolation buffer (ms) – we play back slightly behind real time
const BUFFER_MS = 120;

const SPRITES: (string | undefined)[] = [
  Ball0, Ball1, Ball2, Ball3, Ball4, Ball5, Ball6, Ball7,
  Ball8, Ball9, Ball10, Ball11, Ball12, Ball13, Ball14, Ball15
];

const poolColors = [
  '#ffd54f','#ef5350','#42a5f5','#ab47bc','#66bb6a','#ffa726','#26c6da','#8d6e63',
  '#ffd54f','#ef5350','#42a5f5','#ab47bc','#66bb6a','#ffa726','#26c6da'
];

interface PoolTableProps {
  setScoredBalls: React.Dispatch<React.SetStateAction<number[]>>;
  setStrokes: React.Dispatch<React.SetStateAction<number>>;
  setUsers: (name: string)=>void;
}

type ServerBall = {
  id: number|null;
  pocketed: boolean;
  p:{x:number;y:number};
  v:{x:number;y:number};
  a:number;   // angle
  w:number;   // angularVelocity
};

type Frame = {
  ts: number;
  balls: ServerBall[];
};

export default function PoolTable({ setScoredBalls, setStrokes, setUsers }: PoolTableProps) {
  function computeSize(rotated: boolean) {
    const vw = window.innerWidth - VPAD_X * 2;
    const vh = window.innerHeight - VPAD_Y * 2;
    let W0 = Math.min(MAX_LOGICAL_W, Math.floor(vw * 0.95));
    let H0 = Math.round(W0 * (ASPECT_H / ASPECT_W));
    const visW = rotated ? H0 : W0;
    const visH = rotated ? W0 : H0;
    const scale = Math.min(vw / visW, vh / visH, 1);
    return { width: Math.round(W0 * scale), height: Math.round(H0 * scale) };
  }

  const [rotated, setRotated] = useState<boolean>(window.innerWidth < 1400);
  const [size, setSize] = useState(() => computeSize(rotated));
  const rotatedRef = useRef(rotated);
  useEffect(() => { rotatedRef.current = rotated; }, [rotated]);

  const framesRef = useRef<Frame[]>([]);
  const shotActiveRef = useRef(false);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 1400px)');
    const onChange = () => {
      const r = mq.matches;
      setRotated(r);
      setSize(computeSize(r));
    };
    mq.addEventListener('change', onChange);
    const onResize = () => setSize(computeSize(rotatedRef.current));
    window.addEventListener('resize', onResize);
    return () => {
      mq.removeEventListener('change', onChange);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  const hostRef = useRef<HTMLDivElement>(null);

  function pocketCenters(W: number, H: number, TABLE_INSET: number) {
    const left = TABLE_INSET, right = W - TABLE_INSET, top = TABLE_INSET, bottom = H - TABLE_INSET;
    return {
      tl: { x: left, y: top }, tm: { x: W / 2, y: top }, tr: { x: right, y: top },
      bl: { x: left, y: bottom }, bm: { x: W / 2, y: bottom }, br: { x: right, y: bottom }
    };
  }

  useEffect(() => {
    if (!hostRef.current) return;

    const WIDTH = size.width;
    const HEIGHT = size.height;

    const S = WIDTH / ASPECT_W;
    const fromServer = (p: {x:number;y:number}) => ({ x: p.x * S, y: p.y * S });

    const TABLE_INSET = 36 * S;
    const POCKET_R = 22 * S;
    const BALL_R = 10.5 * S;

    const SPRITE_PX = 700;
    const SCALE = (BALL_R * 2) / SPRITE_PX;

    const powerBar = document.getElementById('powerBar') as HTMLDivElement | null;

    const engine = Engine.create();
    engine.world.gravity.y = 0;

    const render = Render.create({
      element: hostRef.current!,
      engine,
      options: { width: WIDTH, height: HEIGHT, wireframes: false, background: felt, pixelRatio: 1 }
    });
    Render.run(render);

    const runner: Runner | null = USE_SERVER ? null : Runner.create();
    if (runner) Runner.run(runner, engine);

    const bounds = { left: TABLE_INSET, right: WIDTH - TABLE_INSET, top: TABLE_INSET, bottom: HEIGHT - TABLE_INSET };

    const pocketsBodies: Matter.Body[] = [];
    const addPockets = () => {
      const pockets = pocketCenters(WIDTH, HEIGHT, TABLE_INSET);
      const pocketArray = Object.values(pockets).map(p =>
        Bodies.circle(p.x, p.y, POCKET_R, { isStatic: true, isSensor: true, render: { fillStyle: pocketCol } })
      );
      pocketsBodies.push(...pocketArray);
      Composite.add(engine.world, pocketArray);
    };

    const addCushions = () => {
      const table = TABLE_INSET * 0.6;
      const options = { isStatic: true, restitution: CUSHION_RESTITUTION, render: { fillStyle: cushion } };
      const pockets = pocketCenters(WIDTH, HEIGHT, TABLE_INSET);
      const segments: [{ x: number, y: number }, { x: number, y: number }, number][] = [
        [{ x: pockets.tl.x + POCKET_R, y: bounds.top - table / 2 }, { x: pockets.tm.x - POCKET_R, y: bounds.top - table / 2 }, table],
        [{ x: pockets.tm.x + POCKET_R, y: bounds.top - table / 2 }, { x: pockets.tr.x - POCKET_R, y: bounds.top - table / 2 }, table],
        [{ x: pockets.bl.x + POCKET_R, y: bounds.bottom + table / 2 }, { x: pockets.bm.x - POCKET_R, y: bounds.bottom + table / 2 }, table],
        [{ x: pockets.bm.x + POCKET_R, y: bounds.bottom + table / 2 }, { x: pockets.br.x - POCKET_R, y: bounds.bottom + table / 2 }, table],
        [{ x: bounds.left - table / 2, y: pockets.tl.y + POCKET_R }, { x: bounds.left - table / 2, y: pockets.bl.y - POCKET_R }, table],
        [{ x: bounds.right + table / 2, y: pockets.tr.y + POCKET_R }, { x: bounds.right + table / 2, y: pockets.br.y - POCKET_R }, table],
      ];
      for (const [a,b,th] of segments) {
        const cx = (a.x+b.x)/2, cy = (a.y+b.y)/2;
        const len = Math.hypot(b.x-a.x,b.y-a.y);
        const ang = Math.atan2(b.y-a.y,b.x-a.x);
        const r = Bodies.rectangle(cx, cy, len, th, options);
        Body.setAngle(r, ang);
        Composite.add(engine.world, r);
      }
    };

    const makeBall = (x:number, y:number, color='#fff', sprite: string | undefined, id?: number) => {
      const b = Bodies.circle(x, y, BALL_R, {
        restitution: BALL_RESTITUTION,
        frictionAir: FRICTION_AIR,
        friction: BALL_FRICTION,
        density: 0.0018,
        render: { fillStyle: color, strokeStyle: 'rgba(0,0,0,0.25)', lineWidth: 1,
                  sprite: sprite ? { texture: sprite, xScale: SCALE, yScale: SCALE } : undefined }
      });
      (b as any).ballId = id ?? null;
      b.label = id === 0 ? 'cueBall' : (id ? `ball-${id}` : b.label);
      return b;
    };

    const spriteFor = (id: number) => SPRITES[id];
    const colorFor = (id: number) => {
      if (id === 0) return '#ffffff';
      return poolColors[(id - 1) % poolColors.length];
    };

    // Create if missing
    const poolBalls: Matter.Body[] = [];
    let cueBall: Matter.Body | null = null;

    const ensureBallBody = (id: number) => {
      const existing = Composite.allBodies(engine.world).find(b => (b as any).ballId === id);
      if (existing) return existing;
      const b = makeBall(WIDTH * 0.5, HEIGHT * 0.5, colorFor(id), spriteFor(id), id);
      Composite.add(engine.world, b);
      if (id !== 0) poolBalls.push(b);
      else cueBall = b;
      return b;
    };

    const rackTriangle = (cx:number, cy:number) => {
      const gap = BALL_R * 2.9, rows = 5;
      let id = 1; const balls: Matter.Body[] = [];
      for (let row=0; row<rows; row++){
        for (let i=0; i<=row; i++){
          const x = cx + row*gap;
          const y = cy - (row*gap)/2 + i*gap;
          const sprite = spriteFor(id);
          const color = colorFor(id);
          balls.push(makeBall(x, y, color, sprite, id));
          id++;
        }
      }
      return balls;
    };

    addPockets();
    addCushions();

    // --- render hooks (named for off) ---
    const beforeRenderHandler = () => {
      const ctx = (render as any).context as CanvasRenderingContext2D;
      const grad = ctx.createLinearGradient(0,0,0,HEIGHT);
      grad.addColorStop(0,'#188a45');
      grad.addColorStop(1,'#0f5a2c');
      ctx.fillStyle = grad;
      ctx.fillRect(0,0,WIDTH,HEIGHT);
    };

    let aiming = false;
    let aimDir = Vector.create(1,0);
    let pull = 0;

    const afterRenderHandler = () => {
      const ctx = (render as any).context as CanvasRenderingContext2D;

      // Rails
      ctx.save();
      ctx.strokeStyle = '#733515';
      ctx.lineWidth = 14 * S;
      ctx.strokeRect(7 * S, 7 * S, WIDTH - 14 * S, HEIGHT - 14 * S);
      ctx.restore();

      // Shadows
      ctx.save();
      ctx.globalCompositeOperation = 'destination-over';
      ctx.fillStyle = 'rgba(0,0,0,0.22)';
      for (const body of Composite.allBodies(engine.world)) {
        if (!body.circleRadius || body.isStatic) continue;
        ctx.beginPath();
        ctx.ellipse(body.position.x + 2*S, body.position.y + 8*S, body.circleRadius*1.45, body.circleRadius*0.8, 0, 0, Math.PI*2);
        ctx.fill();
      }
      ctx.restore();

      // Cue + guide (visible only when server says shot is over / idle)
      if (cueBall && canShoot()) {
        const start = cueBall.position;
        const lineLen = 180 * S;
        const guideEnd = Vector.add(start, Vector.mult(aimDir, lineLen));

        ctx.save();
        ctx.beginPath(); ctx.moveTo(start.x,start.y); ctx.lineTo(guideEnd.x,guideEnd.y);
        ctx.lineWidth = 2 * S; ctx.setLineDash([6*S, 6*S]); ctx.strokeStyle='rgba(255,255,255,0.45)'; ctx.stroke();
        ctx.restore();

        const baseLength = 160 * S, extra = pull*0.75 * S;
        const stickLen = baseLength + extra, stickWidth = 8 * S;
        const back = Vector.add(start, Vector.mult(aimDir, -(BALL_R+6*S+stickLen)));
        const angle = Math.atan2(aimDir.y, aimDir.x);

        ctx.save();
        ctx.translate(back.x, back.y); ctx.rotate(angle);
        const stickGradient = ctx.createLinearGradient(0,0,stickLen,0);
        stickGradient.addColorStop(0,'#d8863a'); stickGradient.addColorStop(0.75,'#d8863a'); stickGradient.addColorStop(1,'#d8863a');
        ctx.fillStyle=stickGradient; ctx.fillRect(0,-stickWidth/2,stickLen,stickWidth);
        ctx.fillStyle='#733515'; ctx.fillRect(stickLen-6,-stickWidth/2,6*S,stickWidth);
        ctx.restore();

        ctx.save();
        ctx.globalCompositeOperation = 'destination-over';
        ctx.translate(back.x+6, back.y+6); ctx.rotate(angle);
        ctx.fillStyle='rgba(0,0,0,0.22)';
        ctx.fillRect(0,-stickWidth/2,stickLen,stickWidth);
        ctx.fillRect(stickLen-6,-stickWidth/2,6*S,stickWidth);
        ctx.restore();
      }
    };

    Events.on(render as unknown as Matter.Events, 'beforeRender', beforeRenderHandler);
    Events.on(render as unknown as Matter.Events, 'afterRender',  afterRenderHandler);

    // Rack + Cue ball
    const respawnCueBall = () => {
      if (cueBall) Composite.remove(engine.world, cueBall);
      cueBall = makeBall(WIDTH*0.25, HEIGHT/2, '#ffffff', SPRITES[0], 0);
      cueBall.label = 'cueBall';
      Composite.add(engine.world, cueBall);
    };

    const resetRackLocal = () => {
      poolBalls.forEach(b => Composite.remove(engine.world,b));
      poolBalls.length = 0;
      if (cueBall){ Composite.remove(engine.world, cueBall); cueBall = null; }
      respawnCueBall();
      const racked = rackTriangle(WIDTH*0.62, HEIGHT/2);
      poolBalls.push(...racked);
      Composite.add(engine.world, racked);
      setScoredBalls([]); setStrokes(0);
      shotActiveRef.current = false;
      framesRef.current.length = 0;
    };

    // On mount create local rack so bodies exist; server snapshots will move them
    resetRackLocal();

    const ballsAreSleeping = () => {
      const bodies = [...poolBalls, cueBall!].filter(Boolean) as Matter.Body[];
      for (const body of bodies) {
        const v = body.velocity, w = (body as any).angularVelocity ?? 0;
        if (Math.hypot(v.x,v.y) > MIN_SHOT_SPEED) return false;
        if (Math.abs(w) > 0.02) return false;
      }
      return true;
    };

    const canShoot = () => {
      if (!cueBall) return false;
      // server-authoritative: only aim when shot not active
      return USE_SERVER ? !shotActiveRef.current : ballsAreSleeping();
    };

    // Mouse
    const mouse = Mouse.create((render as any).canvas);
    (mouse as any).pixelRatio = 1;
    const mc = MouseConstraint.create(engine, { mouse, constraint: { stiffness: 0.2, render: { visible: false } } });
    mc.collisionFilter.mask = 0x0000;
    Composite.add(engine.world, mc);

    function updateMouseFromEvent(e: MouseEvent) {
      const rect = (render as any).canvas.getBoundingClientRect();
      const cssW = rect.width, cssH = rect.height;
      const canW = (render as any).options.width, canH = (render as any).options.height;
      const u = e.clientX - rect.left, v = e.clientY - rect.top;
      let xCanvas: number, yCanvas: number;
      if (rotatedRef.current) { const vToX = canW / cssH, uToY = canH / cssW; xCanvas = v * vToX; yCanvas = canH - (u * uToY); }
      else { const uToX = canW / cssW, vToY = canH / cssH; xCanvas = u * uToX; yCanvas = v * vToY; }
      mouse.position.x = xCanvas; mouse.position.y = yCanvas;
    }

    const onMouseDown = () => {
      if (!canShoot()) return;
      aiming = true;
      if (cueBall) {
        const v = Vector.sub(mouse.position, cueBall.position);
        if (Vector.magnitude(v) > 0.0001) aimDir = Vector.normalise(v);
      }
      pull = 0;
    };
    const onMouseMove = () => {
      if (!aiming || !cueBall) return;
      const off = Vector.sub(mouse.position, cueBall.position);
      const dot = Vector.dot(off, aimDir);
      pull = Math.max(0, Math.min(MAX_PULL, -dot));
      if (powerBar) powerBar.style.height = ((pull / MAX_PULL) * 100).toFixed(1) + '%';
    };
    const onMouseUp = () => {
      if (!aiming || !cueBall) return;
      aiming = false;
      if (pull > 1) {
        const power = pull / MAX_PULL; // 0..1
        // If server is connected, use server shot; else fall back to local
        if (USE_SERVER && socket.connected) {
          shotActiveRef.current = true;
          socket.emit('shot:start', { matchId: MATCH_ID, dir: { x: aimDir.x, y: aimDir.y }, power });
        } else {
          const shotVel = Vector.mult(aimDir, 25 * power);
          Body.setVelocity(cueBall, shotVel as any);
        }
      }
      setStrokes(prev => prev + 1);
      pull = 0;
      if (powerBar) powerBar.style.height = '0%';
    };

    const onDown = (e: MouseEvent) => { updateMouseFromEvent(e); onMouseDown(); };
    const onMove = (e: MouseEvent) => { updateMouseFromEvent(e); onMouseMove(); };
    const onUp   = (e: MouseEvent) => { updateMouseFromEvent(e); onMouseUp(); };

    (render.canvas as HTMLCanvasElement).addEventListener('mousedown', onDown);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);

    // ======== SERVER KEYFRAME BUFFER + INTERPOLATION ========
    framesRef.current.length = 0;

    const idToBody = () => {
      const map = new Map<number, Matter.Body>();
      if (cueBall) map.set(0, cueBall);
      for (const b of poolBalls) map.set((b as any).ballId, b);
      return map;
    };

    const pushFrame = (balls: ServerBall[]) => {
      const ts = performance.now();
      framesRef.current.push({ ts, balls });
      if (!shotActiveRef.current) shotActiveRef.current = true;
      if (framesRef.current.length > 120) framesRef.current.shift();
    };

    const ANGPI2 = Math.PI * 2;
    const shortestDelta = (a: number, b: number) => {
      let d = (b - a) % ANGPI2;
      if (d < -Math.PI) d += ANGPI2;
      if (d >  Math.PI) d -= ANGPI2;
      return d;
    };
    const lerpAngle = (a: number, b: number, t: number) => a + shortestDelta(a, b) * t;

    const applySnapshotExact = (data: { balls: ServerBall[] }) => {
      for (const nb of data.balls) {
        if (nb.id == null) continue;
        const body = ensureBallBody(nb.id);
        if (nb.pocketed) {
          Composite.remove(engine.world, body);
          (body as any).pocketed = true;
          if (nb.id === 0) setTimeout(() => respawnCueBall(), 30);
          else {
            const idx = poolBalls.indexOf(body);
            if (idx >= 0) poolBalls.splice(idx, 1);
            setScoredBalls(prev => prev.includes(nb.id!) ? prev : [...prev, nb.id!].sort((a,b)=>a-b));
          }
          continue;
        }
        Body.setPosition(body, fromServer(nb.p) as any);
        Body.setAngle(body, nb.a);
      }
    };

    const smoothStep = () => {
      // keep aim updated when idle
      if (canShoot() && !aiming && cueBall) {
        const v = Vector.sub(mouse.position, cueBall.position);
        if (Vector.magnitude(v) > 0.0001) aimDir = Vector.normalise(v);
      }

      if (!USE_SERVER) return;
      const buf = framesRef.current;
      if (buf.length === 0) return;

      const now = performance.now();
      const playbackTime = now - BUFFER_MS;

      while (buf.length >= 2 && buf[1].ts <= playbackTime) buf.shift();

      const a = buf[0];
      const b = buf[1] ?? buf[0];

      const t0 = a.ts;
      const t1 = b.ts;
      let alpha = 0;
      if (t1 > t0) alpha = Math.min(1, Math.max(0, (playbackTime - t0) / (t1 - t0)));

      const mapBodies = idToBody();
      const mapA = new Map<number, ServerBall>();
      const mapB = new Map<number, ServerBall>();
      for (const sb of a.balls) if (sb.id != null) mapA.set(sb.id, sb);
      for (const sb of b.balls) if (sb.id != null) mapB.set(sb.id, sb);

      const ids = new Set<number>([...mapA.keys(), ...mapB.keys()]);
      ids.forEach(id => {
        const body = mapBodies.get(id) ?? ensureBallBody(id);
        const A = mapA.get(id);
        const B = mapB.get(id) ?? A;
        if (!A && !B) return;

        const pocketed = (A?.pocketed || B?.pocketed) ?? false;
        if (pocketed) {
          Composite.remove(engine.world, body);
          (body as any).pocketed = true;
          if (id === 0) setTimeout(() => respawnCueBall(), 30);
          else {
            const idx = poolBalls.indexOf(body);
            if (idx >= 0) poolBalls.splice(idx, 1);
            setScoredBalls(prev => prev.includes(id) ? prev : [...prev, id].sort((x,y)=>x-y));
          }
          return;
        }

        const pA = (A?.p ?? B!.p);
        const pB = (B?.p ?? A!.p);
        const aA = (A?.a ?? B!.a);
        const aB = (B?.a ?? A!.a);

        const ix = pA.x + (pB.x - pA.x) * alpha;
        const iy = pA.y + (pB.y - pA.y) * alpha;
        const ia = lerpAngle(aA, aB, alpha);

        Body.setPosition(body, fromServer({ x: ix, y: iy }) as any);
        Body.setAngle(body, ia);
      });
    };

    Events.on(render as any, 'beforeRender', smoothStep);

    // Local collision scoring disabled when server is on
    const onCollisionStart = (ev: IEventCollision<MatterEngine>) => {
      if (USE_SERVER) return;
      for (const pair of ev.pairs) {
        const { bodyA, bodyB } = pair;
        const AisPocket = pocketsBodies.includes(bodyA);
        const BisPocket = pocketsBodies.includes(bodyB);
        const ball = (AisPocket && !bodyB.isStatic) ? bodyB
                  : (BisPocket && !bodyA.isStatic) ? bodyA
                  : null;
        if (ball && (ball as any).circleRadius === BALL_R) {
          const id = (ball as any).ballId as number | null;
          if(id && id>0) setScoredBalls(prev => [...prev, id].sort((a,b)=>a-b));
          if (ball.label === 'cueBall') setTimeout(() => respawnCueBall(), 30);
          Composite.remove(engine.world, ball);
          const idx = poolBalls.indexOf(ball);
          if (idx >= 0) poolBalls.splice(idx,1);
        }
      }
    };
    Events.on(engine as MatterEngine, 'collisionStart', onCollisionStart);

    // Reset (local vs server)
    const resetHandler: EventListener = () => {
      if (USE_SERVER && socket.connected) {
        socket.emit('match:reset', { matchId: MATCH_ID });
      } else {
        resetRackLocal();
      }
    };
    document.addEventListener('POOL_RESET', resetHandler);

    // Rename handler from NamePanel
    const renameHandler = (e: Event) => {
      const ce = e as CustomEvent<{ name: string }>;
      const name = ce.detail?.name ?? '';
      if (!name.trim()) return;
      socket.emit('user:rename', { matchId: MATCH_ID, name }, (_ok: boolean) => {});
    };
    document.addEventListener('POOL_RENAME', renameHandler as EventListener);

    // ----- Server sync: init + keyframes + result -----
    if (USE_SERVER) socket.emit('client:join', { matchId: MATCH_ID });

    const onInit = (state: { balls: ServerBall[] }) => {
      // clear UI state and repopulate bodies if missing
      setScoredBalls([]);
      setStrokes(0);
      framesRef.current.length = 0;
      shotActiveRef.current = false;
      // ensure all balls exist then snap exact
      for (const b of state.balls) {
        if (b.id != null && !b.pocketed) ensureBallBody(b.id);
      }
      applySnapshotExact(state);
    };
    const onAccepted = () => { shotActiveRef.current = true; };
    const onKey = (state: { balls: ServerBall[] }) => { pushFrame(state.balls); };
    const onRes = (state: { balls: ServerBall[] }) => {
      applySnapshotExact(state);
      framesRef.current.length = 0;
      window.setTimeout(() => { shotActiveRef.current = false; }, BUFFER_MS);
    };
    const onMe = (me: { name?: string }) => {
      if (typeof me?.name === 'string') setUsers(me.name);
    };

    // Add socket listeners
    if (USE_SERVER) {
      socket.on('match:init', onInit);
      socket.on('shot:accepted', onAccepted);
      socket.on('shot:keyframe', onKey);
      socket.on('shot:result', onRes);
      socket.on('user:me', onMe);
    }

    // Cleanup
    return () => {
      document.removeEventListener('POOL_RESET', resetHandler);
      document.removeEventListener('POOL_RENAME', renameHandler as EventListener);
      (render.canvas as HTMLCanvasElement).removeEventListener('mousedown', onDown);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);

      Events.off(render as unknown as Matter.Events, 'beforeRender', beforeRenderHandler);
      Events.off(render as unknown as Matter.Events, 'afterRender',  afterRenderHandler);
      Events.off(render as any, 'beforeRender', smoothStep);
      Events.off(engine as MatterEngine, 'collisionStart', onCollisionStart);

      if (USE_SERVER) {
        socket.off('match:init', onInit);
        socket.off('shot:accepted', onAccepted);
        socket.off('shot:keyframe', onKey);
        socket.off('shot:result', onRes);
        socket.off('user:me', onMe);
      }

      Render.stop(render);
      if (runner) Runner.stop(runner);
      Composite.clear(engine.world, false);
      Engine.clear(engine);
      render.canvas.remove();
      (render as any).textures = {};
    };
// eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size, rotated, setScoredBalls, setStrokes, setUsers]);

  return (
    <div className={styles.TableWrap}>
      <div
        className={`${rotated ? styles.rotApply : ''} ${styles.rotOuter}`}
        style={{
          width: rotated ? `${size.height}px` : `${size.width}px`,
          height: rotated ? `${size.width}px` : `${size.height}px`,
        }}
      >
        <div className={rotated ? styles.rotInner : ''}>
          <div
            id="tableWrap"
            ref={hostRef}
            className={styles.Table}
            style={{ width: size.width, height: size.height }}
          />
        </div>
      </div>
    </div>
  );
}





*/
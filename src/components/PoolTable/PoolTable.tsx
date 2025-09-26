import React, { useEffect, useRef } from 'react'
import {Engine, Render, Runner, Composite, Bodies, Body, Events, Vector, Mouse, MouseConstraint} from 'matter-js';
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
import Ball16 from '../../assets/balls/16.png';
import styles from "./PoolTable.module.css"
/*
Notes
ctx.save() - saves the current canvas state
ctx.fillStyle = 'rgba(0,0,0,0.22)' - sets fillstyle
ctx.beginPath() - starts new path
ctx.ellipse() - adds and ellipse to the path
ctx.fill() - fills the path
ctx.restore() - restores the state so the fill color doesnt affect later drawings










*/













// Set physical variable

// Table dimensions
const WIDTH =  Math.min(1100, Math.floor(window.innerWidth * 0.95))
const HEIGHT = Math.round(WIDTH * (500/900))
const TABLE_INSET = 36
const POCKET_R = 22
const BALL_R = 10.5
// texture size and scale
const SPRITE_PX = 256;
const SCALE = (BALL_R * 2) / SPRITE_PX; 


// Maximal pull force
const MAX_PULL = 140
const MIN_SHOT_SPEED = 0.05
// Air friction
const FRICTION_AIR = 0.012
// Ball bounciness and friction
const BALL_RESTITUTION = 0.96
const BALL_FRICTION = 0.01
// Border bounciness
const CUSHION_RESTITUTION = 0.9 
// colors
const felt = '#157a3d'
const cushion = '#0b3f21'
const pocketCol = '#111'

// Ball sprites
const BallSpriteMap = [
    Ball1, Ball2, Ball3, Ball4,
    Ball5, Ball6, Ball7, Ball8,
    Ball9, Ball10, Ball11, Ball12,
    Ball13, Ball14, Ball15, Ball16,
] 

// Pockets dimensions
function pocketCenters() {
    const left = TABLE_INSET;
    const right = WIDTH - TABLE_INSET;
    const top = TABLE_INSET;
    const bottom = HEIGHT - TABLE_INSET;
    return {
        tl: { x: left, y: top }, 
        tm: { x: WIDTH/2, y: top }, 
        tr: { x: right, y: top },
        bl: { x: left, y: bottom },
        bm: { x: WIDTH/2, y: bottom }, 
        br: { x: right, y: bottom }
    }
}

// Colors for the balls
const poolColors = [
    '#ffd54f','#ef5350','#42a5f5','#ab47bc','#66bb6a','#ffa726','#26c6da','#8d6e63',
    '#ffd54f','#ef5350','#42a5f5','#ab47bc','#66bb6a','#ffa726','#26c6da'
]


// Table
export default function PoolTable() {
    // Table ref
    const hostRef = useRef<HTMLDivElement>(null)
    // Overlay for hud
    const overlayRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        // Return on no table
        if (!hostRef.current) return;
        // Get the hud power bar - outside of this elemend
        const powerBar = document.getElementById('powerBar') as HTMLDivElement
        // Display fps
        const fpsDisplay = document.createElement('div')
        fpsDisplay.id = 'fps'

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
                pixelRatio: window.devicePixelRatio
            }
        })
        Render.run(render);
        // Starts the game loop
        const runner = Runner.create();
        Runner.run(runner, engine);

        // Create overlay and add to scene (Contains fps and such)
        const overlay = document.createElement('div')
        overlay.id = 'overlay'
        overlay.style.width = `${WIDTH}px`
        overlay.style.height = `${HEIGHT}px`
        overlay.appendChild(fpsDisplay)
        hostRef.current.appendChild(overlay)

        // Bounds helpers - Physical borders for the table
        const bounds = { 
            left: TABLE_INSET, 
            right: WIDTH - TABLE_INSET, 
            top: TABLE_INSET, 
            bottom: HEIGHT - TABLE_INSET 
        }

        // Add cushions between the pockets
        const addCushions = () => {
            const table = TABLE_INSET * 0.6
            // Config the options
            const options = { isStatic: true, restitution: CUSHION_RESTITUTION, render: { fillStyle: cushion } }
            // Get the pocket centers
            const pockets = pocketCenters();
            // Build all the segments [{startx, starty},{endx, endy}, table size]
            const segments:[{x:number,y:number},{x:number,y:number},number][] = [
                [{x:pockets.tl.x+POCKET_R,y:bounds.top- table/2},{x:pockets.tm.x-POCKET_R,y:bounds.top- table/2}, table],
                [{x:pockets.tm.x+POCKET_R,y:bounds.top- table/2},{x:pockets.tr.x-POCKET_R,y:bounds.top- table/2}, table],
                [{x:pockets.bl.x+POCKET_R,y:bounds.bottom+ table/2},{x:pockets.bm.x-POCKET_R,y:bounds.bottom+ table/2}, table],
                [{x:pockets.bm.x+POCKET_R,y:bounds.bottom+ table/2},{x:pockets.br.x-POCKET_R,y:bounds.bottom+ table/2}, table],
                [{x:bounds.left- table/2,y:pockets.tl.y+POCKET_R},{x:bounds.left- table/2,y:pockets.bl.y-POCKET_R}, table],
                [{x:bounds.right+ table/2,y:pockets.tr.y+POCKET_R},{x:bounds.right+ table/2,y:pockets.br.y-POCKET_R}, table],
            ]
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
            const pockets = pocketCenters();
            const pocketArray = Object.values(pockets).map(p =>
                Bodies.circle(p.x, p.y, POCKET_R, { isStatic: true, isSensor: true, render: { fillStyle: pocketCol } })
            )
            console.log(pockets )
            // Add to scene
            pocketsBodies.push(...pocketArray)
            Composite.add(engine.world, pocketArray)
        }

        // Generate ball
        const  makeBall = (x:number, y:number, color='#fff', sprite: string) => {
            return Bodies.circle(x, y, BALL_R, {
                restitution: BALL_RESTITUTION,
                frictionAir: FRICTION_AIR,
                friction: BALL_FRICTION,
                density: 0.0018,
                render: { fillStyle: color, strokeStyle: 'rgba(0,0,0,0.25)', lineWidth: 1, sprite: sprite ? { 
                    texture: sprite,
                    xScale: SCALE,
                    yScale: SCALE
                } : undefined }
            })
        }

        // Generate rack with the balls
        const rackTriangle = (cx:number, cy:number) => {
            // gap between the balls
            const gap = BALL_R*2.9;
            const rows=5
            let ballNumber = 1;
            // Generate all the balls
            const balls: Matter.Body[] = []
            for (let row=0; row<rows; row++){
                for (let i=0; i<=row; i++){
                    const x = cx + row*gap
                    const y = cy - (row*gap)/2 + i*gap
                    balls.push(makeBall(x,y, poolColors[balls.length % poolColors.length], BallSpriteMap[ballNumber]));
                    ballNumber++;
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
            ctx.strokeStyle='#733515'; 
            ctx.lineWidth=14; 
            // x, y, width, height
            ctx.strokeRect(7,7,WIDTH-14,HEIGHT-14); 
            ctx.restore()

            // Generate the balls and shadows
            ctx.save();
            ctx.globalCompositeOperation = 'destination-over'
            ctx.fillStyle='rgba(0,0,0,0.22)'
            for (const body of Composite.allBodies(engine.world)) {
                // Skip if boty isnt circular
                if (!body.circleRadius || body.isStatic) continue;
                ctx.beginPath();
                ctx.ellipse(body.position.x+3,body.position.y+6,body.circleRadius*1.05,body.circleRadius*0.6,0,0,Math.PI*2);
                ctx.fill();
            }
            ctx.restore();




            // Cue ball (the ball we hit) + Guide lines
            if (cueBall && canShoot() ) {
                const start = cueBall.position; // Start of the guide lines
                const lineLen = 180; // Length og the guide lines
                // End of the guide lines
                const guideEnd = Vector.add(start, Vector.mult(aimDir, lineLen));
                // Draw the guide lines
                ctx.save();
                ctx.beginPath();
                ctx.moveTo(start.x,start.y); 
                ctx.lineTo(guideEnd.x,guideEnd.y);
                ctx.lineWidth=2; 
                ctx.setLineDash([6,6]); 
                ctx.strokeStyle='rgba(255,255,255,0.45)';
                ctx.stroke(); 
                ctx.restore();

                // Stick sizes
                const baseLength = 160; // Base length
                const extra = pull*0.75; // Add the pull 
                const stickLen = baseLength + extra; // Final length
                const stickWidth = 8; // Width
                const back = Vector.add(start, Vector.mult(aimDir, -(BALL_R+6+stickLen)))
                const angle = Math.atan2(aimDir.y, aimDir.x); // Aimed angle
                // Draw the stick
                ctx.save()
                ctx.translate(back.x, back.y)
                ctx.rotate(angle)
                // Make stick have a gradient
                const stickGradient = ctx.createLinearGradient(0,0,stickLen,0)
                stickGradient.addColorStop(0,'#e1c699'); 
                stickGradient.addColorStop(0.75,'#c29a64'); 
                stickGradient.addColorStop(1,'#996633')
                ctx.fillStyle=stickGradient; 
                ctx.fillRect(0,-stickWidth/2,stickLen,stickWidth)
                ctx.fillStyle='#3aa3ff'; 
                ctx.fillRect(stickLen-6,-stickWidth/2,6,stickWidth)
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
            cueBall = makeBall(WIDTH*0.25, HEIGHT/2, '#ffffff', BallSpriteMap[0])
            console.log(WIDTH, HEIGHT)
            console.log(cueBall.position)
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
        }
        // Reset rack
        resetRack();

        // Input
        const mouse = Mouse.create((render as any).canvas);
        const mc = MouseConstraint.create(engine, { mouse, constraint: { stiffness: 0.2, render: { visible: false } } });
        // disable dragging physics bodies
        mc.collisionFilter.mask = 0x0000;
        Composite.add(engine.world, mc);
        

        // Flags 
        let aiming=false; 
        let aimDir = Vector.create(1,0)
        let pull = 0
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
                powerBar.style.width = ((pull / MAX_PULL) * 100).toFixed(1) + '%';
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
            pull = 0; // Reset pull
            // Clean the power bar
            if (powerBar){
                powerBar.style.width = '0%';
            }
        }
        // Add the listeners
        (render.canvas as HTMLCanvasElement).addEventListener('mousedown', onMouseDown)
        window.addEventListener('mousemove', onMouseMove)
        window.addEventListener('mouseup', onMouseUp)

        // Keep aim updated when not pulling
        Events.on(runner as unknown as Matter.Events, 'beforeTick', () => {
            const ctx = (render as any).context as CanvasRenderingContext2D
            
            if (canShoot() && aiming && cueBall) {
                ctx.save();
                ctx.globalCompositeOperation = 'destination-over'
                ctx.fillStyle='rgba(0,0,0,0.22)'
                ctx.beginPath();
                ctx.ellipse(mouse.position.x+3,mouse.position.y+6,50*1.05,60*0.6,0,0,Math.PI*2);
                ctx.fill();
                
                ctx.save();
                ctx.globalCompositeOperation = 'destination-over'
                ctx.fillStyle='rgba(255, 255, 255, 0.98)'
                ctx.beginPath();
                ctx.ellipse(cueBall.position.x,cueBall.position.y,50*1.05,60*0.6,0,0,Math.PI*2);
                ctx.fill();
                
                ctx.restore();
                const v = Vector.sub(mouse.position, cueBall.position)
                console.log(mouse.position, cueBall.position, v)
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

        // FPS meter
        let frames=0;
        let last=performance.now()
        function rafFPS(){
            const now = performance.now(); frames++
            if (now - last > 500) {
                const fps = Math.round(frames * 1000 / (now - last))
                fpsDisplay.textContent = fps + ' fps'
                frames=0; last=now
            }
            requestAnimationFrame(rafFPS)
        }
        rafFPS();

        // Listen to Reset button from App
        const resetHandler: EventListener = () => resetRack()
        document.addEventListener('POOL_RESET', resetHandler)

        // Cleanup on unmount
        return () => {
        document.removeEventListener('POOL_RESET', resetHandler);
        (render.canvas as HTMLCanvasElement).removeEventListener('mousedown', onMouseDown)
        window.removeEventListener('mousemove', onMouseMove)
        window.removeEventListener('mouseup', onMouseUp)
        Render.stop(render); Runner.stop(runner)
        Composite.clear(engine.world, false); Engine.clear(engine)
        render.canvas.remove(); (render as any).textures = {}
        }
    }, [])

    return (
        <div className={styles.TableWrap}>

            <div
            id="tableWrap"
            ref={hostRef}
            className={styles.Table}
            style={{ width: WIDTH, height: HEIGHT }}
            ></div>
            <div className={styles.Legs}>
                <div className={styles.LegsTop}></div>
                <div className={styles.Leg}></div>
                <div className={styles.Leg}></div>
                <div className={styles.Leg}></div>


            </div>
        </div>
    )
}

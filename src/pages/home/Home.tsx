import { t } from "i18next";
import styles from "./Home.module.css"
import Matter, { Engine, Body, Events, Mouse, MouseConstraint, World,  Render, Runner, Bodies, Composite } from "matter-js";
import { useRef, useEffect } from "react";

const Home = () => {
    // Create engine and ref for the object that will have the physics stuff around - table for me
    const sceneRef = useRef<HTMLDivElement | null>(null);
    const engineRef = useRef(Engine.create());
    // ------------- Handle power ------------------
    const startingPoint = useRef({ x: 0, y: 0 });
    const stickRef = useRef({ x: 0, y: 0 });
    const endPoint = useRef({ x: 0, y: 0 });
    const mouseHolding = useRef(false)


    // Push power ref
    const pushPower = useRef(0);


    // Check if user has already placed stick - remove on play
    const stickPlaced = useRef(false);


    interface mousePos {
        x: Number;
        y: Number;
    }
    const changeStickShadow = (start: mousePos, end: mousePos) => {
        
    }
    const calculatePower = (start: mousePos, end: mousePos) => {
        
    }

    const push = () => {
        
    }
    const chargeStick = () => {
        
    }




    // ------------- Handle power ------------------


    useEffect(() => {
        // Create render instance
        const engine = engineRef.current;
        const world = engine.world;
        const el = sceneRef.current!;
        const w = el.clientWidth || 800;   // fallback if CSS hasn’t sized it yet
        const h = el.clientHeight || 600;

        // Create the renderer
        const render = Render.create({
            element: el,
            engine,
            options: {
                width: w,
                height: h,
                wireframes: false,
                background: "transparent",
            },
        });
        const thickness = 40;
        const halfT = thickness / 2;
        const cw = 40;

        // Pool stick
        const stick = Bodies.rectangle(stickRef.current.x, stickRef.current.y, 200, 20, {
            isStatic: true,
            chamfer: { radius: [8, 8, 8, 8] },
            render: { fillStyle: "#85532aff", strokeStyle: "#222", lineWidth: 2 },
        });
        const stick_shadow = Bodies.rectangle(stickRef.current.x, stickRef.current.y, 10, 20, {
            isStatic: true,
            chamfer: { radius: [8, 8, 8, 8] },
            render: { fillStyle: "#85532aff", strokeStyle: "#222", lineWidth: 2 },
        });
        const stick_cursor = Bodies.rectangle(startingPoint.current.x, startingPoint.current.y, 10, 10, {
            isStatic: true,
            chamfer: { radius: [8, 8, 8, 8] },
            render: { fillStyle: "#85532aff", strokeStyle: "#222", lineWidth: 2 },
        });

        // Walls aligned to the element edges
        // x, y, width, height
        // Top Wall
        const top_left = Bodies.rectangle(w / 4 + 20, halfT, w / 2 - 80, thickness, {
            isStatic: true,
            chamfer: { radius: [0, 0, 16, 16] },
            render: { fillStyle: "#e8e8e8", strokeStyle: "#222", lineWidth: 2 },
        });
        const top_right = Bodies.rectangle((w / 4) * 3 - 20, halfT, (w / 2) - 80, thickness, {
            isStatic: true,
            chamfer: { radius: [0, 0, 16, 16] },
            render: { fillStyle: "#e8e8e8", strokeStyle: "#222", lineWidth: 2 },
        });

        // Bottom Wall
        const bottom_left = Bodies.rectangle((w / 4) + 20, h - halfT, w / 2 - 80, thickness, {
            isStatic: true,
            chamfer: { radius: [16, 16, 0, 0] },
            render: { fillStyle: "#e8e8e8", strokeStyle: "#222", lineWidth: 2 },
        });
        const bottom_right = Bodies.rectangle(((w / 4) * 3) - 20, h - halfT, w / 2 - 80, thickness, {
            isStatic: true,
            chamfer: { radius: [16, 16, 0, 0] },
            render: { fillStyle: "#e8e8e8", strokeStyle: "#222", lineWidth: 2 },
        });

        // Side Walls
        const left = Bodies.rectangle(halfT, (h / 2) - 0, thickness, (h - thickness * 2) - 40, {
            isStatic: true,
            chamfer: { radius: [0, 16, 16, 0] },
            render: { fillStyle: "#e8e8e8", strokeStyle: "#222", lineWidth: 2 },
        });
        const right = Bodies.rectangle(w - halfT, (h / 2) - 0, thickness, (h - thickness * 2) - 40, {
            isStatic: true,
            chamfer: { radius: [16, 0, 0, 16] },
        render: { fillStyle: "#e8e8e8", strokeStyle: "#222", lineWidth: 2 },
        });

        // Holes
        const top_left_hole = Bodies.circle(cw / 2, cw / 2, 40, {
            isStatic: true,
            render: { fillStyle: "#3f3737ff", strokeStyle: "#222", lineWidth: 2 },
        })
        const top_center_hole = Bodies.circle(w / 2, cw / 2 - 30, 40, {
            isStatic: true,
            render: { fillStyle: "#3f3737ff", strokeStyle: "#222", lineWidth: 2 },
        })
        const top_right_hole = Bodies.circle(w - (cw / 2), cw / 2, 40, {
            isStatic: true,
            render: { fillStyle: "#3f3737ff", strokeStyle: "#222", lineWidth: 2 },
        })

        const bottom_left_hole = Bodies.circle(cw / 2, h - (cw / 2), 40, {
            isStatic: true,
            render: { fillStyle: "#3f3737ff", strokeStyle: "#222", lineWidth: 2 },
        })
        const bottom_center_hole = Bodies.circle(w / 2, h - (cw / 2) + 30, 40, {
            isStatic: true,
            render: { fillStyle: "#3f3737ff", strokeStyle: "#222", lineWidth: 2 },
        })
        const bottom_right_hole = Bodies.circle(w - (cw / 2), h - (cw / 2), 40, {
            isStatic: true,
            render: { fillStyle: "#3f3737ff", strokeStyle: "#222", lineWidth: 2 },
        })



        // Boxes spawned inside the container
        const boxA = Bodies.rectangle(w / 2 - 60, h / 2 - 100, 80, 80, {
        render: { fillStyle: "#6aa9ff", strokeStyle: "#222", lineWidth: 2 },
        });
        const boxB = Bodies.rectangle(w / 2 + 60, h / 2 - 40, 80, 80, {
        render: { fillStyle: "#c25216ff", strokeStyle: "#222", lineWidth: 2 },
        });





        // Add to the scene
        Composite.add(engine.world, [
            top_left,
            top_right,
            bottom_left,
            bottom_right,
            left,
            right,
            top_left_hole,
            top_center_hole,
            top_right_hole,
            bottom_left_hole,
            bottom_center_hole,
            bottom_right_hole,
            /*
            boxA,
            boxB,
            */
            stick,
            /*
            stick_shadow,
            */
            stick_cursor
        ]);



        // run
        const runner = Runner.create();
        Render.run(render);
        Runner.run(runner, engine);
        const originalShadowLength = stick_shadow.bounds.max.x - stick_shadow.bounds.min.x;

        const mouse = Mouse.create(render.canvas);

        // 2) create a mouse constraint (enables click-and-drag)
        const mouseConstraint = MouseConstraint.create(engine, {
            mouse,
            // optional: tune drag stiffness
            constraint: {
                stiffness: 0.2,
                render: { visible: false }
            }
        });
        Events.on(render, "afterRender", () => {
            const ctx = render.context;
            const start = startingPoint.current;
            const end = endPoint.current;
            const dx = end.x - start.x;
            const dy = end.y - start.y;
            const angle = Math.atan2(dy, dx);
            
            const stickLength = Math.sqrt(dx * dx + dy * dy) ?? 0;

            // Calculate tip position
            const tipX = start.x + Math.cos(angle) * stickLength;
            const tipY = start.y + Math.sin(angle) * stickLength;
            

            ctx.save();
            ctx.strokeStyle = "rgba(133, 83, 42, 0.5)";
            ctx.lineWidth = 12;
            ctx.beginPath();
            ctx.moveTo(start.x, start.y);
            ctx.lineTo(tipX, tipY);
            ctx.stroke();
            ctx.restore();
        });
       
        // Handle mouse down
        Events.on(mouseConstraint, 'mousedown', (evt) => {
            // Check if user hasnt already placed the stick
            if (stickPlaced.current) return;
            stickPlaced.current = true;

            const pos = { x: evt.mouse.position.x, y: evt.mouse.position.y }; // <-- Make a copy!
            startingPoint.current = pos;

            console.log('down at', pos);
            // Set stick position
            Body.setPosition(stick, pos)
            Body.setPosition(stick_shadow, pos)
            Body.setPosition(stick_cursor, pos)
            // Set starting point for calculating position and rotate
            // Set holding mouse ref
            mouseHolding.current = true;
            Body.applyForce( boxA, {x: boxA.position.x, y: boxA.position.y}, {x: 0.74, y: 1});
        });
        // Handle mouse up
Events.on(mouseConstraint, 'mouseup', (evt) => {
    if(!mouseHolding.current) return;
    console.log('up at', evt.mouse.position);

    // Swing the stick
    endPoint.current = { x: evt.mouse.position.x, y: evt.mouse.position.y };
    const start = startingPoint.current;
    const end = endPoint.current;
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const angle = Math.atan2(dy, dx);

    const stickLength = 200;
    // Move base all the way to end, then half again in the same direction
    const overshootBaseX = start.x + dx * (0.5);
    const overshootBaseY = start.y + dy * (-0.5);
    // Center position for Matter.js stick
    const centerX = overshootBaseX + Math.cos(angle) * (stickLength / 2);
    const centerY = overshootBaseY + Math.sin(angle) * (stickLength / 2);

    Matter.Body.setPosition(stick, { x: centerX, y: centerY });
    Matter.Body.setAngle(stick, angle);

    mouseHolding.current = false;
});

        Events.on(mouseConstraint, 'mousemove', (evt) => {
            if (!mouseHolding.current) return;
            endPoint.current = { x: evt.mouse.position.x, y: evt.mouse.position.y };
            const start = startingPoint.current;
            const end = endPoint.current;
            const dx = end.x - start.x;
            const dy = end.y - start.y;
            const angle = Math.atan2(dy, dx);

            // Move center so base stays at start
            const stickLength = 200;
            const centerX = end.x + Math.cos(angle) * (stickLength / 2);
            const centerY = end.y + Math.sin(angle) * (stickLength / 2);

            Matter.Body.setPosition(stick, { x: centerX, y: centerY });
            Matter.Body.setAngle(stick, angle);

            




            const tipX = start.x + Math.cos(angle) * stickLength;
            const tipY = start.y + Math.sin(angle) * stickLength;

            // Midpoint between base and tip
            const midX = (start.x + tipX) / 2;
            const midY = (start.y + tipY) / 2;

            // Set shadow position and angle
            // At the top of useEffect, after stick_shadow is created:

            // ...inside mousemove event...
            const shadowLength = Math.sqrt((tipX - start.x) ** 2 + (tipY - start.y) ** 2);
            /*
            // Reset scale before applying new scale (optional, but prevents distortion)
            Matter.Body.scale(stick_shadow, 1 / (stick_shadow.bounds.max.x - stick_shadow.bounds.min.x) * originalShadowLength, 1);

            // Now scale to match the new length
            Matter.Body.scale(stick_shadow, shadowLength / originalShadowLength, 1);
            Matter.Body.setPosition(stick_shadow, { x: centerX, y: centerY });
            Matter.Body.setAngle(stick_shadow, angle);
            */
            console.log(startingPoint.current)
            
        });

        // 3) add to the world
        World.add(world, mouseConstraint);

        // (important) keep render in sync with this mouse
        render.mouse = mouse;

        // cleanup on unmount
        return () => {
        Render.stop(render);
        Runner.stop(runner);
        Composite.clear(engine.world, false);
        Engine.clear(engine);
        render.canvas.remove();
        (render as any).textures = {};
        };
        
  }, []);


    return (
        <>
            <div className={styles.Page}>

                <div className={styles.Content}>

                    <div className={styles.Table} ref={sceneRef}></div>
                </div>
            </div>
        </>
    )
}

export default Home;




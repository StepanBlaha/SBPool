import styles from "./Home.module.css"
import Matter, { Engine, Render, Runner, Bodies, Composite } from "matter-js";
import { useRef, useEffect } from "react";

const Home = () => {
    // Create engine and ref for the object that will have the physics stuff around - table for me
    const sceneRef = useRef<HTMLDivElement | null>(null);
    const engineRef = useRef(Engine.create());

    useEffect(() => {
        // Create render instance
        const engine = engineRef.current;
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


        // Walls aligned to the element edges
        // x, y, width, height
        // Top Wall
        const top_left = Bodies.rectangle(w / 4 + 20, halfT, w / 2 - 80, thickness, {
            isStatic: true,
            chamfer: { radius: 20 },
            render: { fillStyle: "#e8e8e8", strokeStyle: "#222", lineWidth: 2 },
        });
        const top_right = Bodies.rectangle((w / 4) * 3 - 20, halfT, (w / 2) - 80, thickness, {
            isStatic: true,
            chamfer: { radius: 20 },
            render: { fillStyle: "#e8e8e8", strokeStyle: "#222", lineWidth: 2 },
        });

        // Bottom Wall
        const bottom_left = Bodies.rectangle((w / 4) + 20, h - halfT, w / 2 - 80, thickness, {
            isStatic: true,
            chamfer: { radius: 20 },
            render: { fillStyle: "#e8e8e8", strokeStyle: "#222", lineWidth: 2 },
        });
        const bottom_right = Bodies.rectangle(((w / 4) * 3) - 20, h - halfT, w / 2 - 80, thickness, {
            isStatic: true,
            chamfer: { radius: 20 },
            render: { fillStyle: "#e8e8e8", strokeStyle: "#222", lineWidth: 2 },
        });

        // Side Walls
        const left = Bodies.rectangle(halfT, (h / 2) - 0, thickness, (h - thickness * 2) - 40, {
            isStatic: true,
            chamfer: { radius: 20 },
            render: { fillStyle: "#e8e8e8", strokeStyle: "#222", lineWidth: 2 },
        });
        const right = Bodies.rectangle(w - halfT, (h / 2) - 0, thickness, (h - thickness * 2) - 40, {
            isStatic: true,
            chamfer: { radius: 20 },
        render: { fillStyle: "#e8e8e8", strokeStyle: "#222", lineWidth: 2 },
        });

        // Boxes spawned inside the container
        const boxA = Bodies.rectangle(w / 2 - 60, h / 2 - 100, 80, 80, {
        render: { fillStyle: "#6aa9ff", strokeStyle: "#222", lineWidth: 2 },
        });
        const boxB = Bodies.rectangle(w / 2 + 60, h / 2 - 40, 80, 80, {
        render: { fillStyle: "#c25216ff", strokeStyle: "#222", lineWidth: 2 },
        });
        // Add to the scene
        Composite.add(engine.world, [top_left, top_right, bottom_left, bottom_right, left, right, boxA, boxB]);

        // run
        const runner = Runner.create();
        Render.run(render);
        Runner.run(runner, engine);

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
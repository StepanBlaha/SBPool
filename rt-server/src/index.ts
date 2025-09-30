import { createServer } from 'http';
import { Server } from 'socket.io';

// Matter.js CJS/ESM interop shim
import * as MatterNS from 'matter-js';
const Matter: any = (MatterNS as any).Engine ? MatterNS : (MatterNS as any).default;
const { Engine, Composite, Bodies, Body, Events, Vector } = Matter;

// tady bude list pulenyma a celyma

type BallBody = Matter.Body;

interface Room {
    id: string;
    engine: Matter.Engine;
    cueBall: Matter.Body;
    balls: Matter.Body[];
    pockets: Matter.Body[];
    busy: boolean; // Makes sure to stop concurrent shots
    cuePocketed?: boolean;
    ticker?: NodeJS.Timeout; // Interval for physics
}

interface SessionInfo {
    socketId: string;
    userId?: string | null;
    deviceId?: string | null;
    tabId?: string | null;
    matchId?: string | null;
    ip: string;
    ua?: string | string[] | undefined;
    connectedAt: number;
    name: string; // <-- display name for this client
}
// Create the server
const http = createServer();
const io = new Server(http, { cors: { origin: '*' } });

// Tracking sessions 
const sessions = new Map<string, SessionInfo>();        // socketId -> info
const socketsByUser = new Map<string, Set<string>>();   // userId -> socketIds
const socketsByDevice = new Map<string, Set<string>>(); // deviceId -> socketIds

// Persisted names (optional persistence across tabs/reconnects if you send these IDs)
const namesByUser = new Map<string, string>();   // userId -> name
const namesByDevice = new Map<string, string>(); // deviceId -> name

function indexAdd(map: Map<string, Set<string>>, key?: string | null, sid?: string) {
    if (!key || !sid) return;
    if (!map.has(key)) map.set(key, new Set());
    map.get(key)!.add(sid);
}
function indexDel(map: Map<string, Set<string>>, key?: string | null, sid?: string) {
    if (!key || !sid) return;
    const set = map.get(key);
    if (!set) return;
    set.delete(sid);
    if (set.size === 0) map.delete(key);
}

// Resolve an initial name for a connecting socket
function resolveInitialName(socketId: string, userId?: string|null, deviceId?: string|null) {
    if (userId && namesByUser.has(userId)) return namesByUser.get(userId)!;
    if (deviceId && namesByDevice.has(deviceId)) return namesByDevice.get(deviceId)!;
    return `Guest-${socketId.slice(0, 5)}`;
}

// Get the sessions logged in the room
function participantsInRoom(roomId: string) {
    const room = io.sockets.adapter.rooms.get(roomId);
    if (!room) return [];
    return [...room].map((sid) => {
        const s = io.sockets.sockets.get(sid);
        if (!s) return null;
        const meta = sessions.get(s.id);
        return meta ? {
            socketId: meta.socketId,
            userId: meta.userId,
            deviceId: meta.deviceId,
            tabId: meta.tabId,
            name: meta.name, // include name
        } : { socketId: s.id, name: `Guest-${s.id.slice(0,5)}` };
    }).filter(Boolean) as any[];
}

// Optional auth/identity check before connection.
// Provide userId via token if you have auth; otherwise we still accept anonymous.
io.use((socket, next) => {
    const auth = socket.handshake.auth ?? {};
    // e.g. const userId = verifyJWT(auth.token)
    const userId = (auth.userId as string | undefined) ?? null;
    const deviceId = (auth.deviceId as string | undefined) ?? null;
    const tabId = (auth.tabId as string | undefined) ?? null;

    socket.data.userId = userId;
    socket.data.deviceId = deviceId;
    socket.data.tabId = tabId;
    next();
});

// ------------- POOL WORLD -------------
/** Build a headless table with cushions, pockets, cue and rack */
function createWorld() {
    // Sets gravity to 0
    const engine = Engine.create();
    engine.world.gravity.y = 0;

    // Dimensions
    const Width = 900
    const Height = 500
    const TI = 36
    const PocketRadius = 22
    const BallRadius = 10.5;

    // Add cushions
    const addSeg = (ax: number, ay: number, bx: number, by: number, th: number) => {
        const cx = (ax + bx) / 2, cy = (ay + by) / 2; // <-- fix
        const len = Math.hypot(bx - ax, by - ay);
        const ang = Math.atan2(by - ay, bx - ax);
        const r = Bodies.rectangle(cx, cy, len, th, { isStatic: true, restitution: 0.9 });
        Body.setAngle(r, ang);
        Composite.add(engine.world, r);
    };
    const t = TI * 0.6, left = TI, right = Width - TI, top = TI, bottom = Height- TI;
    addSeg(left + PocketRadius, top - t/2, Width/2 - PocketRadius, top - t/2, t);
    addSeg(Width/2 + PocketRadius, top - t/2, right - PocketRadius, top - t/2, t);
    addSeg(left + PocketRadius, bottom + t/2, Width/2 - PocketRadius, bottom + t/2, t);
    addSeg(Width/2 + PocketRadius, bottom + t/2, right - PocketRadius, bottom + t/2, t);
    addSeg(left - t/2, top + PocketRadius, left - t/2, bottom - PocketRadius, t);
    addSeg(right + t/2, top + PocketRadius, right + t/2, bottom - PocketRadius, t);

    // Add pockets
    const pockets = [
        { x: left, y: top }, { x: Width/2, y: top }, { x: right, y: top },
        { x: left, y: bottom }, { x: Width/2, y: bottom }, { x: right, y: bottom }
    ].map(p => Bodies.circle(p.x, p.y, PocketRadius, { isStatic: true, isSensor: true }));
    Composite.add(engine.world, pockets);

    // Create Balls
    const makeBall = (id: number, x: number, y: number) => {
        const b = Bodies.circle(x, y, BallRadius, {
            restitution: 0.96, frictionAir: 0.012, friction: 0.01, density: 0.0018
        });
        (b as any).ballId = id;
        b.label = id === 0 ? 'cueBall' : `ball-${id}`;
        return b;
    };

    // Create CueBall
    const cueBall = makeBall(0, Width* 0.25, Height / 2);
    Composite.add(engine.world, cueBall);

    const balls: BallBody[] = [];
    const gap = BallRadius * 2.9;
    let id = 1;
    for (let row = 0; row < 5; row++) {
        for (let i = 0; i <= row; i++) {
            if (id > 15) break;
            balls.push(makeBall(id++, Width*0.62 + row*gap, Height/2 - (row*gap)/2 + i*gap));
        }
    }
    Composite.add(engine.world, balls);

    // Handle pocket and ball collision
    const onCollision = (ev: any) => {
        for (const pair of ev.pairs) {
            const { bodyA, bodyB } = pair;
            const AisPocket = pockets.includes(bodyA);
            const BisPocket = pockets.includes(bodyB);
            const ball = AisPocket && !bodyB.isStatic ? bodyB : BisPocket && !bodyA.isStatic ? bodyA : null;
            if (ball) {
                Composite.remove(engine.world, ball);
                (ball as any).pocketed = true;
                if ((ball as any).ballId === 0) {
                    (engine as any).__cuePocketed = true;
                }
            }
        }
    };
    Events.on(engine, 'collisionStart', onCollision);
    return { engine, cueBall, balls, pockets };
}
// Check velocity to determine whether the balls are moving or not
function sleeping(cueBall: BallBody, balls: BallBody[]) {
    const bodies = [cueBall, ...balls].filter(b => !(b as any).pocketed);
    for (const b of bodies) {
        const v = b.velocity; const w = (b as any).angularVelocity ?? 0;
        if (Math.hypot(v.x, v.y) > 0.05) return false;
        if (Math.abs(w) > 0.02) return false;
    }
    return true;
}
// Render each balls state
//  Now returns id, pocketed flag, and position
function snapshot(room: Room) {
    const all = [room.cueBall, ...room.balls];
    return {
        balls: all.map(b => ({
            id: (b as any).ballId ?? null,
            pocketed: Boolean((b as any).pocketed),
            p: { x: b.position.x, y: b.position.y },
            v: { x: b.velocity.x, y: b.velocity.y },
            a: b.angle,
            w: b.angularVelocity
        }))
    };
}
// Create room on first person join
const rooms = new Map<string, Room>();
function getRoom(matchId: string): Room {
    let r = rooms.get(matchId);
    if (!r) {
        const w = createWorld();
        r = { id: matchId, ...w, busy: false };
        rooms.set(matchId, r);
    }
    return r;
}
// Rebuild room
function rebuildRoom(room: Room) {
    if (room.ticker) { 
        clearInterval(room.ticker); room.ticker = undefined; 
    }
    const w = createWorld();
    room.engine = w.engine;
    room.cueBall = w.cueBall;
    room.balls = w.balls;
    room.pockets = w.pockets;
    room.busy = false;
    room.cuePocketed = false;
}

// Mains erver simulation engine
function simulateShotAsync(room: Room, matchId: string) {
    // Clear interval
    if (room.ticker) { 
        clearInterval(room.ticker); 
        room.ticker = undefined; 
    }
    // 120HZ 
    // 30FPS emits
    // 4 updates per emit
    const PHYS_DT_MS = 1000 / 120;   // 8.33 ms
    const EMIT_EVERY_MS = 1000 / 30; // 33.33 ms
    const STEPS_PER_TICK = Math.round(EMIT_EVERY_MS / PHYS_DT_MS); // === 4

    let ticks = 0;

    const finish = () => {
        if ((room.engine as any).__cuePocketed) {
            const BR = 10.5;
            const cue = Bodies.circle(900 * 0.25, 500 / 2, BR, {
                restitution: 0.96, frictionAir: 0.012, friction: 0.01, density: 0.0018
            });
            (cue as any).ballId = 0; cue.label = 'cueBall';
            Composite.add(room.engine.world, cue);
            room.cueBall = cue;
            (room.engine as any).__cuePocketed = false;
        }
        io.to(matchId).emit('shot:result', snapshot(room));
        room.busy = false;
    };

    room.ticker = setInterval(() => {
        for (let i = 0; i < STEPS_PER_TICK; i++) {
            Engine.update(room.engine, PHYS_DT_MS);
        }
        io.to(matchId).emit('shot:keyframe', snapshot(room));
        ticks++;

        if (sleeping(room.cueBall, room.balls) || ticks > 3000) {
            clearInterval(room.ticker);
            room.ticker = undefined;
            finish();
        }
    }, EMIT_EVERY_MS);
}

// Socket events
io.on('connection', socket => {

    // Get connection info
    const userId = (socket.data.userId as string | null) ?? null;
    const deviceId = (socket.data.deviceId as string | null) ?? null;
    const tabId = (socket.data.tabId as string | null) ?? null;

    // Resolve initial display name for this client
    const initialName = resolveInitialName(socket.id, userId, deviceId);

    // Add to joined in list
    const info: SessionInfo = {
        socketId: socket.id,
        userId, deviceId, tabId,
        ip: (socket.handshake.headers['x-forwarded-for'] as string) ?? socket.handshake.address,
        ua: socket.handshake.headers['user-agent'],
        connectedAt: Date.now(),
        name: initialName,
    };
    sessions.set(socket.id, info);
    indexAdd(socketsByUser, userId, socket.id);
    indexAdd(socketsByDevice, deviceId, socket.id);

    // allow client to requestpresence list
    socket.on('presence:list', ({ roomId }: { roomId: string }, cb?: (list: any[]) => void) => {
        const list = participantsInRoom(roomId);
        if (cb) cb(list);
        else socket.emit('presence:list', { roomId, list });
    });

    // Join room on client join
    socket.on('client:join', ({ matchId }: { matchId: string }) => {
        const room = getRoom(matchId);
        socket.data.matchId = matchId;
        socket.join(matchId);

        // tell the client who they are (for UI name field)
        socket.emit('user:me', { 
            socketId: socket.id, 
            userId, deviceId, tabId, 
            name: sessions.get(socket.id)!.name 
        });

        // notify others
        io.to(matchId).emit('presence:join', {
            roomId: matchId,
            who: { socketId: socket.id, userId, deviceId, tabId, name: sessions.get(socket.id)!.name }
        });

        // Send current state
        socket.emit('match:init', snapshot(room));
    });

    // Handle shooting
    socket.on('shot:start', ({ matchId, dir, power }: { matchId: string; dir:{x:number;y:number}; power:number }) => {
        const room = getRoom(matchId);
        if (room.busy) return; // ignore while a shot is running

        // OPTIONAL: only allow when world is sleeping (prevents mid-motion hits)
        if (!sleeping(room.cueBall, room.balls)) return;

        room.busy = true;

        const n = Vector.normalise(dir as any);
        const maxSpeed = 25;
        Body.setVelocity(room.cueBall, Vector.mult(n, Math.max(0, Math.min(1, power)) * maxSpeed) as any);

        io.to(matchId).emit('shot:accepted', { ok: true, by: { socketId: socket.id, name: sessions.get(socket.id)!.name } });
        simulateShotAsync(room, matchId);
    });

    // Handle match reset
    socket.on('match:reset', ({ matchId }: { matchId: string }) => {
        const room = getRoom(matchId);
        rebuildRoom(room);
        io.to(matchId).emit('match:init', snapshot(room));
    });

    // ---------------------------------------------------------------------------------------------------------------------------------------Set use name handler---------------------------------------------------------
    socket.on('user:rename', ({ matchId, name }: { matchId: string, name: string }, cb?: (ok: boolean, finalName?: string) => void) => {
        // sanitize & clamp
        const trimmed = (name ?? '').toString().trim().slice(0, 32);
        const safe = trimmed.replace(/[\r\n\t]/g, '');
        const final = safe.length ? safe : `Guest-${socket.id.slice(0,5)}`;

        // update session
        const s = sessions.get(socket.id);
        if (s) s.name = final;

        // persist for user/device if available (so reconnects keep the name)
        if (s?.userId) namesByUser.set(s.userId, final);
        if (s?.deviceId) namesByDevice.set(s.deviceId, final);

        // tell the caller and the room
        socket.emit('user:me', { socketId: socket.id, userId, deviceId, tabId, name: final });
        if (matchId) {
            io.to(matchId).emit('presence:update', {
                roomId: matchId,
                who: { socketId: socket.id, userId, deviceId, tabId },
                name: final
            });
        }
        if (cb) cb(true, final);
    });
    // ---------------------------------------------------------------------------------------------------------------------------------------Set use name handler---------------------------------------------------------


    // Handle user disconnect
    socket.on('disconnect', () => {
        const { matchId } = socket.data as { matchId?: string };
        const s = sessions.get(socket.id);
        if (matchId) {
            io.to(matchId).emit('presence:leave', {
                roomId: matchId,
                who: { socketId: socket.id, userId, deviceId, tabId, name: s?.name ?? `Guest-${socket.id.slice(0,5)}` }
            });
        }
        indexDel(socketsByUser, userId, socket.id);
        indexDel(socketsByDevice, deviceId, socket.id);
        sessions.delete(socket.id);
    });
});
// Run server
const PORT = Number(process.env.PORT || 8787);
http.listen(PORT, () => console.log('RT server on', PORT));

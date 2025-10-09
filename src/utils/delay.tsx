import { useEffect, useRef } from "react";

export function useDelayedRunThenCleanup(
    run: () => void,
    cleanup: () => void,
    startDelayMs: number,
    waitAfterRunMs: number = 10_000
    ) {
    const startTimer = useRef<number | null>(null);
    const cleanupTimer = useRef<number | null>(null);
    const ran = useRef(false);
    const cleaned = useRef(false);

    useEffect(() => {
        // schedule the first run
        startTimer.current = window.setTimeout(() => {
            ran.current = true;
            run();

            // after it runs, wait N ms (default 10s) then cleanup
            cleanupTimer.current = window.setTimeout(() => {
                if (!cleaned.current) {
                cleaned.current = true;
                cleanup();
                }
            }, waitAfterRunMs) as unknown as number;
        }, startDelayMs) as unknown as number;

        // on unmount: clear timers; if started but not cleaned yet, clean up now
        return () => {
            if (startTimer.current !== null) clearTimeout(startTimer.current);
            if (cleanupTimer.current !== null) clearTimeout(cleanupTimer.current);
            if (ran.current && !cleaned.current) {
                cleaned.current = true;
                cleanup();
            }
        };
    }, [run, cleanup, startDelayMs, waitAfterRunMs]);
}
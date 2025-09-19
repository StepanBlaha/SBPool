import { useState, useEffect } from 'react';
/**
* Custom hook to track and return the current window width.
* Listens for window resize events and updates the width accordingly.
*
* @returns {number} width - The current width of the browser window in pixels.
*/
export const useWindowSize = () => {
    const [width, setWidth] = useState<number>(window.innerWidth);
    useEffect(() => {
        const handleResize = () => setWidth(window.innerWidth);
        window.addEventListener('resize', handleResize, { passive: true });
        handleResize();
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    return width;
};
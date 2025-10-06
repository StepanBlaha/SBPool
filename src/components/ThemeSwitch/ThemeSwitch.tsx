import { useRef, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { flushSync } from 'react-dom';
import "@theme-toggles/react/css/Classic.css"
import styles from "./ThemeSwitch.module.css"

const ThemeSwitch = () => {
    const { theme, toggleTheme } = useTheme();
    const ref = useRef<HTMLDivElement>(null);

    const toggleDarkMode = async () => {
        if (
            !ref.current ||
            !document.startViewTransition ||
            window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ) {
            toggleTheme();
            return;
        }
        await document.startViewTransition(() => {
            flushSync(() => {
                toggleTheme();
            });
        }).ready;

        const { top, left, width, height } = ref.current.getBoundingClientRect();
        const x = left + width / 2;
        const y = top + height / 2;
        const right = window.innerWidth - left;
        const bottom = window.innerHeight - top;
        const maxRadius = Math.hypot(
        Math.max(left, right),
        Math.max(top, bottom),
        );

        document.documentElement.animate(
        {
            clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${maxRadius}px at ${x}px ${y}px)`,
            ],
        },
        {
            duration: 500,
            easing: 'ease-in-out',
            pseudoElement: '::view-transition-new(root)',
        }
        );
    };  

    useEffect(() => {
        if (theme === "dark") {
            document.documentElement.classList.add('dark');
            document.documentElement.classList.remove('light');
        } else {
            document.documentElement.classList.add('light');
            document.documentElement.classList.remove('dark');
        }
    }, [theme]);

    return(
        <>
        <div
            className={`${styles.toggle} ${theme === "dark" ? styles.active : ""}`}
            ref={ref}
            onClick={toggleDarkMode}
            aria-checked={theme === 'dark'}                // REQUIRED for role="switch"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'} // accessible name
            tabIndex={0}           
            role="switch"
        >     
        </div>
        </>
    )
}

export default ThemeSwitch



import { useRef, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { flushSync } from 'react-dom';
import "@theme-toggles/react/css/Classic.css"
import { Classic } from "@theme-toggles/react"
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
    // Button wrapper - to avoid errors
    const Wrapper = (props: any) => {
        const { onPointerEnterCapture, onPointerLeaveCapture, ...rest } = props;
        return <Classic {...rest} />;
    };
    return(
        <>
        {
            /*

            <div className={styles.toggleButton} ref={ref} onClick={toggleDarkMode}>
                <div className={styles.toggleSwitch}>
                <label className={styles.switchLabel}>
                            <input type="checkbox" className={styles.checkbox} checked={theme === "light" } />
                    <span className={styles.slider}></span>
                </label>
                </div>
            </div>

            */
        }

        <div className={`${styles.toggle} ${theme === "dark" ? styles.active : ""}`}  ref={ref} onClick={toggleDarkMode} role="switch">
                
        </div>
        </>
    )
}

export default ThemeSwitch



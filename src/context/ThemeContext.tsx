// contexts/TimeModalContext.tsx
import React, { createContext, useContext, useState, useEffect } from "react";
type Theme = 'light' | 'dark';
/**
* Props for the ThemeContext component.
*/ 
interface ThemeContextType {
    theme: Theme; // Selected Theme
    toggleTheme: () => void; // Theme setter
}

/**
* React context to provide theme
*/
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
/**
* Provider component for changing website theme
* 
* @param children - React child elements
*/
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [theme, setTheme] = useState<Theme>("dark");

    useEffect(() => {
        const savedTheme = (localStorage.getItem('sb_theme') as Theme) || 'dark';
        setTheme(savedTheme);
        document.documentElement.classList.add(savedTheme);
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        document.documentElement.classList.remove(theme);
        document.documentElement.classList.add(newTheme);
        setTheme(newTheme);
        localStorage.setItem('sb_theme', newTheme);
    };    

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
        {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = (): ThemeContextType => {
    const context = useContext(ThemeContext);
    if (!context) throw new Error('useTheme must be used within a ThemeProvider');
    return context;
};
// contexts/TimeModalContext.tsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';

interface LanguageContextType {
    /** Currently selected language code (e.g., "cz") */
    selectedLanguage: string;
    /** Setter function to update the selected language */
    setSelectedLanguage: (lang: string) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { i18n } = useTranslation(); // Translation
    // Selected language
    const [selectedLanguage, setSelectedLanguage] = useState(() => {
        const saved = sessionStorage.getItem("SBSortselectedLanguage");
        return saved ? JSON.parse(saved) : "en";
    });
    useEffect(() => {
        i18n.changeLanguage(selectedLanguage.toLowerCase())
        sessionStorage.setItem("SBSortselectedLanguage", JSON.stringify(selectedLanguage));
    }, [selectedLanguage]);

    return (
        <LanguageContext.Provider value={{ selectedLanguage, setSelectedLanguage }}>
        {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = (): LanguageContextType => {
    const context = useContext(LanguageContext);
    if (!context) throw new Error('useLanguage must be used within a LanguageProvider');
    return context;
};
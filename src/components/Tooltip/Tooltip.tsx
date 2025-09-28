import styles from "./Tooltip.module.css"
import { useState, useRef, useEffect } from "react";
import { InfoIcon } from "lucide-react";
import { Trans, useTranslation } from "react-i18next";
import Logo from "../../assets/logo.png"
const Tooltip = () => {
    const { t } = useTranslation()
    const ref = useRef<HTMLDivElement>(null); 
    const [isOpen, setIsOpen] = useState<boolean>(false);

    // Handle click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);
    return(
        <>
            <div className={styles.TooltipContainer} ref={ref} >
                {isOpen &&
                    <div className={styles.TooltipContent}>
                        <div className={styles.TooltipHeader}>
                            <div className={styles.Logo} style={{backgroundImage: `url(${Logo})`}}></div>
                            <p className={styles.TooltipTitle}>
                                {t("tooltip.title")}
                            </p>

                        </div>
                        <ul>
                            <li><Trans i18nKey="tooltip.goal" components={{ 1: <span/> }} /></li>
                            <li><Trans i18nKey="tooltip.cue" components={{ 1: <span/> }} /></li>
                            <li><Trans i18nKey="tooltip.rotate" components={{ 1: <span/> }} /></li>
                            <li><Trans i18nKey="tooltip.aim" components={{ 1: <span/> }} /></li>
                            <li><Trans i18nKey="tooltip.charge" components={{ 1: <span/> }} /></li>
                            <li><Trans i18nKey="tooltip.shoot" components={{ 1: <span/> }} /></li>
                        </ul>
                    </div>
                }
                <div className={styles.TooltipButton} onClick={()=>setIsOpen(!isOpen)}>
                    <InfoIcon/>
                </div>

            </div>
        
        </>        
    )
}
export default Tooltip;
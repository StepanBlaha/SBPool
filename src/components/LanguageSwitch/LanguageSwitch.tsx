import styles from "./LanguageSwitch.module.css"
import { useLanguage } from "../../context/LanguageContext"
/**
* Props for the LanguageSwitch component.
*/ 
interface LangSwitchProps {
    type: "mobile" | "pc" // Type for the switch layout
}
/**
* A language switch component for different layouts.
* Handles changing vurrently used language
*
* @param props LangSwitch props
* @param {"mobile" | "pc"} props.type - Type for the switch layout
* @returns TSX.Element
*/
const LanguageSwitch = ({ type }: LangSwitchProps) => { 
    const { selectedLanguage, setSelectedLanguage} = useLanguage(); // Selected language

    return(
        <>
        {type === "mobile" ? (
            <>
                <div className={styles.Switch}>
                    <span className={`${styles.SubmenuPickButton} ${selectedLanguage === "cz" ? styles.SelectedSubmenuItem: ""}`} onClick={()=>setSelectedLanguage("cz")}>CZ</span>
                    <span className={`${styles.SubmenuPickButton} ${selectedLanguage === "en" ? styles.SelectedSubmenuItem: ""}`} onClick={()=>setSelectedLanguage("en")}>EN</span>
                </div>
            </>
        ) : (
            <>
                <div className={styles.ButtonGroupOptions}>
                    <button className={`${styles.Option} ${selectedLanguage === "cz"  ? styles.SelectedOption: ""}`} onClick={()=>setSelectedLanguage("cz")}>CZ</button>
                    <button className={`${styles.Option} ${selectedLanguage === "en"  ? styles.SelectedOption: ""}`} onClick={()=>setSelectedLanguage("en")}>EN</button>
                </div>
            </>
        )}
        </>
    )
}
export default LanguageSwitch
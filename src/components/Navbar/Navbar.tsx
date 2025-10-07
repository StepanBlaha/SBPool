import styles from "./Navbar.module.css"
import LanguageSwitch from "../LanguageSwitch/LanguageSwitch"
import ThemeSwitch from "../ThemeSwitch/ThemeSwitch"
import Logo from "../../assets/logo.png"

/**
 * Navbar component used in header
 * @returns TSX.Element
 */
const Navbar = () => {

    return(
        <>
        <nav className={styles.Navbar}>
            <div className={styles.Logo} style={{backgroundImage: `url(${Logo})`}}>
            </div>
            <div className={styles.Toggles}>
                <ThemeSwitch/>
                <LanguageSwitch type="pc"/>
            </div>
        </nav>
        
        </>
    )
}
export default Navbar
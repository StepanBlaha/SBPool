import styles from "./Navbar.module.css"
import { useState } from "react"
import LanguageSwitch from "../LanguageSwitch/LanguageSwitch"
import ThemeSwitch from "../ThemeSwitch/ThemeSwitch"
import Logo from "../../assets/logo.png"

const Navbar = () => {

    return(
        <>
        <div className={styles.Navbar}>
            <div className={styles.Logo} style={{backgroundImage: `url(${Logo})`}}>
            </div>
            <div className={styles.Toggles}>
                <ThemeSwitch/>
                <LanguageSwitch type="pc"/>
            </div>
        </div>
        
        </>
    )
}
export default Navbar
import { Helmet, HelmetProvider } from "react-helmet-async";
import Navbar from "../../../components/Navbar/Navbar";
import SearchBoxLarge from "../../../components/SearchBox/SearchBoxLarge/SearchBoxLarge";
import styles from "./HomePage.module.css";

import PbLogo from "../../../assets/images/logo-stroke.webp";

export default function HomePage() {
  return (
    <HelmetProvider>
      <Helmet>
        <title>PresetBase</title>
      </Helmet>

      <Navbar isAuth={true} userIsAdmin={true} pathUrl={"/"} />
      <main className={styles.container}>
        <div className={styles.splashContainer}>
          <img
            className={styles.splashLogo}
            src={PbLogo}
            alt="PresetBase Logo"
          />

          <p className={styles.splashText}>
            Browse synth presets used across
            <br />
            thousands of songs, artists, and albums.
          </p>

          <SearchBoxLarge limit={7} />
        </div>
      </main>
    </HelmetProvider>
  );
}

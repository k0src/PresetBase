import { Link } from "react-router-dom";

import styles from "./Footer.module.css";

import { FaXTwitter, FaGithub, FaYoutube, FaInstagram } from "react-icons/fa6";
import FooterLogo from "../../assets/images/logo-footer.webp";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContainer}>
        <div className={styles.footerLeft}>
          <Link to="/">
            <img
              src={FooterLogo}
              alt="PresetBase Logo"
              className={styles.footerLogo}
            />
          </Link>
          <span className={styles.footerName}>PresetBase</span>
          <p className={styles.footerDesc}>
            Browse synth presets used across thousands of songs, artists, and
            albums. The largest community-sourced synth preset database on the
            internet.
          </p>
        </div>

        <div className={styles.footerIcons}>
          <a href="https://x.com" target="_blank" rel="noopener noreferrer">
            <FaXTwitter className={styles.footerIcon} />
          </a>
          <a
            href="https://youtube.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaYoutube className={styles.footerIcon} />
          </a>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaInstagram className={styles.footerIcon} />
          </a>
          <a
            href="https://github.com/k0src/presetbase"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaGithub className={styles.footerIcon} />
          </a>
        </div>
      </div>

      <div className={styles.footerBottom}>
        <p>© 2025 PresetBase. All rights reserved.</p>
        <div className={styles.footerPolicyLinks}>
          <Link to="/privacy-policy" className={styles.footerPolicyLink}>
            Privacy Policy
          </Link>
          <Link to="/copyright" className={styles.footerPolicyLink}>
            Copyright/DMCA
          </Link>
          <Link to="/upload-tos" className={styles.footerPolicyLink}>
            Terms of Service
          </Link>
          <Link to="/cookie-settings" className={styles.footerPolicyLink}>
            Cookie Settings
          </Link>
        </div>
      </div>
    </footer>
  );
}

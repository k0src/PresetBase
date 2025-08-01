import { useState } from "react";
import { Link } from "react-router-dom";

import SearchBoxSmall from "../../components/SearchBox/SearchBoxSmall/SearchBoxSmall";
import SearchBoxMobile from "../../components/SearchBox/SearchBoxMobile/SearchBoxMobile";
import styles from "./Navbar.module.css";

import { FaCircleUser, FaGithub, FaBars, FaXmark } from "react-icons/fa6";
import NavbarLogo from "../../assets/images/logo-app.webp";

export default function Navbar({ isAuth, userIsAdmin }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const toggleMobileNav = () => setMobileNavOpen((prevState) => !prevState);

  return (
    <>
      <nav className={styles.navbar}>
        <div className={styles.navbarLeft}>
          <Link to="/">
            <img
              src={NavbarLogo}
              alt="PresetBase Logo"
              className={styles.navbarLogo}
            />
          </Link>

          <ul className={styles.navbarLinkContainer}>
            <li>
              <Link to="/browse" className={styles.navbarLink}>
                Browse
              </Link>
            </li>
            <li>
              <Link to="/stats" className={styles.navbarLink}>
                Stats
              </Link>
            </li>
            <li>
              <Link to="/about-us" className={styles.navbarLink}>
                About
              </Link>
            </li>
            <li>
              <Link to="/submit" className={styles.navbarLink}>
                Submit
              </Link>
            </li>
            <li>
              <Link to="/admin" className={styles.navbarLink}>
                Admin
              </Link>
            </li>
          </ul>
        </div>

        <div className={styles.navbarRight}>
          <SearchBoxSmall limit={5} />

          <a
            href="https://github.com/k0src/presetbase"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaGithub className={styles.navbarIcon} />
          </a>
          <Link to={isAuth ? "/account-info" : "/login"}>
            <FaCircleUser className={styles.navbarIcon} />
          </Link>
        </div>

        <button className={styles.buttonMobileNav} onClick={toggleMobileNav}>
          {mobileNavOpen ? (
            <FaXmark className={styles.navbarIcon} />
          ) : (
            <FaBars className={styles.navbarIcon} />
          )}
        </button>
      </nav>

      {/* Mobile Nav */}
      {mobileNavOpen && (
        <div
          className={classNames(styles.mobileNav, {
            [styles.navOpen]: mobileNavOpen,
          })}
        >
          <Link to="/browse" className={styles.mobileNavLink}>
            Browse
          </Link>
          <Link to="/stats" className={styles.mobileNavLink}>
            Stats
          </Link>
          <Link to="/about-us" className={styles.mobileNavLink}>
            About
          </Link>
          <Link to="/submit" className={styles.mobileNavLink}>
            Submit
          </Link>
          <Link
            to={isAuth ? "/account-info" : "/login"}
            className={styles.mobileNavLink}
          >
            My Account
          </Link>
          {userIsAdmin && (
            <Link to="/admin" className={styles.mobileNavLink}>
              Admin
            </Link>
          )}
          <SearchBoxMobile />
        </div>
      )}
    </>
  );
}

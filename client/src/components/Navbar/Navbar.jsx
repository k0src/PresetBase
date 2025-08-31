import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

import SearchBoxSmall from "../../components/SearchBox/SearchBoxSmall/SearchBoxSmall";
import SearchBoxMobile from "../../components/SearchBox/SearchBoxMobile/SearchBoxMobile";
import NavbarMenu from "./NavbarMenu";
import styles from "./Navbar.module.css";

import {
  FaCircleUser,
  FaGithub,
  FaBars,
  FaXmark,
  FaBook,
} from "react-icons/fa6";
import NavbarLogo from "../../assets/images/logo-app.webp";

export default function Navbar() {
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
              <NavLink
                to="/browse"
                className={({ isActive }) =>
                  isActive ? styles.navbarLinkActive : styles.navbarLink
                }
              >
                Browse
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/stats"
                className={({ isActive }) =>
                  isActive ? styles.navbarLinkActive : styles.navbarLink
                }
              >
                Stats
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/about-us"
                className={({ isActive }) =>
                  isActive ? styles.navbarLinkActive : styles.navbarLink
                }
              >
                About
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/submit"
                className={({ isActive }) =>
                  isActive ? styles.navbarLinkActive : styles.navbarLink
                }
              >
                Submit
              </NavLink>
            </li>
            <NavbarMenu
              title="Admin"
              menuItems={[
                { title: "Approvals", link: "/admin/approvals" },
                { title: "Upload", link: "/admin/upload" },
                { title: "Manage Users", link: "/admin/manage-users" },
                { title: "Manage Database", link: "/admin/manage-db" },
              ]}
            />
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
          <a
            href="https://docs.presetbase.app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaBook className={styles.navbarIcon} />
          </a>
          <Link to="/login">
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
          <Link to="/login" className={styles.mobileNavLink}>
            My Account
          </Link>
          <SearchBoxMobile />
        </div>
      )}
    </>
  );
}

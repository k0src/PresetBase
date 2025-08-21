import { useState, useRef, useCallback } from "react";
import { NavLink } from "react-router-dom";

import styles from "./NavbarMenu.module.css";

import { FaChevronDown } from "react-icons/fa6";

export default function NavbarMenu({ title, menuItems }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const timeoutRef = useRef(null);

  const handleMouseEnter = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsOpen(true);
    setIsAnimating(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
      setTimeout(() => {
        setIsAnimating(false);
      }, 200);
    }, 150);
  }, []);

  return (
    <div
      className={styles.navbarMenuContainer}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <li className={styles.navbarMenuTitle}>
        <span>{title}</span>
        <FaChevronDown className={styles.navbarMenuTitleChevron} />
      </li>
      {(isOpen || isAnimating) && (
        <>
          <div className={styles.navbarMenuBridge} />
          <menu
            className={`${styles.navbarMenu} ${
              !isOpen ? styles.navbarMenuClosing : ""
            }`}
          >
            {menuItems.map((item, index) => (
              <NavLink
                key={index}
                to={item.link}
                className={({ isActive }) =>
                  isActive ? styles.navbarMenuLinkActive : styles.navbarMenuLink
                }
              >
                {item.title}
              </NavLink>
            ))}
          </menu>
        </>
      )}
    </div>
  );
}

import { useState, useEffect, useCallback } from "react";

import styles from "./ScrollToTop.module.css";
import classNames from "classnames";

import { FaArrowUp } from "react-icons/fa6";

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const [bottomOffset, setBottomOffset] = useState("2rem");

  const handleScroll = useCallback(() => {
    const footer = document.querySelector("footer");
    const scrollY = window.scrollY;
    const windowHeight = window.innerHeight;
    const windowBottom = scrollY + windowHeight;

    setIsVisible(scrollY > 100);

    if (footer) {
      const footerTop = footer.getBoundingClientRect().top + scrollY;

      if (windowBottom > footerTop) {
        const overlap = windowBottom - footerTop;
        setBottomOffset(`${overlap}px`);
      } else {
        setBottomOffset("2rem");
      }
    }
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [handleScroll]);

  return (
    <button
      type="button"
      className={classNames(styles.scrollToTop, { [styles.show]: isVisible })}
      style={{ bottom: bottomOffset }}
      onClick={scrollToTop}
      aria-label="Scroll to top"
    >
      <FaArrowUp />
    </button>
  );
}

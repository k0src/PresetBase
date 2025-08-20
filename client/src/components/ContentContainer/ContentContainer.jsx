import Navbar from "../Navbar/Navbar";
import Footer from "../Footer/Footer";
import ScrollToTop from "../ScrollToTop/ScrollToTop";

import styles from "./ContentContainer.module.css";

export default function ContentContainer({ children, isAuth, userIsAdmin }) {
  return (
    <>
      <div className={styles.pageWrapper}>
        <Navbar isAuth={isAuth} userIsAdmin={userIsAdmin} />
        <div className={styles.contentWrapper}>
          <main className={styles.container}>{children}</main>
        </div>
        <Footer />
      </div>
      <ScrollToTop />
    </>
  );
}

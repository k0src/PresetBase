import { useNavigate } from "react-router-dom";

import ButtonMain from "../Buttons/ButtonMain/ButtonMain";
import Navbar from "../Navbar/Navbar";
import Footer from "../Footer/Footer";
import styles from "./DbError.module.css";

export default function DbError({ errorMessage }) {
  const navigate = useNavigate();
  const handleGoHome = () => navigate("/");

  return (
    <div className={styles.pageWrapper}>
      <Navbar isAuth={true} userIsAdmin={true} />
      <div className={styles.contentWrapper}>
        <main className={styles.container}>
          <div className={styles.errorContainer}>
            <h1 className={styles.errorHeading}>500</h1>
            <span className={styles.errorText}>
              We encountered a database error:
              <br />
              {errorMessage}
            </span>
            <ButtonMain onClick={handleGoHome}>Go Home</ButtonMain>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}

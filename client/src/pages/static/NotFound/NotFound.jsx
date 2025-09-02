import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";

import Navbar from "../../../components/Navbar/Navbar";
import Footer from "../../../components/Footer/Footer";
import ButtonMain from "../../../components/Buttons/ButtonMain/ButtonMain";
import styles from "./NotFound.module.css";

export default function NotFound() {
  const navigate = useNavigate();
  const handleGoHome = () => navigate("/");

  return (
    <>
      <Helmet>
        <title>404</title>
      </Helmet>

      <div className={styles.pageWrapper}>
        <Navbar />
        <div className={styles.contentWrapper}>
          <main className={styles.container}>
            <div className={styles.errorContainer}>
              <h1 className={styles.errorHeading}>404</h1>
              <span className={styles.errorText}>
                We couldn't find the page you're looking for.
                <br />
                It may have been moved, or doesn't exist anymore.
              </span>
              <ButtonMain onClick={handleGoHome}>Go Home</ButtonMain>
            </div>
          </main>
        </div>
        <Footer />
      </div>
    </>
  );
}

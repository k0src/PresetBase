import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";

import styles from "./LoginPage.module.css";

import PbLogo from "../../../assets/images/logo-stroke.webp";
import { FaGoogle } from "react-icons/fa6";

export default function LoginPage() {
  return (
    <>
      <Helmet>
        <title>Sign In</title>
      </Helmet>

      <div className={styles.pageWrapper}>
        <main className={styles.container}>
          <section className={styles.loginContainer}>
            <div className={styles.loginCard}>
              <img
                src={PbLogo}
                alt="PresetBase Logo"
                className={styles.loginImg}
              />
              <div className={styles.loginTextContainer}>
                <span className={styles.loginTextLarge}>Sign In</span>
                <span className={styles.loginTextSmall}>
                  Welcome back to PresetBase.
                </span>
              </div>
              <div className={styles.loginBtnContainer}>
                <div className={styles.loginServicesContainer}>
                  <a href="/auth/google" className={styles.loginBtn}>
                    <FaGoogle className={styles.loginIcon} />
                    Continue with Google
                  </a>
                </div>

                <div className={styles.loginDivider}>
                  <span>OR</span>
                </div>

                {/* fix this, use react forms */}
                <form className={styles.loginForm} action="#" method="POST">
                  <input
                    type="email"
                    id="email"
                    className={styles.loginInput}
                    placeholder="Email"
                    disabled
                  />
                  <input
                    type="password"
                    id="password"
                    className={styles.loginInput}
                    placeholder="Password"
                    disabled
                  />
                  <button type="submit" className={styles.loginBtn} disabled>
                    Login
                  </button>
                </form>
              </div>
            </div>

            <div className={styles.loginCard}>
              <span className={styles.loginTextSmall}>
                Don't have an account?{" "}
                <Link to="/register" className={styles.loginLink}>
                  Sign up
                </Link>
              </span>
            </div>
          </section>
        </main>
      </div>
    </>
  );
}

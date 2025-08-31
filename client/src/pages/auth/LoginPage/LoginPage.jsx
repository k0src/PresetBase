import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useAuth } from "../../../contexts/AuthContext";

import { BounceLoader } from "react-spinners";
import styles from "./LoginPage.module.css";

import PbLogo from "../../../assets/images/logo-stroke.webp";
import { FaGoogle, FaEye, FaEyeSlash } from "react-icons/fa6";

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const { login, isAuthenticated, loading, error, clearError } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    return () => clearError();
  }, []);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(clearError, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    if (error) {
      clearError();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      return;
    }

    const result = await login(formData.email, formData.password);

    if (result.success) {
      navigate("/");
    }
  };

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
              {loading ? (
                <div className={styles.loaderContainer}>
                  <BounceLoader color="#e3e5e4" size={60} />
                </div>
              ) : (
                <div className={styles.loginBtnContainer}>
                  <div className={styles.loginServicesContainer}>
                    {/* fix */}
                    <a href="/auth/google" className={styles.loginBtn}>
                      <FaGoogle className={styles.loginIcon} />
                      Continue with Google
                    </a>
                  </div>

                  <div className={styles.loginDivider}>
                    <span>OR</span>
                  </div>

                  <form className={styles.loginForm} onSubmit={handleSubmit}>
                    {error && <div className={styles.error}>{error}</div>}

                    <input
                      type="email"
                      name="email"
                      className={styles.loginInput}
                      placeholder="Email"
                      value={formData.email}
                      onChange={handleChange}
                      autoComplete="email"
                      required
                    />

                    <div className={styles.passwordInput}>
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        className={styles.loginInput}
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleChange}
                        autoComplete="current-password"
                        required
                      />
                      <button
                        type="button"
                        className={styles.passwordToggle}
                        onClick={() => setShowPassword((prev) => !prev)}
                      >
                        {showPassword ? (
                          <FaEyeSlash className={styles.eyeIcon} />
                        ) : (
                          <FaEye className={styles.eyeIcon} />
                        )}
                      </button>
                    </div>

                    <button
                      type="submit"
                      className={styles.loginBtn}
                      disabled={
                        loading || !formData.email || !formData.password
                      }
                    >
                      Sign in
                    </button>
                  </form>
                </div>
              )}
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

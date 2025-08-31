import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useAuth } from "../../../contexts/AuthContext";

import { BounceLoader } from "react-spinners";
import styles from "../LoginPage/LoginPage.module.css";
import classNames from "classnames";

import PbLogo from "../../../assets/images/logo-stroke.webp";
import { FaEye, FaEyeSlash, FaTriangleExclamation } from "react-icons/fa6";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const { register, isAuthenticated, loading, error, clearError } = useAuth();
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

  const validateForm = () => {
    const errors = {};

    // Username validation
    if (!formData.username) {
      errors.username = "Username is required.";
    } else if (formData.username.length < 3) {
      errors.username = "Username must be at least 3 characters.";
    } else if (formData.username.length > 50) {
      errors.username = "Username must be less than 50 characters.";
    }

    // Email validation
    if (!formData.email) {
      errors.email = "Email is required.";
    } else if (
      !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)
    ) {
      errors.email = "Invalid email address.";
    }

    // Password validation
    if (!formData.password) {
      errors.password = "Password is required.";
    } else if (formData.password.length < 8) {
      errors.password = "Password must be at least 8 characters.";
    } else if (formData.password.length > 100) {
      errors.password = "Password must be less than 100 characters.";
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      errors.confirmPassword = "Please confirm your password.";
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match.";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (validationErrors[name]) {
      setValidationErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }

    if (error) {
      clearError();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const result = await register(
      formData.username,
      formData.email,
      formData.password
    );

    if (result.success) {
      navigate("/");
    }
  };

  return (
    <>
      <Helmet>
        <title>Sign Up</title>
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
                <span className={styles.loginTextLarge}>Sign Up</span>
                <span className={styles.loginTextSmall}>
                  Create your PresetBase account.
                </span>
              </div>
              {loading ? (
                <div className={styles.loaderContainer}>
                  <BounceLoader color="#e3e5e4" size={60} />
                </div>
              ) : (
                <div className={styles.loginBtnContainer}>
                  <form className={styles.loginForm} onSubmit={handleSubmit}>
                    {error && <div className={styles.error}>{error}</div>}

                    <div className={styles.formGroup}>
                      <span className={styles.label}>Username</span>
                      <input
                        type="text"
                        name="username"
                        className={classNames(styles.loginInput, {
                          [styles.inputError]: validationErrors.username,
                        })}
                        placeholder="Choose a username"
                        value={formData.username}
                        onChange={handleChange}
                        autoComplete="username"
                        required
                      />
                      {validationErrors.username && (
                        <div className={styles.fieldError}>
                          <FaTriangleExclamation />
                          {validationErrors.username}
                        </div>
                      )}
                    </div>

                    <div className={styles.formGroup}>
                      <span className={styles.label}>Email</span>
                      <input
                        type="email"
                        name="email"
                        className={classNames(styles.loginInput, {
                          [styles.inputError]: validationErrors.email,
                        })}
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={handleChange}
                        autoComplete="email"
                        required
                      />
                      {validationErrors.email && (
                        <div className={styles.fieldError}>
                          <FaTriangleExclamation />
                          {validationErrors.email}
                        </div>
                      )}
                    </div>

                    <div className={styles.formGroup}>
                      <span className={styles.label}>Password</span>
                      <div className={styles.passwordInput}>
                        <input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          className={classNames(styles.loginInput, {
                            [styles.inputError]: validationErrors.password,
                          })}
                          placeholder="Create a password"
                          value={formData.password}
                          onChange={handleChange}
                          autoComplete="current-password"
                          required
                        />
                        <button
                          type="button"
                          className={styles.passwordToggle}
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <FaEyeSlash className={styles.eyeIcon} />
                          ) : (
                            <FaEye className={styles.eyeIcon} />
                          )}
                        </button>
                      </div>
                      {validationErrors.password && (
                        <div className={styles.fieldError}>
                          <FaTriangleExclamation />
                          {validationErrors.password}
                        </div>
                      )}
                    </div>

                    <div className={styles.formGroup}>
                      <span className={styles.label}>Confirm Password</span>
                      <input
                        type={showPassword ? "text" : "password"}
                        name="confirmPassword"
                        className={classNames(styles.loginInput, {
                          [styles.inputError]: validationErrors.confirmPassword,
                        })}
                        placeholder="Confirm your password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        autoComplete="new-password"
                        required
                      />
                      {validationErrors.confirmPassword && (
                        <div className={styles.fieldError}>
                          <FaTriangleExclamation />
                          {validationErrors.confirmPassword}
                        </div>
                      )}
                    </div>

                    <button
                      type="submit"
                      className={styles.loginBtn}
                      disabled={
                        loading || !formData.email || !formData.password
                      }
                    >
                      Sign Up
                    </button>
                  </form>
                </div>
              )}
            </div>

            <div className={styles.loginCard}>
              <span className={styles.loginTextSmall}>
                Already have an account?{" "}
                <Link to="/login" className={styles.loginLink}>
                  Sign in
                </Link>
              </span>
            </div>
          </section>
        </main>
      </div>
    </>
  );
}

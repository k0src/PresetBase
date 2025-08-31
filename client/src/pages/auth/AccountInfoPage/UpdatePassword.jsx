import { useEffect, useState } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import classNames from "classnames";

import styles from "./AccountInfoPage.module.css";
import { FaTriangleExclamation, FaEye, FaEyeSlash } from "react-icons/fa6";

export default function UpdatePassword({ onSuccess, onError }) {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const { changePassword } = useAuth();

  useEffect(() => {
    return () => {
      setUpdateSuccess(false);
    };
  }, []);

  useEffect(() => {
    if (updateSuccess) {
      const timer = setTimeout(() => {
        setUpdateSuccess(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [updateSuccess]);

  const validateForm = () => {
    const errors = {};

    // Current password validation
    if (!formData.currentPassword) {
      errors.currentPassword = "Current password is required.";
    }

    // New password validation
    if (!formData.newPassword) {
      errors.newPassword = "New password is required.";
    } else if (formData.newPassword.length < 8) {
      errors.newPassword = "New password must be at least 8 characters.";
    } else if (formData.newPassword.length > 100) {
      errors.newPassword = "New password must be less than 100 characters.";
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      errors.confirmPassword = "Please confirm your new password.";
    } else if (formData.newPassword !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match.";
    }

    // Check if new password is different from current
    if (
      formData.currentPassword === formData.newPassword &&
      formData.currentPassword.length > 0
    ) {
      errors.newPassword =
        "New password must be different from current password.";
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
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setUpdateLoading(true);

    const result = await changePassword(
      formData.currentPassword,
      formData.newPassword
    );

    setUpdateLoading(false);

    if (result.success) {
      setValidationErrors({});
      setUpdateSuccess(true);
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      if (onSuccess) {
        onSuccess("Password updated successfully!");
      }
    } else {
      if (onError && result.message) {
        onError(result.message);
      }
    }
  };

  return (
    <form className={styles.userInfoForm} onSubmit={handleSubmit}>
      <div className={styles.formGroup}>
        <span className={styles.label}>Current Password</span>
        <div className={styles.passwordInput}>
          <input
            type={showPasswords.current ? "text" : "password"}
            name="currentPassword"
            className={classNames(styles.userInput, {
              [styles.inputError]: validationErrors.currentPassword,
            })}
            value={formData.currentPassword}
            onChange={handleChange}
            autoComplete="current-password"
            required
          />
          <button
            type="button"
            className={styles.passwordToggle}
            onClick={() => togglePasswordVisibility("current")}
          >
            {showPasswords.current ? (
              <FaEyeSlash className={styles.eyeIcon} />
            ) : (
              <FaEye className={styles.eyeIcon} />
            )}
          </button>
        </div>
        {validationErrors.currentPassword && (
          <div className={styles.fieldError}>
            <FaTriangleExclamation />
            {validationErrors.currentPassword}
          </div>
        )}
      </div>

      <div className={styles.formGroup}>
        <span className={styles.label}>New Password</span>
        <div className={styles.passwordInput}>
          <input
            type={showPasswords.new ? "text" : "password"}
            name="newPassword"
            className={classNames(styles.userInput, {
              [styles.inputError]: validationErrors.newPassword,
            })}
            value={formData.newPassword}
            onChange={handleChange}
            autoComplete="new-password"
            required
          />
          <button
            type="button"
            className={styles.passwordToggle}
            onClick={() => togglePasswordVisibility("new")}
          >
            {showPasswords.new ? (
              <FaEyeSlash className={styles.eyeIcon} />
            ) : (
              <FaEye className={styles.eyeIcon} />
            )}
          </button>
        </div>
        {validationErrors.newPassword && (
          <div className={styles.fieldError}>
            <FaTriangleExclamation />
            {validationErrors.newPassword}
          </div>
        )}
      </div>

      <div className={styles.formGroup}>
        <span className={styles.label}>Confirm New Password</span>
        <div className={styles.passwordInput}>
          <input
            type={showPasswords.confirm ? "text" : "password"}
            name="confirmPassword"
            className={classNames(styles.userInput, {
              [styles.inputError]: validationErrors.confirmPassword,
            })}
            value={formData.confirmPassword}
            onChange={handleChange}
            autoComplete="new-password"
            required
          />
          <button
            type="button"
            className={styles.passwordToggle}
            onClick={() => togglePasswordVisibility("confirm")}
          >
            {showPasswords.confirm ? (
              <FaEyeSlash className={styles.eyeIcon} />
            ) : (
              <FaEye className={styles.eyeIcon} />
            )}
          </button>
        </div>
        {validationErrors.confirmPassword && (
          <div className={styles.fieldError}>
            <FaTriangleExclamation />
            {validationErrors.confirmPassword}
          </div>
        )}
      </div>

      <button
        type="submit"
        className={styles.applyChangesBtn}
        disabled={
          updateLoading ||
          !formData.currentPassword ||
          !formData.newPassword ||
          !formData.confirmPassword
        }
      >
        {updateLoading ? "Updating..." : "Update Password"}
      </button>
    </form>
  );
}

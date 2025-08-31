import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useAuth } from "../../../contexts/AuthContext";
import { Navigate } from "react-router-dom";

import ContentContainer from "../../../components/ContentContainer/ContentContainer";
import UpdatePassword from "./UpdatePassword";
import styles from "./AccountInfoPage.module.css";
import classNames from "classnames";

import {
  FaCalendar,
  FaLock,
  FaTriangleExclamation,
  FaUserShield,
} from "react-icons/fa6";

export default function AccountInfoPage() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
  });
  const [originalData, setOriginalData] = useState({
    username: "",
    email: "",
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [updateLoading, setUpdateLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const {
    isAuthenticated,
    loading,
    error,
    user,
    clearError,
    updateUserProfile,
    logout,
    deleteAccount,
  } = useAuth();

  useEffect(() => {
    if (user) {
      const userData = {
        username: user.username || "",
        email: user.email || "",
      };
      setFormData(userData);
      setOriginalData(userData);
    }
  }, [user]);

  if (!loading && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const hasChanges = () => {
    return (
      formData.username !== originalData.username ||
      formData.email !== originalData.email
    );
  };

  const formatJoinDate = (timestamp) => {
    if (!timestamp) return "Unknown";
    try {
      return new Date(timestamp).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "Unknown";
    }
  };

  const handlePasswordSuccess = (message) => {
    setSuccessMessage(message);
    setErrorMessage("");
    clearError();
  };

  const handlePasswordError = (message) => {
    setErrorMessage(message);
    setSuccessMessage("");
  };

  useEffect(() => {
    return () => {
      clearError();
      setSuccessMessage("");
      setErrorMessage("");
    };
  }, [clearError]);

  useEffect(() => {
    let timer;
    if (successMessage) {
      timer = setTimeout(() => setSuccessMessage(""), 3000);
    } else if (errorMessage) {
      timer = setTimeout(() => setErrorMessage(""), 5000);
    } else if (error) {
      timer = setTimeout(() => clearError(), 5000);
    }
    return () => clearTimeout(timer);
  }, [successMessage, errorMessage, error, clearError]);

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

    if (!hasChanges()) {
      return;
    }

    if (!validateForm()) {
      return;
    }

    setUpdateLoading(true);
    setErrorMessage("");
    setSuccessMessage("");
    clearError();

    const updates = {};
    if (formData.username !== originalData.username) {
      updates.username = formData.username;
    }
    if (formData.email !== originalData.email) {
      updates.email = formData.email;
    }

    const result = await updateUserProfile(updates);

    setUpdateLoading(false);

    if (result.success) {
      setValidationErrors({});
      setSuccessMessage("Profile updated successfully!");
      setErrorMessage("");
      clearError();
      setOriginalData({ ...formData });
    } else {
      setErrorMessage(result.message || "Failed to update profile");
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    setErrorMessage("");
    setSuccessMessage("");
    clearError();

    const result = await deleteAccount();

    setDeleteLoading(false);

    if (!result.success) {
      setErrorMessage(result.message || "Failed to delete account");
      setShowDeleteConfirm(false);
    }
  };

  const confirmDeleteAccount = () => {
    setShowDeleteConfirm(true);
  };

  const cancelDeleteAccount = () => {
    setShowDeleteConfirm(false);
  };

  return (
    <>
      <Helmet>
        <title>Account Info</title>
      </Helmet>

      <ContentContainer>
        <section className={styles.infoHeader}>
          <h1 className={styles.headingPrimary}>Account Information</h1>
        </section>

        <div className={styles.userInfoSection}>
          <div className={styles.userInfoHead}>
            <span className={styles.userInfoText}>
              <FaCalendar />
              Joined: {formatJoinDate(user?.timestamp)}
            </span>
            <span className={styles.userInfoText}>&bull;</span>
            <span className={styles.userInfoText}>
              <FaLock />
              Authenticated with: {user?.authenticated_with || "PresetBase"}
            </span>
            {user?.is_admin === "t" && (
              <>
                <span className={styles.userInfoText}>&bull;</span>
                <span className={styles.userInfoText}>
                  <FaUserShield />
                  Admin
                </span>
              </>
            )}
          </div>

          {(error || errorMessage) && (
            <div className={styles.error}>{error || errorMessage}</div>
          )}
          {successMessage && (
            <div className={styles.success}>{successMessage}</div>
          )}

          <section className={styles.userInfoInputSection}>
            <form className={styles.userInfoForm} onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <span className={styles.label}>Username</span>
                <input
                  type="text"
                  name="username"
                  className={classNames(styles.userInput, {
                    [styles.inputError]: validationErrors.username,
                  })}
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
                  className={classNames(styles.userInput, {
                    [styles.inputError]: validationErrors.email,
                  })}
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

              <button
                type="submit"
                className={styles.applyChangesBtn}
                disabled={
                  updateLoading ||
                  !formData.email ||
                  !formData.username ||
                  !hasChanges()
                }
              >
                {updateLoading ? "Saving..." : "Apply Changes"}
              </button>
            </form>

            <UpdatePassword
              onSuccess={handlePasswordSuccess}
              onError={handlePasswordError}
            />
          </section>
        </div>
        <hr className={styles.userInfoHr} />

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.logOutBtn}
            onClick={handleLogout}
          >
            Log Out
          </button>
          <button
            type="button"
            className={styles.deleteBtn}
            onClick={confirmDeleteAccount}
            disabled={deleteLoading}
          >
            {deleteLoading ? "Deleting..." : "Delete Account"}
          </button>
        </div>

        {showDeleteConfirm && (
          <div className={styles.confirmDialog}>
            <div className={styles.confirmContent}>
              <h3>Confirm Account Deletion</h3>
              <p>
                Are you sure you want to delete your account? This action cannot
                be undone and all your data will be permanently lost.
              </p>
              <div className={styles.confirmButtons}>
                <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={cancelDeleteAccount}
                  disabled={deleteLoading}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className={styles.confirmDeleteBtn}
                  onClick={handleDeleteAccount}
                  disabled={deleteLoading}
                >
                  {deleteLoading ? "Deleting..." : "Yes, Delete Account"}
                </button>
              </div>
            </div>
          </div>
        )}
      </ContentContainer>
    </>
  );
}

import React from "react";

import ButtonMain from "../Buttons/ButtonMain/ButtonMain";
import styles from "./ErrorBoundary.module.css";

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });

    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleGoHome = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = "/";
  };

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      const errorMessage =
        this.state.error?.message || "An unexpected error occurred";

      return (
        <main className={styles.container}>
          <div className={styles.errorContainer}>
            <h1 className={styles.errorHeading}>Oops!</h1>
            <span className={styles.errorText}>
              We encountered an error:
              <br />
              {errorMessage}
            </span>

            <div className={styles.buttonGroup}>
              <ButtonMain onClick={this.handleRetry} variant="secondary">
                Try Again
              </ButtonMain>
              <ButtonMain onClick={this.handleGoHome}>Go Home</ButtonMain>
            </div>
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}

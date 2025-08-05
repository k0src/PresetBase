import React from "react";
import DbError from "../DbError/DbError";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <DbError
          errorMessage={
            this.state.error?.message || "An unexpected error occurred"
          }
        />
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { authAPI } from "../../../api/api";
import { BounceLoader } from "react-spinners";
import styles from "../LoginPage/LoginPage.module.css";

export default function OAuthSuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const handleOAuthSuccess = async () => {
      const accessToken = searchParams.get("accessToken");
      const refreshToken = searchParams.get("refreshToken");
      const error = searchParams.get("error");

      if (error) {
        console.error("OAuth error:", error);
        navigate("/login?error=oauth_failed");
        return;
      }

      if (accessToken && refreshToken) {
        try {
          localStorage.setItem("accessToken", accessToken);
          localStorage.setItem("refreshToken", refreshToken);
          authAPI.setTokens(accessToken, refreshToken);
          navigate("/");
        } catch (err) {
          console.error("OAuth token processing error:", err);
          navigate("/login?error=oauth_token_failed");
        }
      } else {
        navigate("/login?error=oauth_missing_tokens");
      }
    };

    handleOAuthSuccess();
  }, [searchParams, navigate]);

  return (
    <div className={styles.pageWrapper}>
      <main className={styles.container}>
        <section className={styles.loginContainer}>
          <div className={styles.loginCard}>
            <div className={styles.loaderContainer}>
              <BounceLoader color="#e3e5e4" size={60} />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

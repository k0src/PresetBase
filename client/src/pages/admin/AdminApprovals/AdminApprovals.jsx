import { useState, useCallback, useEffect } from "react";
import { Helmet } from "react-helmet-async";

import { getPendingSubmissions } from "../../../api/admin.js";
import { useAsyncData } from "../../../hooks/useAsyncData.js";

import ContentContainer from "../../../components/ContentContainer/ContentContainer";
import PageLoader from "../../../components/PageLoader/PageLoader.jsx";
import DbError from "../../../components/DbError/DbError.jsx";
import ApprovalsForm from "../../../components/Admin/ApprovalsForm/ApprovalsForm.jsx";
import styles from "./AdminApprovals.module.css";

export default function AdminApprovals() {
  const [submissions, setSubmissions] = useState([]);

  const { data, loading, error } = useAsyncData({
    submissions: () => getPendingSubmissions(),
  });

  useEffect(() => {
    if (data.submissions && data.submissions.length > 0) {
      setSubmissions(data.submissions);
    }
  }, [data.submissions]);

  const handleSubmissionUpdate = useCallback((submissionId) => {
    setSubmissions((prev) => prev.filter((sub) => sub.id !== submissionId));
  }, []);

  if (loading) return <PageLoader />;

  if (error) {
    return (
      <>
        <Helmet>
          <title>Internal Server Error</title>
        </Helmet>
        <DbError errorMessage={error} />
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Approve Submissions</title>
      </Helmet>

      <ContentContainer isAuth={true} userIsAdmin={true}>
        <section className={styles.submitHeader}>
          <h1 className={styles.headingPrimary}>Approve Pending Submissions</h1>
        </section>

        {submissions && submissions.length > 0 ? (
          <section className={styles.submissionsContainer}>
            {submissions.map((submission) => (
              <ApprovalsForm
                key={submission.id}
                submission={submission}
                onUpdate={handleSubmissionUpdate}
              />
            ))}
          </section>
        ) : (
          <div className={styles.noSubmissionsContainer}>
            <span className={styles.noSubmissionsText}>
              No user submissions yet.
            </span>
          </div>
        )}
      </ContentContainer>
    </>
  );
}

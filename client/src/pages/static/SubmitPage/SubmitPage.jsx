import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";

import ContentContainer from "../../../components/ContentContainer/ContentContainer";
import AlertMessage from "../../../components/AlertMessage/AlertMessage";
import SubmitForm from "../../../components/Submit/SubmitForm/SubmitForm";
import styles from "./SubmitPage.module.css";

export default function SubmitPage() {
  const [alertState, setAlertState] = useState({
    type: "info",
    message: null,
  });

  const handleSubmitSuccess = () => {
    setAlertState({
      type: "success",
      message: (
        <>
          <strong>Your submission has been successfully received!</strong> All
          submissions are manually reviewed and approved. You can monitor the
          status of your submission by visiting the{" "}
          <Link to="/me">"My Submissions"</Link> section within your account
          page.
        </>
      ),
    });
  };

  return (
    <>
      <Helmet>
        <title>Submit Entry</title>
      </Helmet>

      <ContentContainer>
        <section className={styles.submitHeader}>
          <h1 className={styles.headingPrimary}>Submit</h1>
        </section>

        <AlertMessage type={alertState.type}>
          {alertState.message || (
            <>
              <strong>
                Please read and fill out all required fields carefully
              </strong>
              . Mistakes may lead to your entry being rejected.{" "}
              <Link to="/submit/example">Click here</Link> to view an example of
              a approved submission.
            </>
          )}
        </AlertMessage>

        <SubmitForm onSubmitSuccess={handleSubmitSuccess} />
      </ContentContainer>
    </>
  );
}

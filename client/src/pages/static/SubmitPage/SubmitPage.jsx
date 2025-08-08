import { submitData } from "../../../api/api";

import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";

import ContentContainer from "../../../components/ContentContainer/ContentContainer";
import PageLoader from "../../../components/PageLoader/PageLoader";
import DbError from "../../../components/DbError/DbError";
import AlertMessage from "../../../components/AlertMessage/AlertMessage";
import SubmitForm from "../../../components/Submit/SubmitForm/SubmitForm";
import styles from "./SubmitPage.module.css";

export default function SubmitPage() {
  return (
    <>
      <Helmet>
        <title>Submit Entry</title>
      </Helmet>

      <ContentContainer isAuth={true} userIsAdmin={true}>
        <section className={styles.submitHeader}>
          <h1 className={styles.headingPrimary}>Submit</h1>
        </section>

        <AlertMessage type="info">
          <strong>
            Please read and fill out all required fields carefully
          </strong>
          . Mistakes may lead to your entry being rejected.{" "}
          <Link to="/submit/example">Click here</Link> to view an example of a
          approved submission.
        </AlertMessage>

        <SubmitForm />
      </ContentContainer>
    </>
  );
}

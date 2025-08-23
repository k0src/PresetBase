import { Helmet } from "react-helmet-async";

import ContentContainer from "../../../components/ContentContainer/ContentContainer";
import SubmitForm from "../../../components/Submit/SubmitForm/SubmitForm";
import styles from "./AdminUpload.module.css";

export default function AdminUpload() {
  return (
    <>
      <Helmet>
        <title>Upload Entry</title>
      </Helmet>

      <ContentContainer isAuth={true} userIsAdmin={true}>
        <section className={styles.submitHeader}>
          <h1 className={styles.headingPrimary}>Upload</h1>
        </section>

        <SubmitForm mode="upload" />
      </ContentContainer>
    </>
  );
}

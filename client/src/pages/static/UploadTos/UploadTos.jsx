import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";

import ContentContainer from "../../../components/ContentContainer/ContentContainer";
import styles from "./UploadTos.module.css";

export default function UploadTos() {
  return (
    <>
      <Helmet>
        <title>Upload Terms of Service</title>
      </Helmet>

      <ContentContainer isAuth={true} userIsAdmin={true}>
        <section className={styles.copyrightHeader}>
          <h1 class="heading-primary">Upload Terms of Service</h1>
        </section>

        <section className={styles.copyrightContainer}>
          <p className={styles.bodyText}>
            By submitting content to PresetBase, you agree to the following:
          </p>
          <h2 className={styles.headingSecondary}>
            1. You Own or Have Rights to the Content
          </h2>
          <p className={styles.bodyText}>
            You confirm that you either own the content you are uploading or
            have the legal right to share it. Do not upload copyrighted content
            you do not have permission to use.
          </p>
          <h2 className={styles.headingSecondary}>
            2. You Grant Us a License to Display the Content
          </h2>
          <p className={styles.bodyText}>
            You grant PresetBase a non-exclusive, royalty-free license to host,
            display, and distribute the content for educational and
            informational purposes only.
          </p>
          <h2 className={styles.headingSecondary}>
            3. No Infringing, Harmful, or Illegal Material
          </h2>
          <p className={styles.bodyText}>
            Do not upload anything that infringes on copyrights, trademarks, or
            the rights of others. Do not submit malicious or offensive content.
          </p>
          <h2 className={styles.headingSecondary}>4. Audio Limitations</h2>
          <p className={styles.bodyText}>Any uploaded audio must be:</p>
          <ul className={styles.copyrightList}>
            <li className={styles.copyrightListItem}>
              <p className={styles.bodyText}>Less than 10 seconds</p>
            </li>
            <li className={styles.copyrightListItem}>
              <p className={styles.bodyText}>A dry (unprocessed) preset demo</p>
            </li>
            <li className={styles.copyrightListItem}>
              <p className={styles.bodyText}>
                Not include lyrics, vocals, FX, stems, or commercial samples
              </p>
            </li>
          </ul>
          <h2 className={styles.headingSecondary}>
            5. DMCA Takedown Compliance
          </h2>
          <p className={styles.bodyText}>
            If content is found to be infringing, it will be removed in
            accordance with our <Link to="/copyright">DMCA Policy</Link>
          </p>
          <h2 className={styles.headingSecondary}>
            6. You Accept Liability for Your Uploads
          </h2>
          <p className={styles.bodyText}>
            You are responsible for the content you submit. PresetBase is a
            platform and not responsible for user submissions under the DMCA
            Safe Harbor provisions.
          </p>
        </section>
      </ContentContainer>
    </>
  );
}

import { Helmet } from "react-helmet-async";

import ContentContainer from "../../../components/ContentContainer/ContentContainer";
import styles from "./Copyright.module.css";

export default function Copyright() {
  return (
    <>
      <Helmet>
        <title>Copyright Terms of Use</title>
      </Helmet>

      <ContentContainer>
        <section className={styles.copyrightHeader}>
          <h1 className={styles.headingPrimary}>
            Terms of Use & Legal Disclaimers
          </h1>
        </section>

        <section className={styles.copyrightContainer}>
          <p className={styles.bodyText}>Last updated: June 25, 2025</p>
          <br />
          <p className={styles.bodyText}>
            By accessing and using this website ("Site"), you agree to be bound
            by the following terms, disclaimers, and conditions of use. If you
            do not agree to these terms, you must not use this Site.
          </p>
          <h2 className={styles.headingSecondary}>
            1. Platform Purpose & Intellectual Property
          </h2>
          <p className={styles.bodyText}></p>
          <ul className={styles.copyrightList}>
            <li className={styles.copyrightListItem}>
              <p className={styles.bodyText}>
                This Site functions as a{" "}
                <strong>user-contributed educational platform</strong> focused
                on music production, synth programming, and preset analysis.
              </p>
            </li>
            <li className={styles.copyrightListItem}>
              <p className={styles.bodyText}>
                All song names, artist names, album titles, genres, and metadata
                presented on this Site are used{" "}
                <strong>
                  strictly for informational and educational purposes
                </strong>
                .
              </p>
            </li>
            <li className={styles.copyrightListItem}>
              <p className={styles.bodyText}>
                The Site <strong>does not claim ownership</strong> over any
                third-party song, album, artist, brand, preset, or software
                mentioned herein.
              </p>
            </li>
            <li className={styles.copyrightListItem}>
              <p className={styles.bodyText}>
                All trademarks, logos, product names, software names (e.g.,
                Nexus, Serum, Omnisphere), and company names are the{" "}
                <strong>property of their respective owners</strong>.
              </p>
            </li>
            <li className={styles.copyrightListItem}>
              <p className={styles.bodyText}>
                We are{" "}
                <strong>
                  not affiliated with, endorsed by, or officially associated
                  with{" "}
                </strong>
                any artist, music label, plugin manufacturer, or software
                company mentioned on the Site.
              </p>
            </li>
          </ul>
          <h2 className={styles.headingSecondary}>
            2. Use of Images and Visual Content
          </h2>
          <ul className={styles.copyrightList}>
            <li className={styles.copyrightListItem}>
              <p className={styles.bodyText}>
                Images of synth plugin interfaces, artist photos, and album art
                (if present) are used{" "}
                <strong>
                  for commentary, education, comparison, and critique{" "}
                </strong>
                under Fair Use principles as outlined in Section 107 of the U.S.
                Copyright Act.
              </p>
            </li>
            <li className={styles.copyrightListItem}>
              <p className={styles.bodyText}>
                No visual asset is used for commercial purposes or
                misrepresented as original content.
              </p>
            </li>
            <li className={styles.copyrightListItem}>
              <p className={styles.bodyText}>
                If you are a rights holder and believe any content has been used
                improperly, you may contact us to request removal or proper
                attribution.
              </p>
            </li>
          </ul>
          <h2 className={styles.headingSecondary}>
            3. Audio Demonstrations & Preset References
          </h2>
          <ul className={styles.copyrightList}>
            <li className={styles.copyrightListItem}>
              <p className={styles.bodyText}>
                Audio demonstrations hosted on this Site are{" "}
                <strong>user-submitted or independently created</strong> and
                serve to showcase synth presets and sound design techniques.
              </p>
            </li>
            <li className={styles.copyrightListItem}>
              <p className={styles.bodyText}>
                These clips are intentionally short (typically 5 seconds or
                less),{" "}
                <strong>
                  do not contain vocals, effects, lyrics, or stems
                </strong>
                , and are presented as
                <strong>dry renderings of presets</strong> for commentary and
                educational use.
              </p>
            </li>
            <li className={styles.copyrightListItem}>
              <p className={styles.bodyText}>
                All audio clips are intended to demonstrate{" "}
                <strong>sound design principles</strong>, not to reproduce or
                replicate any copyrighted composition or recording.
              </p>
            </li>
            <li className={styles.copyrightListItem}>
              <p className={styles.bodyText}>
                If a specific melody or audio segment is believed to violate
                copyright unintentionally, please contact us — we will promptly
                review and, if necessary, remove the material.
              </p>
            </li>
          </ul>
          <h2 className={styles.headingSecondary}>
            4. Educational Use & Non-Affiliation Notice
          </h2>
          <ul className={styles.copyrightList}>
            <li className={styles.copyrightListItem}>
              <p className={styles.bodyText}>
                The Site is an{" "}
                <strong>independent, community-driven resource</strong> created
                for music education, sound design analysis, and production
                reference.
              </p>
            </li>
            <li className={styles.copyrightListItem}>
              <p className={styles.bodyText}>
                All content is provided “<strong>as-is</strong>” and is for{" "}
                <strong>
                  non-commercial, educational, and transformative purposes{" "}
                </strong>
                only.
              </p>
            </li>
          </ul>
          {/* mb */}
          <h2 className={styles.headingSecondary}>
            5. DMCA Notice & Takedown Procedure
          </h2>
          <p className={styles.bodyText}>
            In accordance with the{" "}
            <strong>Digital Millennium Copyright Act (DMCA)</strong> of 1998
            (full text:{" "}
            <a
              href="www.copyright.gov/legislation/dmca.pdf"
              target="_blank"
              rel="noopener noreferrer"
            >
              www.copyright.gov/legislation/dmca.pdf
            </a>
            ), PresetBase respects the rights of copyright holders and will
            respond to <strong>clear and valid takedown notices</strong>. If you
            believe your copyrighted work is being used improperly on this Site,
            please send a DMCA notice with the following information:
          </p>
          <ol className={styles.copyrightListOrdered}>
            <li className={styles.copyrightListItem}>
              <p className={styles.bodyText}>
                A description of the copyrighted work being infringed.
              </p>
            </li>
            <li className={styles.copyrightListItem}>
              <p className={styles.bodyText}>
                A direct URL to the allegedly infringing material.
              </p>
            </li>
            <li className={styles.copyrightListItem}>
              <p className={styles.bodyText}>
                Your full name, mailing address, phone number, and email
                address.
              </p>
            </li>
            <li className={styles.copyrightListItem}>
              <p className={styles.bodyText}>
                A statement that you have a good-faith belief that the use of
                the material is not authorized by the copyright owner, agent, or
                law.
              </p>
            </li>
            <li className={styles.copyrightListItem}>
              <p className={styles.bodyText}>
                A statement that the information in your notice is accurate, and
                under penalty of perjury, that you are the copyright owner or
                authorized to act on their behalf.
              </p>
            </li>
            <li className={styles.copyrightListItem}>
              <p className={styles.bodyText}>
                Your electronic or physical signature.
              </p>
            </li>
          </ol>
          <p className={styles.bodyText}>
            <strong>Send takedown notices to:</strong>
          </p>
          <br />
          <div className={styles.addressContainer}>
            <p className={styles.bodyText}>
              <strong>Copyright Agent</strong>
            </p>
            <p className={styles.bodyText}>PresetBase</p>
            <p className={styles.bodyText}>
              <a href="mailto:copyright@presetbase.com">
                copyright@presetbase.com
              </a>
            </p>
            <p className={styles.bodyText}>
              Registered with the U.S. Copyright Office
            </p>
          </div>
          <h2 className={styles.headingSecondary}>
            6. Repeat Infringer Policy & Safe Harbor
          </h2>
          <ul className={styles.copyrightList}>
            <li className={styles.copyrightListItem}>
              <p className={styles.bodyText}>
                In compliance with Section 512 of the DMCA, accounts of users
                who are determined to be <strong>repeat infringers</strong> will
                be permanently terminated.
              </p>
            </li>
            <li className={styles.copyrightListItem}>
              <p className={styles.bodyText}>
                We reserve the right to remove any content at our discretion to
                maintain compliance with copyright law.
              </p>
            </li>
            <li className={styles.copyrightListItem}>
              <p className={styles.bodyText}>
                As a hosting platform, PresetBase operates under the{" "}
                <strong>Safe Harbor</strong> provisions of the DMCA and is not
                liable for content submitted by users, provided takedown
                requests are honored promptly and in good faith.
              </p>
            </li>
          </ul>
          <h2 className={styles.headingSecondary}>
            7. Limitation of Liability
          </h2>
          <ul className={styles.copyrightList}>
            <li className={styles.copyrightListItem}>
              <p className={styles.bodyText}>
                In compliance with Section 512 of the DMCA, accounts of users
                who are determined to be <strong>repeat infringers</strong> will
                be permanently terminated.
              </p>
            </li>
            <li className={styles.copyrightListItem}>
              <p className={styles.bodyText}>
                The Site and its operators shall not be held liable for any
                direct, indirect, incidental, or consequential damages arising
                from your use of the Site or reliance on its content.
              </p>
            </li>
            <li className={styles.copyrightListItem}>
              <p className={styles.bodyText}>
                We make no guarantees as to the accuracy, completeness, or
                timeliness of any information provided.
              </p>
            </li>
          </ul>
        </section>
      </ContentContainer>
    </>
  );
}

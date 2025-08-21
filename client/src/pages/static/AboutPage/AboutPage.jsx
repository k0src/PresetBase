import { Helmet } from "react-helmet-async";
import { useState, useEffect } from "react";

import ContentContainer from "../../../components/ContentContainer/ContentContainer";
import GitHubRepoCard from "../../../components/GitHubRepoCard/GitHubRepoCard";
import DbStatsCards from "../../../components/Stats/DbStatsCards/DbStatsCards";
import PageLoader from "../../../components/PageLoader/PageLoader";
import DbError from "../../../components/DbError/DbError";
import { getTotalEntries } from "../../../api/api";
import styles from "./AboutPage.module.css";

import SplashImg from "../../../assets/images/about-us-hero.webp";

export default function AboutPage() {
  const [totalEntries, setTotalEntries] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTotalEntries = async () => {
      try {
        setLoading(true);
        setError(null);
        const totalEntriesData = await getTotalEntries();
        setTotalEntries(totalEntriesData.data);
      } catch (err) {
        console.error("Error fetching total entries:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTotalEntries();
  }, []);

  if (loading) return <PageLoader />;
  if (error) return <DbError errorMessage={error} />;

  return (
    <>
      <Helmet>
        <title>About PresetBase</title>
      </Helmet>

      <ContentContainer isAuth={true} userIsAdmin={true}>
        <section className={styles.aboutHeader}>
          <h1 className={styles.headingPrimary}>About PresetBase</h1>
          <p className={styles.bodyText}>
            PresetBase is a searchable archive of synth presets used in real
            songs. It's built for musicians, producers, and curious listeners
            who want to dig into the sound design behind their favorite tracks.
            Whether you're trying to recreate a specific patch or just want to
            see what gear was behind a certain sound, PresetBase helps you
            connect the dots.
          </p>
        </section>

        <section>
          <div className={styles.splashImgContainer}>
            <img
              src={SplashImg}
              alt="PresetBase Splash Image"
              className={styles.splashImg}
            />
          </div>
          <p className={styles.bodyTextMb}>
            PresetBase is about documenting the sound design choices that shape
            modern music. We log synth presets, plugin chains, and patch data,
            all tied to the songs and artists that used them. Whether it's a
            factory preset on a classic synth or a custom sound recreated by
            ear, the goal is the same: make the production process more
            transparent and searchable.
          </p>

          <p className={styles.bodyTextMb}>
            The information on PresetBase comes from a mix of
            sources—interviews, preset packs, isolated stems, and community
            research. Some entries are confirmed by artists or sound designers,
            others are crowd-sourced and tested by users. Accuracy matters, so
            we aim to clearly label what's verified and what's still under
            discussion.
          </p>

          <p className={styles.bodyTextMb}>
            PresetBase is always expanding. New entries are added regularly by
            contributors who care about the details of music production. If
            you're someone who notices the exact synth behind a hook, or who
            tracks down patches by ear, this site is built for you.
          </p>

          <h2 className={styles.headingSecondary}>Current Database Stats</h2>
          <DbStatsCards data={totalEntries} />

          <h2 className={styles.headingSecondary}>View on GitHub</h2>
          <GitHubRepoCard username="k0src" repo="presetbase" />
        </section>
      </ContentContainer>
    </>
  );
}

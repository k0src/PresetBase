import { getNumberEntries } from "../../../api/api";
import { getHotSongsData } from "../../../api/browse";
import { useAsyncData } from "../../../hooks/useAsyncData";

import { useState, useCallback, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";

import ContentContainer from "../../../components/ContentContainer/ContentContainer";
import PageLoader from "../../../components/PageLoader/PageLoader";
import DbError from "../../../components/DbError/DbError";
import SongCarousel from "../../../components/BrowsePage/SongCarousel/SongCarousel";
import styles from "./BrowsePage.module.css";

export default function BrowsePage() {
  const { data, loading, error } = useAsyncData(
    {
      numberEntries: () => getNumberEntries(),
      hotSongs: () => getHotSongsData(null, "DESC", 9),
    },
    [],
    { cacheKey: "browsePageHotSongs" }
  );

  const numberEntries = data.numberEntries?.data || null;
  const hotSongsData = data.hotSongs?.data || null;

  if (loading) return <PageLoader />;

  if (error) {
    return (
      <>
        <Helmet>
          <title>Internal Server Error</title>
        </Helmet>
        <DbError errorMessage={error.message} />
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Browse</title>
      </Helmet>

      <ContentContainer isAuth={true} userIsAdmin={true}>
        <section className={styles.browseHeader}>
          <h1 className={styles.headingPrimary}>Browse</h1>
          <span className={styles.totalEntriesText}>
            {numberEntries} total entries
          </span>
        </section>

        <section className={styles.browseMainContainer}>
          <div className={styles.hotSongsContainer}>
            <div className={styles.hotSongsHeader}>
              <h2 className={styles.headingSecondary}>Hot Songs</h2>
              <Link to="/browse/hot" className={styles.viewMoreLink}>
                View more
              </Link>
            </div>

            <SongCarousel songData={hotSongsData} />
          </div>
        </section>
      </ContentContainer>
    </>
  );
}

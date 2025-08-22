import {
  getNumberEntries,
  getLatestEntry,
  getTopGenres,
} from "../../../api/api";
import { getHotSongsData } from "../../../api/browse";
import { useAsyncData } from "../../../hooks/useAsyncData";

import { useState, useCallback, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";

import ContentContainer from "../../../components/ContentContainer/ContentContainer";
import PageLoader from "../../../components/PageLoader/PageLoader";
import DbError from "../../../components/DbError/DbError";
import ViewMoreHeader from "../../../components/BrowsePage/ViewMoreHeader/ViewMoreHeader";
import SongCarousel from "../../../components/BrowsePage/SongCarousel/SongCarousel";
import TopCategoryCards from "../../../components/BrowsePage/TopCategoryCards/TopCategoryCards";
import BrowsePageHeader from "../../../components/BrowsePage/BrowsePageHeader/BrowsePageHeader";
import styles from "./BrowsePage.module.css";
import LatestEntry from "../../../components/BrowsePage/LatestEntry/LatestEntry";
import TopGenres from "../../../components/BrowsePage/TopGenres/TopGenres";

export default function BrowsePage() {
  const { data, loading, error } = useAsyncData(
    {
      numberEntries: () => getNumberEntries(),
      hotSongs: () => getHotSongsData(null, "DESC", 9),
      latestEntry: () => getLatestEntry(),
      topGenres: () => getTopGenres(),
    },
    [],
    { cacheKey: "browsePageData" }
  );

  const numberEntries = data.numberEntries?.data || null;
  const hotSongsData = data.hotSongs?.data || null;
  const latestEntryData = data.latestEntry?.data || null;
  const topGenresData = data.topGenres?.data || null;

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
          <div className={styles.hotSongsSection}>
            <ViewMoreHeader title="Hot Songs" link="/browse/hot" />
            <SongCarousel songData={hotSongsData} />
          </div>

          <div className={styles.topCategoriesSection}>
            <ViewMoreHeader title="Top Categories" link="#allCategories" />
            <TopCategoryCards />
          </div>

          <div className={styles.browseColumns}>
            <div className={styles.browseColumnsLeft}>
              <div className={styles.latestEntrySection}>
                <BrowsePageHeader title="Latest Entry" />
                <LatestEntry songData={latestEntryData} />
              </div>

              <div className={styles.topGenresSection}>
                <ViewMoreHeader title="Top Genres" link="/browse/genres" />
                <TopGenres genresData={topGenresData} />
              </div>
            </div>
            <div className={styles.browseColumnsRight}></div>
          </div>
        </section>
      </ContentContainer>
    </>
  );
}

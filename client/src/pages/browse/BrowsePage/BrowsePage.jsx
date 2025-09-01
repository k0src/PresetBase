import { generalAPI } from "../../../api/general.js";
import { browseAPI } from "../../../api/browse.js";
import { useAsyncData } from "../../../hooks/useAsyncData";

import { Helmet } from "react-helmet-async";

import ContentContainer from "../../../components/ContentContainer/ContentContainer";
import PageLoader from "../../../components/PageLoader/PageLoader";
import DbError from "../../../components/DbError/DbError";
import ViewMoreHeader from "../../../components/BrowsePage/ViewMoreHeader/ViewMoreHeader";
import SongCarousel from "../../../components/BrowsePage/SongCarousel/SongCarousel";
import TopCategoryCards from "../../../components/BrowsePage/TopCategoryCards/TopCategoryCards";
import BrowsePageHeader from "../../../components/BrowsePage/BrowsePageHeader/BrowsePageHeader";
import LatestEntry from "../../../components/BrowsePage/LatestEntry/LatestEntry";
import TopGenres from "../../../components/BrowsePage/TopGenres/TopGenres";
import BrowseEntryCards from "../../../components/BrowsePage/BrowseEntryCards/BrowseEntryCards";
import BrowseAllCategories from "../../../components/BrowsePage/BrowseAllCategories/BrowseAllCategories";
import TopPresets from "../../../components/BrowsePage/TopPresets/TopPresets";
import styles from "./BrowsePage.module.css";

export default function BrowsePage() {
  const { data, loading, error } = useAsyncData(
    {
      numberEntries: () => generalAPI.getNumberEntries(),
      hotSongs: () => browseAPI.getHotSongs(null, "DESC", 9),
      latestEntry: () => generalAPI.getLatestEntry(),
      topGenres: () => generalAPI.getTopGenres(6),
      topSynths: () => generalAPI.getTopSynths(6),
      recentSongs: () => browseAPI.getRecentSongs(null, "DESC", 6),
      popularSongs: () => browseAPI.getPopularSongs(null, "DESC", 6),
      topPresets: () => generalAPI.getTopPresets(10),
    },
    [],
    { cacheKey: "browsePageData" }
  );

  const numberEntries = data.numberEntries?.data || null;
  const hotSongsData = data.hotSongs?.data || null;
  const latestEntryData = data.latestEntry?.data || null;
  const topGenresData = data.topGenres?.data || null;
  const topSynthsData = data.topSynths?.data || null;
  const recentSongsData = data.recentSongs?.data || null;
  const popularSongsData = data.popularSongs?.data || null;
  const topPresetsData = data.topPresets?.data || null;

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

      <ContentContainer>
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

              <div className={styles.recentSongsSection}>
                <ViewMoreHeader title="Recently Added" link="/browse/recent" />
                <BrowseEntryCards
                  entriesData={recentSongsData}
                  entryType="song"
                />
              </div>

              <div className={styles.popularSongsSection}>
                <ViewMoreHeader title="Popular Songs" link="/browse/popular" />
                <BrowseEntryCards
                  entriesData={popularSongsData}
                  entryType="song"
                />
              </div>

              <div className={styles.browseCategoriesSection}>
                <BrowsePageHeader title="Browse All" />
                <BrowseAllCategories />
              </div>
            </div>
            <div className={styles.browseColumnsRight}>
              <div className={styles.topPresetsSection}>
                <ViewMoreHeader title="Top Presets" link="/browse/presets" />
                <TopPresets presetsData={topPresetsData} />
              </div>

              <div className={styles.topGenresSection}>
                <ViewMoreHeader title="Top Genres" link="/browse/genres" />
                <TopGenres genresData={topGenresData} />
              </div>

              <div className={styles.topSynthsSection}>
                <ViewMoreHeader title="Popular Synths" link="/browse/synths" />
                <BrowseEntryCards
                  entriesData={topSynthsData}
                  entryType="synth"
                />
              </div>
            </div>
          </div>
        </section>
      </ContentContainer>
    </>
  );
}

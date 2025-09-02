import { useAsyncData } from "../../../hooks/useAsyncData.js";
import { generalAPI } from "../../../api/general";

import { useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useMemo } from "react";

import ContentContainer from "../../../components/ContentContainer/ContentContainer";
import PageLoader from "../../../components/PageLoader/PageLoader";
import SearchResults from "../../../components/Search/SearchResults";

import styles from "./SearchPage.module.css";

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("query");

  const { data, loading, error } = useAsyncData(
    {
      search: () => generalAPI.searchDatabase(query),
    },
    [query],
    { cacheKey: `search-${query}`, ttl: 1000 * 60 }
  );

  const searchData = data.search || null;

  const memoizedProps = useMemo(
    () => ({
      searchData,
      searchQuery: searchData?.searchQuery || query,
    }),
    [searchData, query]
  );

  if (loading) {
    return <PageLoader />;
  }

  if (!query?.trim()) {
    return (
      <ContentContainer isAuth={false} userIsAdmin={false}>
        <div className={styles.errorContainer}>
          <h1>No search query provided</h1>
          <p>
            Please enter a search term to find songs, artists, albums, synths,
            and presets.
          </p>
        </div>
      </ContentContainer>
    );
  }

  if (error) {
    return (
      <ContentContainer isAuth={false} userIsAdmin={false}>
        <div className={styles.errorContainer}>
          <h1>Search Error</h1>
          <p>{error}</p>
        </div>
      </ContentContainer>
    );
  }

  return (
    <>
      <Helmet>
        <title>{`Search results for "${searchData.searchQuery}"`}</title>
      </Helmet>

      <ContentContainer isAuth={false} userIsAdmin={false}>
        <SearchResults
          searchData={memoizedProps.searchData}
          searchQuery={memoizedProps.searchQuery}
        />
      </ContentContainer>
    </>
  );
}

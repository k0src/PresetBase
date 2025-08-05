import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import ContentContainer from "../../../components/ContentContainer/ContentContainer";
import PageLoader from "../../../components/PageLoader/PageLoader";
import SearchResults from "../../../components/Search/SearchResults";
import { searchDatabase } from "../../../api/api";
import styles from "./SearchPage.module.css";
import { Helmet } from "react-helmet-async";

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const [searchData, setSearchData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const query = searchParams.get("query");

  useEffect(() => {
    const performSearch = async () => {
      if (!query?.trim()) {
        setLoading(false);
        setError("Search query is required");
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await searchDatabase(query);
        setSearchData(data);
      } catch (err) {
        console.error("Search error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    performSearch();
  }, [query]);

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
          searchData={searchData}
          searchQuery={searchData?.searchQuery || query}
        />
      </ContentContainer>
    </>
  );
}

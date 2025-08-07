import { getPopularSongsData } from "../../api/browse.js";
import { entryConfigs } from "./entryConfigs.js";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Helmet } from "react-helmet-async";

import ContentContainer from "../../components/ContentContainer/ContentContainer.jsx";
import PageLoader from "../../components/PageLoader/PageLoader.jsx";
import DbError from "../../components/DbError/DbError.jsx";
import BrowseNoResults from "../../components/Browse/BrowseNoResults/BrowseNoResults.jsx";
import BrowseResults from "../../components/Browse/BrowseResults/BrowseResults.jsx";

export default function BrowseSongs() {
  const [popularSongsData, setPopularSongsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState("clicks");
  const [sortDirection, setSortDirection] = useState("desc");
  const [filterText, setFilterText] = useState("");

  useEffect(() => {
    const loadPopularSongsData = async () => {
      try {
        setLoading(true);
        const popularSongsDataRes = await getPopularSongsData(
          sortBy,
          sortDirection
        );
        setPopularSongsData(popularSongsDataRes.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadPopularSongsData();
  }, [sortBy, sortDirection]);

  const handleSortChange = useCallback(async (sort, direction) => {
    setSortBy(sort);
    setSortDirection(direction);
  }, []);

  const handleFilterChange = useCallback((filter) => {
    setFilterText(filter);
  }, []);

  const popularSongsConfig = useMemo(() => entryConfigs.popular, []);

  if (loading) return <PageLoader />;

  if (error) {
    return (
      <>
        <Helmet>
          <title>Internal Server Error</title>
        </Helmet>
        <DbError errorMessage={error} />
      </>
    );
  }

  // No results
  if (!popularSongsData || !popularSongsData.length) {
    return (
      <>
        <Helmet>
          <title>Popular Songs</title>
        </Helmet>

        <ContentContainer isAuth={true} userIsAdmin={true}>
          <BrowseNoResults entryType="songs" />
        </ContentContainer>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Popular Songs</title>
      </Helmet>

      <ContentContainer isAuth={true} userIsAdmin={true}>
        <BrowseResults
          entryType="popular"
          data={popularSongsData}
          config={popularSongsConfig}
          onSortChange={handleSortChange}
          onFilterChange={handleFilterChange}
          sortBy={sortBy}
          sortDirection={sortDirection}
          filterText={filterText}
          filterPlaceholder="Filter songs..."
        />
      </ContentContainer>
    </>
  );
}

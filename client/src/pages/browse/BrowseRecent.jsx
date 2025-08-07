import { getRecentSongsData } from "../../api/browse.js";
import { entryConfigs } from "./entryConfigs.js";
import { useAsyncData } from "../../hooks/useAsyncData.js";

import { useState, useCallback, useMemo } from "react";
import { Helmet } from "react-helmet-async";

import ContentContainer from "../../components/ContentContainer/ContentContainer.jsx";
import PageLoader from "../../components/PageLoader/PageLoader.jsx";
import DbError from "../../components/DbError/DbError.jsx";
import BrowseNoResults from "../../components/Browse/BrowseNoResults/BrowseNoResults.jsx";
import BrowseResults from "../../components/Browse/BrowseResults/BrowseResults.jsx";

export default function BrowseRecent() {
  const [sortBy, setSortBy] = useState("added");
  const [sortDirection, setSortDirection] = useState("desc");
  const [filterText, setFilterText] = useState("");

  const { data, loading, error } = useAsyncData(
    {
      songs: () => getRecentSongsData(sortBy, sortDirection),
    },
    [sortBy, sortDirection],
    { cacheKey: `browseRecent-${sortBy}-${sortDirection}` }
  );

  const recentSongsData = data.songs?.data || null;

  const handleSortChange = useCallback(async (sort, direction) => {
    setSortBy(sort);
    setSortDirection(direction);
  }, []);

  const handleFilterChange = useCallback((filter) => {
    setFilterText(filter);
  }, []);

  const recentSongsConfig = useMemo(() => entryConfigs.songs, []);

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
  if (!recentSongsData || !recentSongsData.length) {
    return (
      <>
        <Helmet>
          <title>Recent Songs</title>
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
        <title>Recent Songs</title>
      </Helmet>

      <ContentContainer isAuth={true} userIsAdmin={true}>
        <BrowseResults
          entryType="recent"
          data={recentSongsData}
          config={recentSongsConfig}
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

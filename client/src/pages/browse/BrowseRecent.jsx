import { getRecentSongsData } from "../../api/browse.js";
import { entryConfigs } from "./entryConfigs.js";
import { useAsyncData } from "../../hooks/useAsyncData.js";

import { useState, useCallback, useMemo } from "react";
import { Helmet } from "react-helmet-async";

import ContentContainer from "../../components/ContentContainer/ContentContainer.jsx";
import ComponentLoader from "../../components/ComponentLoader/ComponentLoader.jsx";
import DbError from "../../components/DbError/DbError.jsx";
import BrowseHeader from "../../components/Browse/BrowseHeader/BrowseHeader.jsx";
import BrowseTableView from "../../components/Browse/BrowseTableView/BrowseTableView.jsx";

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

  return (
    <>
      <Helmet>
        <title>Recent Songs</title>
      </Helmet>

      <ContentContainer isAuth={true} userIsAdmin={true}>
        <BrowseHeader
          entryType="recent"
          filterPlaceholder="Filter songs..."
          sortOptions={recentSongsConfig.sortOptions}
          onFilterChange={handleFilterChange}
          onSortSelectChange={handleSortChange}
          sortBy={sortBy}
          sortDirection={sortDirection}
        />
        {loading ? (
          <ComponentLoader />
        ) : !recentSongsData || !recentSongsData.length ? (
          <BrowseNoResults entryType="songs" />
        ) : (
          <BrowseTableView
            data={recentSongsData}
            entryType="recent"
            config={recentSongsConfig}
            filterText={filterText}
          />
        )}
      </ContentContainer>
    </>
  );
}

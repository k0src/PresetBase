import { browseAPI } from "../../api/browse.js";
import { entryConfigs } from "./entryConfigs.js";
import { useAsyncData } from "../../hooks/useAsyncData.js";

import { useState, useCallback, useMemo } from "react";
import { Helmet } from "react-helmet-async";

import ContentContainer from "../../components/ContentContainer/ContentContainer.jsx";
import ComponentLoader from "../../components/ComponentLoader/ComponentLoader.jsx";
import DbError from "../../components/DbError/DbError.jsx";
import BrowseNoResults from "../../components/Browse/BrowseNoResults/BrowseNoResults.jsx";
import BrowseHeader from "../../components/Browse/BrowseHeader/BrowseHeader.jsx";
import BrowseTableView from "../../components/Browse/BrowseTableView/BrowseTableView.jsx";

export default function BrowseSongs() {
  const [sortBy, setSortBy] = useState("added");
  const [sortDirection, setSortDirection] = useState("asc");
  const [filterText, setFilterText] = useState("");

  const { data, loading, error } = useAsyncData(
    {
      songs: () => browseAPI.getSongs(sortBy, sortDirection),
      total: () => browseAPI.getTotalSongEntries(),
    },
    [sortBy, sortDirection],
    { cacheKey: `browseSongs-${sortBy}-${sortDirection}` }
  );

  const songsData = data.songs?.data || null;
  const totalEntries = data.total?.data || null;

  const handleSortChange = useCallback(async (sort, direction) => {
    setSortBy(sort);
    setSortDirection(direction);
  }, []);

  const handleFilterChange = useCallback((filter) => {
    setFilterText(filter);
  }, []);

  const songsConfig = useMemo(() => entryConfigs.songs, []);

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
        <title>Browse Songs</title>
      </Helmet>

      <ContentContainer>
        <BrowseHeader
          entryType="songs"
          totalEntries={totalEntries}
          filterPlaceholder="Filter songs..."
          sortOptions={songsConfig.sortOptions}
          onFilterChange={handleFilterChange}
          onSortSelectChange={handleSortChange}
          sortBy={sortBy}
          sortDirection={sortDirection}
        />
        {loading ? (
          <ComponentLoader />
        ) : !songsData || !songsData.length ? (
          <BrowseNoResults entryType="songs" />
        ) : (
          <BrowseTableView
            data={songsData}
            entryType="songs"
            config={songsConfig}
            filterText={filterText}
          />
        )}
      </ContentContainer>
    </>
  );
}

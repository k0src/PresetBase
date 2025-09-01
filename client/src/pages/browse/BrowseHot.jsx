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

export default function BrowseHot() {
  const [sortBy, setSortBy] = useState("hot");
  const [sortDirection, setSortDirection] = useState("desc");
  const [filterText, setFilterText] = useState("");

  const { data, loading, error } = useAsyncData(
    {
      songs: () => browseAPI.getHotSongs(sortBy, sortDirection),
    },
    [sortBy, sortDirection],
    { cacheKey: `browseHot-${sortBy}-${sortDirection}` }
  );

  const hotSongsData = data.songs?.data || null;

  const handleSortChange = useCallback(async (sort, direction) => {
    setSortBy(sort);
    setSortDirection(direction);
  }, []);

  const handleFilterChange = useCallback((filter) => {
    setFilterText(filter);
  }, []);

  const hotSongsConfig = useMemo(() => entryConfigs.hot, []);

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
        <title>Hot Songs</title>
      </Helmet>

      <ContentContainer>
        <BrowseHeader
          entryType="hot"
          filterPlaceholder="Filter songs..."
          sortOptions={hotSongsConfig.sortOptions}
          onFilterChange={handleFilterChange}
          onSortSelectChange={handleSortChange}
          sortBy={sortBy}
          sortDirection={sortDirection}
        />
        {loading ? (
          <ComponentLoader />
        ) : !hotSongsData || !hotSongsData.length ? (
          <BrowseNoResults entryType="songs" />
        ) : (
          <BrowseTableView
            data={hotSongsData}
            entryType="hot"
            config={hotSongsConfig}
            filterText={filterText}
          />
        )}
      </ContentContainer>
    </>
  );
}

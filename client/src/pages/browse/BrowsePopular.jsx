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

export default function BrowsePopular() {
  const [sortBy, setSortBy] = useState("clicks");
  const [sortDirection, setSortDirection] = useState("desc");
  const [filterText, setFilterText] = useState("");

  const { data, loading, error } = useAsyncData(
    {
      songs: () => browseAPI.getPopularSongs(sortBy, sortDirection),
    },
    [sortBy, sortDirection],
    { cacheKey: `browsePopular-${sortBy}-${sortDirection}` }
  );

  const popularSongsData = data.songs?.data || null;

  const handleSortChange = useCallback(async (sort, direction) => {
    setSortBy(sort);
    setSortDirection(direction);
  }, []);

  const handleFilterChange = useCallback((filter) => {
    setFilterText(filter);
  }, []);

  const popularSongsConfig = useMemo(() => entryConfigs.popular, []);

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
        <title>Popular Songs</title>
      </Helmet>

      <ContentContainer>
        <BrowseHeader
          entryType="popular"
          filterPlaceholder="Filter songs..."
          sortOptions={popularSongsConfig.sortOptions}
          onFilterChange={handleFilterChange}
          onSortSelectChange={handleSortChange}
          sortBy={sortBy}
          sortDirection={sortDirection}
        />
        {loading ? (
          <ComponentLoader />
        ) : !popularSongsData || !popularSongsData.length ? (
          <BrowseNoResults entryType="songs" />
        ) : (
          <BrowseTableView
            data={popularSongsData}
            entryType="popular"
            config={popularSongsConfig}
            filterText={filterText}
          />
        )}
      </ContentContainer>
    </>
  );
}

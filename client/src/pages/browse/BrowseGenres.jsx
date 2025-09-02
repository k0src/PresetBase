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

export default function BrowseGenres() {
  const [sortBy, setSortBy] = useState("songCount");
  const [sortDirection, setSortDirection] = useState("desc");
  const [filterText, setFilterText] = useState("");

  const { data, loading, error } = useAsyncData(
    {
      genres: () => browseAPI.getGenres(sortBy, sortDirection),
      total: () => browseAPI.getTotalGenreEntries(),
    },
    [sortBy, sortDirection],
    { cacheKey: `browseGenres-${sortBy}-${sortDirection}` }
  );

  const genresData = data.genres || null;
  const totalEntries = data.total || null;

  const handleSortChange = useCallback(async (sort, direction) => {
    setSortBy(sort);
    setSortDirection(direction);
  }, []);

  const handleFilterChange = useCallback((filter) => {
    setFilterText(filter);
  }, []);

  const genresConfig = useMemo(() => entryConfigs.genres, []);

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
        <title>Browse Genres</title>
      </Helmet>

      <ContentContainer>
        <BrowseHeader
          entryType="genres"
          totalEntries={totalEntries}
          filterPlaceholder="Filter genres..."
          sortOptions={genresConfig.sortOptions}
          onFilterChange={handleFilterChange}
          onSortSelectChange={handleSortChange}
          sortBy={sortBy}
          sortDirection={sortDirection}
        />
        {loading ? (
          <ComponentLoader />
        ) : !genresData || !genresData.length ? (
          <BrowseNoResults entryType="genres" />
        ) : (
          <BrowseTableView
            data={genresData}
            entryType="genres"
            config={genresConfig}
            filterText={filterText}
          />
        )}
      </ContentContainer>
    </>
  );
}

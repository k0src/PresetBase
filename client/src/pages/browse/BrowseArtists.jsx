import { getArtistsData, getTotalArtistEntries } from "../../api/browse";
import { entryConfigs } from "./entryConfigs.js";
import { useAsyncData } from "../../hooks/useAsyncData.js";

import { useState, useCallback, useMemo } from "react";
import { Helmet } from "react-helmet-async";

import ContentContainer from "../../components/ContentContainer/ContentContainer.jsx";
import PageLoader from "../../components/PageLoader/PageLoader.jsx";
import DbError from "../../components/DbError/DbError.jsx";
import BrowseNoResults from "../../components/Browse/BrowseNoResults/BrowseNoResults.jsx";
import BrowseResults from "../../components/Browse/BrowseResults/BrowseResults.jsx";

export default function BrowseArtists() {
  const [sortBy, setSortBy] = useState("added");
  const [sortDirection, setSortDirection] = useState("asc");
  const [filterText, setFilterText] = useState("");

  const { data, loading, error } = useAsyncData(
    {
      artists: () => getArtistsData(sortBy, sortDirection),
      total: () => getTotalArtistEntries(),
    },
    [sortBy, sortDirection],
    { cacheKey: `browseArtists-${sortBy}-${sortDirection}` }
  );

  const artistsData = data.artists?.data || null;
  const totalEntries = data.total?.data || null;

  const handleSortChange = useCallback(async (sort, direction) => {
    setSortBy(sort);
    setSortDirection(direction);
  }, []);

  const handleFilterChange = useCallback((filter) => {
    setFilterText(filter);
  }, []);

  const artistsConfig = useMemo(() => entryConfigs.artists, []);

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

  // No results
  if (!artistsData || artistsData.length === 0) {
    return (
      <>
        <Helmet>
          <title>Browse Artists</title>
        </Helmet>

        <ContentContainer isAuth={true} userIsAdmin={true}>
          <BrowseNoResults entryType="artists" />
        </ContentContainer>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Browse Artists</title>
      </Helmet>

      <ContentContainer isAuth={true} userIsAdmin={true}>
        <BrowseResults
          entryType="artists"
          data={artistsData}
          totalEntries={totalEntries}
          config={artistsConfig}
          onSortChange={handleSortChange}
          onFilterChange={handleFilterChange}
          sortBy={sortBy}
          sortDirection={sortDirection}
          filterText={filterText}
          filterPlaceholder="Filter artists..."
        />
      </ContentContainer>
    </>
  );
}

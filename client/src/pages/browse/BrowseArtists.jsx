import { getArtistsData, getTotalArtistEntries } from "../../api/browse";
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
        <title>Browse Artists</title>
      </Helmet>

      <ContentContainer isAuth={true} userIsAdmin={true}>
        <BrowseHeader
          entryType="artists"
          totalEntries={totalEntries}
          filterPlaceholder="Filter artists..."
          sortOptions={artistsConfig.sortOptions}
          onFilterChange={handleFilterChange}
          onSortSelectChange={handleSortChange}
          sortBy={sortBy}
          sortDirection={sortDirection}
        />
        {loading ? (
          <ComponentLoader />
        ) : !artistsData || !artistsData.length ? (
          <BrowseNoResults entryType="artists" />
        ) : (
          <BrowseTableView
            data={artistsData}
            entryType="artists"
            config={artistsConfig}
            filterText={filterText}
          />
        )}
      </ContentContainer>
    </>
  );
}

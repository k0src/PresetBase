import { getAlbumsData, getTotalAlbumEntries } from "../../api/browse.js";
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

export default function BrowseAlbums() {
  const [sortBy, setSortBy] = useState("added");
  const [sortDirection, setSortDirection] = useState("asc");
  const [filterText, setFilterText] = useState("");

  const { data, loading, error } = useAsyncData(
    {
      albums: () => getAlbumsData(sortBy, sortDirection),
      total: () => getTotalAlbumEntries(),
    },
    [sortBy, sortDirection],
    { cacheKey: `browseAlbums-${sortBy}-${sortDirection}` }
  );

  const albumsData = data.albums?.data || null;
  const totalEntries = data.total?.data || null;

  const handleSortChange = useCallback(async (sort, direction) => {
    setSortBy(sort);
    setSortDirection(direction);
  }, []);

  const handleFilterChange = useCallback((filter) => {
    setFilterText(filter);
  }, []);

  const albumsConfig = useMemo(() => entryConfigs.albums, []);

  if (loading)
    return (
      <>
        <Helmet>
          <title>Browse Albums</title>
        </Helmet>

        <ContentContainer isAuth={true} userIsAdmin={true}>
          <BrowseHeader
            entryType="albums"
            totalEntries={totalEntries}
            filterPlaceholder="Filter albums..."
            sortOptions={albumsConfig.sortOptions}
            onFilterChange={handleFilterChange}
            onSortSelectChange={handleSortChange}
            sortBy={sortBy}
            sortDirection={sortDirection}
          />

          <ComponentLoader />
        </ContentContainer>
      </>
    );

  if (error) {
    return (
      <>
        <Helmet>
          <title>Internal Server Error</title>
        </Helmet>
        <DbError message={error} />
      </>
    );
  }

  // No results
  if (!albumsData || !albumsData.length) {
    return (
      <>
        <Helmet>
          <title>Browse Albums</title>
        </Helmet>

        <ContentContainer isAuth={true} userIsAdmin={true}>
          <BrowseNoResults entryType="albums" />
        </ContentContainer>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Browse Albums</title>
      </Helmet>

      <ContentContainer isAuth={true} userIsAdmin={true}>
        <BrowseHeader
          entryType="albums"
          totalEntries={totalEntries}
          filterPlaceholder="Filter albums..."
          sortOptions={albumsConfig.sortOptions}
          onFilterChange={handleFilterChange}
          onSortSelectChange={handleSortChange}
          sortBy={sortBy}
          sortDirection={sortDirection}
        />

        <BrowseTableView
          data={albumsData}
          entryType="albums"
          config={albumsConfig}
          filterText={filterText}
        />
      </ContentContainer>
    </>
  );
}

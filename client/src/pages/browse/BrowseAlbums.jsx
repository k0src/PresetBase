import { getAlbumsData, getTotalAlbumEntries } from "../../api/browse.js";
import { entryConfigs } from "./entryConfigs.js";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Helmet } from "react-helmet-async";

import ContentContainer from "../../components/ContentContainer/ContentContainer.jsx";
import PageLoader from "../../components/PageLoader/PageLoader.jsx";
import DbError from "../../components/DbError/DbError.jsx";
import BrowseNoResults from "../../components/Browse/BrowseNoResults/BrowseNoResults.jsx";
import BrowseResults from "../../components/Browse/BrowseResults/BrowseResults.jsx";

export default function BrowseAlbums() {
  const [albumsData, setAlbumsData] = useState(null);
  const [totalEntries, setTotalEntries] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState("added");
  const [sortDirection, setSortDirection] = useState("asc");
  const [filterText, setFilterText] = useState("");

  useEffect(() => {
    const loadAlbumsData = async () => {
      try {
        setLoading(true);
        const [albumsDataRes, totalEntriesRes] = await Promise.all([
          getAlbumsData(sortBy, sortDirection),
          getTotalAlbumEntries(),
        ]);

        setAlbumsData(albumsDataRes.data);
        setTotalEntries(totalEntriesRes.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadAlbumsData();
  }, [sortBy, sortDirection]);

  const handleSortChange = useCallback(async (sort, direction) => {
    setSortBy(sort);
    setSortDirection(direction);
  }, []);

  const handleFilterChange = useCallback((filter) => {
    setFilterText(filter);
  }, []);

  const albumsConfig = useMemo(() => entryConfigs.albums, []);

  if (loading) return <PageLoader />;

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
        <BrowseResults
          entryType="albums"
          data={albumsData}
          totalEntries={totalEntries}
          config={albumsConfig}
          onSortChange={handleSortChange}
          onFilterChange={handleFilterChange}
          sortBy={sortBy}
          sortDirection={sortDirection}
          filterText={filterText}
          filterPlaceholder="Filter albums..."
        />
      </ContentContainer>
    </>
  );
}

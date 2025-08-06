import { getSongsData, getTotalEntries } from "../../api/browse.js";
import { entryConfigs } from "./entryConfigs.js";

import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";

import ContentContainer from "../../components/ContentContainer/ContentContainer.jsx";
import PageLoader from "../../components/PageLoader/PageLoader.jsx";
import DbError from "../../components/DbError/DbError.jsx";
import BrowseNoResults from "../../components/Browse/BrowseNoResults/BrowseNoResults.jsx";
import BrowseResults from "../../components/Browse/BrowseResults/BrowseResults.jsx";

export default function BrowseSongs() {
  const [songsData, setSongsData] = useState(null);
  const [totalEntries, setTotalEntries] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState("added");
  const [sortDirection, setSortDirection] = useState("asc");
  const [filterText, setFilterText] = useState("");

  useEffect(() => {
    const loadSongsData = async () => {
      try {
        setLoading(true);
        const [songsDataRes, totalEntriesRes] = await Promise.all([
          getSongsData(sortBy, sortDirection),
          getTotalEntries(),
        ]);

        setSongsData(songsDataRes.data);
        setTotalEntries(totalEntriesRes.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadSongsData();
  }, [sortBy, sortDirection]);

  const handleSortChange = async (sort, direction) => {
    setSortBy(sort);
    setSortDirection(direction);
  };

  const handleFilterChange = (filter) => {
    setFilterText(filter);
  };

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
  if (!songsData || !songsData.length) {
    return (
      <>
        <Helmet>
          <title>Browse Songs</title>
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
        <title>Browse Songs</title>
      </Helmet>

      <ContentContainer isAuth={true} userIsAdmin={true}>
        <BrowseResults
          entryType="songs"
          data={songsData}
          totalEntries={totalEntries}
          config={entryConfigs.songs}
          onSortChange={handleSortChange}
          onFilterChange={handleFilterChange}
          sortBy={sortBy}
          sortDirection={sortDirection}
          filterText={filterText}
        />
      </ContentContainer>
    </>
  );
}

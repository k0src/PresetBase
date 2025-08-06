import { getArtistsData, getTotalArtistEntries } from "../../api/browse";
import { entryConfigs } from "./entryConfigs.js";

import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";

import ContentContainer from "../../components/ContentContainer/ContentContainer.jsx";
import PageLoader from "../../components/PageLoader/PageLoader.jsx";
import DbError from "../../components/DbError/DbError.jsx";
import BrowseNoResults from "../../components/Browse/BrowseNoResults/BrowseNoResults.jsx";
import BrowseResults from "../../components/Browse/BrowseResults/BrowseResults.jsx";

export default function BrowseArtists() {
  const [artistsData, setArtistsData] = useState(null);
  const [totalEntries, setTotalEntries] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState("added");
  const [sortDirection, setSortDirection] = useState("asc");
  const [filterText, setFilterText] = useState("");

  useEffect(() => {
    const loadArtistsData = async () => {
      try {
        setLoading(true);
        const [artistsDataRes, totalEntriesRes] = await Promise.all([
          getArtistsData(sortBy, sortDirection),
          getTotalArtistEntries(),
        ]);

        setArtistsData(artistsDataRes.data);
        setTotalEntries(totalEntriesRes.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadArtistsData();
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
          config={entryConfigs.artists}
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

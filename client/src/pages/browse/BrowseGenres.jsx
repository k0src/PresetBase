import { getGenresData, getTotalGenreEntries } from "../../api/browse.js";
import { entryConfigs } from "./entryConfigs.js";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Helmet } from "react-helmet-async";

import ContentContainer from "../../components/ContentContainer/ContentContainer.jsx";
import PageLoader from "../../components/PageLoader/PageLoader.jsx";
import DbError from "../../components/DbError/DbError.jsx";
import BrowseNoResults from "../../components/Browse/BrowseNoResults/BrowseNoResults.jsx";
import BrowseResults from "../../components/Browse/BrowseResults/BrowseResults.jsx";

export default function BrowseGenres() {
  const [genresData, setGenresData] = useState(null);
  const [totalEntries, setTotalEntries] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState("added");
  const [sortDirection, setSortDirection] = useState("asc");
  const [filterText, setFilterText] = useState("");

  useEffect(() => {
    const loadGenresData = async () => {
      try {
        setLoading(true);
        const [genresDataRes, totalEntriesRes] = await Promise.all([
          getGenresData(sortBy, sortDirection),
          getTotalGenreEntries(),
        ]);

        setGenresData(genresDataRes.data);
        setTotalEntries(totalEntriesRes.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadGenresData();
  }, [sortBy, sortDirection]);

  const handleSortChange = useCallback(async (sort, direction) => {
    setSortBy(sort);
    setSortDirection(direction);
  }, []);

  const handleFilterChange = useCallback((filter) => {
    setFilterText(filter);
  }, []);

  const genresConfig = useMemo(() => entryConfigs.genres, []);

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
  if (!genresData || !genresData.length) {
    return (
      <>
        <Helmet>
          <title>Browse Genres</title>
        </Helmet>

        <ContentContainer isAuth={true} userIsAdmin={true}>
          <BrowseNoResults entryType="genres" />
        </ContentContainer>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Browse Genres</title>
      </Helmet>

      <ContentContainer isAuth={true} userIsAdmin={true}>
        <BrowseResults
          entryType="genres"
          data={genresData}
          totalEntries={totalEntries}
          config={genresConfig}
          onSortChange={handleSortChange}
          onFilterChange={handleFilterChange}
          sortBy={sortBy}
          sortDirection={sortDirection}
          filterText={filterText}
          filterPlaceholder="Filter genres..."
        />
      </ContentContainer>
    </>
  );
}

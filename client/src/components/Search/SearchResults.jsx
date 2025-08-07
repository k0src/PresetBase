import { useState, memo, useMemo, useCallback } from "react";
import { FaBan, FaFilter } from "react-icons/fa";
import SearchResultSection from "./SearchResultSection";
import styles from "./SearchResults.module.css";

export default memo(function SearchResults({ searchData, searchQuery }) {
  const [filter, setFilter] = useState("all");

  const handleFilterChange = useCallback((e) => {
    setFilter(e.target.value);
  }, []);

  const { totalResults, songs, artists, albums, synths, presets } =
    useMemo(() => {
      if (!searchData) return {};
      return searchData;
    }, [searchData]);

  if (!searchData) {
    return (
      <div className={styles.noResultsContainer}>
        <FaBan className={styles.noResultsIcon} />
        <span className={styles.noResultsText}>No search data available</span>
      </div>
    );
  }

  if (!totalResults) {
    return (
      <div className={styles.noResultsContainer}>
        <FaBan className={styles.noResultsIcon} />
        <span className={styles.noResultsText}>
          No results for "{searchQuery}"
        </span>
      </div>
    );
  }

  return (
    <>
      <section className={styles.searchResultsHeader}>
        <h1 className={styles.headingPrimary}>
          {totalResults} {totalResults === 1 ? "result" : "results"} for "
          {searchQuery}"
        </h1>
        <div className={styles.searchResultsFilterContainer}>
          <select
            name="filter"
            className={styles.searchResultsFilterSelect}
            value={filter}
            onChange={handleFilterChange}
          >
            <option value="all">All</option>
            <option value="songs">Songs</option>
            <option value="artists">Artists</option>
            <option value="albums">Albums</option>
            <option value="synths">Synths</option>
            <option value="presets">Presets</option>
          </select>
          <FaFilter className={styles.filterIcon} />
        </div>
      </section>

      <section className={styles.searchResultsContainer}>
        <SearchResultSection
          title="Songs"
          data={songs}
          type="songs"
          filter={filter}
        />
        <SearchResultSection
          title="Artists"
          data={artists}
          type="artists"
          filter={filter}
        />
        <SearchResultSection
          title="Albums"
          data={albums}
          type="albums"
          filter={filter}
        />
        <SearchResultSection
          title="Synths"
          data={synths}
          type="synths"
          filter={filter}
        />
        <SearchResultSection
          title="Presets"
          data={presets}
          type="presets"
          filter={filter}
        />
      </section>
    </>
  );
});

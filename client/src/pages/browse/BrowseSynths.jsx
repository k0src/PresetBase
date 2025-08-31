import { getSynthsData, getTotalSynthEntries } from "../../api/browse.js";
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

export default function BrowseSynths() {
  const [sortBy, setSortBy] = useState("added");
  const [sortDirection, setSortDirection] = useState("asc");
  const [filterText, setFilterText] = useState("");

  const { data, loading, error } = useAsyncData(
    {
      synths: () => getSynthsData(sortBy, sortDirection),
      total: () => getTotalSynthEntries(),
    },
    [sortBy, sortDirection],
    { cacheKey: `browseSynths-${sortBy}-${sortDirection}` }
  );

  const synthsData = data.synths?.data || null;
  const totalEntries = data.total?.data || null;

  const handleSortChange = useCallback(async (sort, direction) => {
    setSortBy(sort);
    setSortDirection(direction);
  }, []);

  const handleFilterChange = useCallback((filter) => {
    setFilterText(filter);
  }, []);

  const synthsConfig = useMemo(() => entryConfigs.synths, []);

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
        <title>Browse Synths</title>
      </Helmet>

      <ContentContainer>
        <BrowseHeader
          entryType="synths"
          totalEntries={totalEntries}
          filterPlaceholder="Filter synths..."
          sortOptions={synthsConfig.sortOptions}
          onFilterChange={handleFilterChange}
          onSortSelectChange={handleSortChange}
          sortBy={sortBy}
          sortDirection={sortDirection}
        />
        {loading ? (
          <ComponentLoader />
        ) : !synthsData || !synthsData.length ? (
          <BrowseNoResults entryType="synths" />
        ) : (
          <BrowseTableView
            data={synthsData}
            entryType="synths"
            config={synthsConfig}
            filterText={filterText}
          />
        )}
      </ContentContainer>
    </>
  );
}

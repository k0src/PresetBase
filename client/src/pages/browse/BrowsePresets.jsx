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

export default function BrowsePresets() {
  const [sortBy, setSortBy] = useState("added");
  const [sortDirection, setSortDirection] = useState("asc");
  const [filterText, setFilterText] = useState("");

  const { data, loading, error } = useAsyncData(
    {
      presets: () => browseAPI.getPresets(sortBy, sortDirection),
      total: () => browseAPI.getTotalPresetEntries(),
    },
    [sortBy, sortDirection],
    { cacheKey: `browsePresets-${sortBy}-${sortDirection}` }
  );

  const presetsData = data.presets || null;
  const totalEntries = data.total || null;

  const handleSortChange = useCallback(async (sort, direction) => {
    setSortBy(sort);
    setSortDirection(direction);
  }, []);

  const handleFilterChange = useCallback((filter) => {
    setFilterText(filter);
  }, []);

  const presetsConfig = useMemo(() => entryConfigs.presets, []);

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
        <title>Browse Presets</title>
      </Helmet>

      <ContentContainer>
        <BrowseHeader
          entryType="presets"
          totalEntries={totalEntries}
          filterPlaceholder="Filter presets..."
          sortOptions={presetsConfig.sortOptions}
          onFilterChange={handleFilterChange}
          onSortSelectChange={handleSortChange}
          sortBy={sortBy}
          sortDirection={sortDirection}
        />
        {loading ? (
          <ComponentLoader />
        ) : !presetsData || !presetsData.length ? (
          <BrowseNoResults entryType="presets" />
        ) : (
          <BrowseTableView
            data={presetsData}
            entryType="presets"
            config={presetsConfig}
            filterText={filterText}
          />
        )}
      </ContentContainer>
    </>
  );
}

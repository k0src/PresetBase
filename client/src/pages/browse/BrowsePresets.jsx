import { getPresetsData, getTotalPresetEntries } from "../../api/browse.js";
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
      presets: () => getPresetsData(sortBy, sortDirection),
      total: () => getTotalPresetEntries(),
    },
    [sortBy, sortDirection],
    { cacheKey: `browsePresets-${sortBy}-${sortDirection}` }
  );

  const presetsData = data.presets?.data || null;
  const totalEntries = data.total?.data || null;

  const handleSortChange = useCallback(async (sort, direction) => {
    setSortBy(sort);
    setSortDirection(direction);
  }, []);

  const handleFilterChange = useCallback((filter) => {
    setFilterText(filter);
  }, []);

  const presetsConfig = useMemo(() => entryConfigs.presets, []);

  if (loading)
    return (
      <>
        <Helmet>
          <title>Browse Presets</title>
        </Helmet>

        <ContentContainer isAuth={true} userIsAdmin={true}>
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
        <DbError errorMessage={error} />
      </>
    );
  }

  // No results
  if (!presetsData || !presetsData.length) {
    return (
      <>
        <Helmet>
          <title>Browse Presets</title>
        </Helmet>

        <ContentContainer isAuth={true} userIsAdmin={true}>
          <BrowseNoResults entryType="presets" />
        </ContentContainer>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Browse Presets</title>
      </Helmet>

      <ContentContainer isAuth={true} userIsAdmin={true}>
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

        <BrowseTableView
          data={presetsData}
          entryType="presets"
          config={presetsConfig}
          filterText={filterText}
        />
      </ContentContainer>
    </>
  );
}

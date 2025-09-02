import {
  SlideoutProvider,
  useSlideout,
} from "../../../contexts/SlideoutContext";
import { useAsyncData } from "../../../hooks/useAsyncData";
import { adminAPI } from "../../../api/admin";

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { Helmet } from "react-helmet-async";

import { dbEntryConfigs } from "../../../components/Admin/ManageDb/dbEntryConfigs";

import ContentContainer from "../../../components/ContentContainer/ContentContainer";
import ComponentLoader from "../../../components/ComponentLoader/ComponentLoader";
import DbError from "../../../components/DbError/DbError";
import ManageDbNoEntries from "../../../components/Admin/ManageDb/ManageDbNoEntries/ManageDbNoEntries";
import EntryTable from "../../../components/Admin/ManageDb/EntryTable/EntryTable";
import AdminSlideout from "../../../components/Admin/ManageDb/Slideout/AdminSlideout/AdminSlideout";
import ManageDbFilter from "../../../components/Admin/ManageDb/ManageDbFilter/ManageDbFilter";
import ManageDbSortSelector from "../../../components/Admin/ManageDb/ManageDbSortSelector/ManageDbSortSelector";
import styles from "./AdminManageUsers.module.css";

function AdminManageUsersContent() {
  const { isOpen, madeChanges } = useSlideout();

  const [sortBy, setSortBy] = useState("added");
  const [sortDirection, setSortDirection] = useState("asc");
  const [filterText, setFilterText] = useState("");

  const { data, loading, error, refetch } = useAsyncData(
    {
      users: () => adminAPI.getUsers(sortBy, sortDirection),
    },

    [sortBy, sortDirection],
    { cacheKey: `adminManageUsers-${sortBy}-${sortDirection}` }
  );

  const usersData = data.users || null;
  const totalUsers = usersData ? usersData.length : 0;
  const usersConfig = useMemo(() => dbEntryConfigs.users, []);

  const handleSlideoutDelete = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleSortChange = useCallback((sort, direction) => {
    setSortBy(sort);
    setSortDirection(direction);
  }, []);

  const handleFilterChange = useCallback((filter) => {
    setFilterText(filter);
  }, []);

  const prevIsOpenRef = useRef(isOpen);
  const prevMadeChangesRef = useRef(madeChanges);

  useEffect(() => {
    if (prevIsOpenRef.current && !isOpen && prevMadeChangesRef.current) {
      refetch();
    }
    prevIsOpenRef.current = isOpen;
    prevMadeChangesRef.current = madeChanges;
  }, [isOpen, madeChanges, refetch]);

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

  const hasData = usersData && usersData.length;

  return (
    <>
      <Helmet>
        <title>Manage Users</title>
      </Helmet>

      <ContentContainer>
        <section className={styles.header}>
          <div className={styles.headerTop}>
            <h1 className={styles.headingPrimary}>Manage Users</h1>
            <span className={styles.totalEntries}>{totalUsers} users</span>
          </div>

          <div className={styles.headerBottom}>
            <ManageDbFilter
              placeholder="Filter users..."
              onFilterChange={handleFilterChange}
              value={filterText}
            />

            <ManageDbSortSelector
              sortOptions={usersConfig.sortOptions}
              onSortSelectChange={handleSortChange}
              sortBy={sortBy}
              sortDirection={sortDirection}
            />
          </div>
        </section>

        {loading ? (
          <ComponentLoader />
        ) : !hasData ? (
          <ManageDbNoEntries entryType="users" />
        ) : (
          <EntryTable
            data={usersData}
            config={usersConfig}
            filterText={filterText}
            entryType="users"
          />
        )}
      </ContentContainer>

      {hasData && !loading && <AdminSlideout onDelete={handleSlideoutDelete} />}
    </>
  );
}

export default function AdminManageUsers() {
  return (
    <SlideoutProvider>
      <AdminManageUsersContent />
    </SlideoutProvider>
  );
}

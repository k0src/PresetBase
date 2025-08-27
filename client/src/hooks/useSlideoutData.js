import { useCallback, useEffect } from "react";
import { useSlideout } from "../contexts/SlideoutContext";
import { getEntryData, updateEntry, deleteEntry } from "../api/admin";

export function useSlideoutData() {
  const {
    isOpen,
    entryType,
    entryId,
    data,
    loading,
    error,
    hasChanges,
    setData,
    setError,
    setLoading,
    setHasChanges,
    resetChanges,
    refreshSlideoutData,
    closeSlideout,
  } = useSlideout();

  const fetchSlideoutData = useCallback(async () => {
    if (!entryType || !entryId) return;

    try {
      setLoading(true);
      const entryData = await getEntryData(entryType, entryId);
      setData(entryData);
    } catch (err) {
      console.error("Failed to fetch entry data:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [entryType, entryId, setData, setError, setLoading]);

  useEffect(() => {
    if (isOpen && entryType && entryId && (!data || loading)) {
      fetchSlideoutData();
    }
  }, [isOpen, entryType, entryId, data, loading, fetchSlideoutData]);

  const updateEntryData = useCallback(
    async (formData) => {
      if (!entryType || !entryId) return;

      try {
        setLoading(true);
        await updateEntry(entryType, entryId, formData);
        resetChanges();
        await fetchSlideoutData();
        return true;
      } catch (err) {
        console.error("Failed to update entry:", err);
        setError(err.message);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [entryType, entryId, setLoading, setError, resetChanges, fetchSlideoutData]
  );

  const deleteEntryData = useCallback(async () => {
    if (!entryType || !entryId) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this entry? This action cannot be undone."
    );

    if (!confirmed) return false;

    try {
      await deleteEntry(entryType, entryId);
      closeSlideout();
      return true;
    } catch (err) {
      console.error("Failed to delete entry:", err);
      setError(err.message);
      return false;
    }
  }, [entryType, entryId, setError, closeSlideout]);

  const markAsChanged = useCallback(() => {
    if (!hasChanges) {
      setHasChanges(true);
    }
  }, [hasChanges, setHasChanges]);

  return {
    isOpen,
    entryType,
    entryId,
    data,
    loading,
    error,
    hasChanges,
    updateEntryData,
    deleteEntryData,
    markAsChanged,
    refreshSlideoutData,
    closeSlideout,
  };
}

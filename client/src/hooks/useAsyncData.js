import { useState, useEffect, useRef } from "react";

// Key for persistent local storage cache
const LOCAL_STORAGE_PREFIX = "useAsyncData:";

const getCachedData = (cacheKey) => {
  const raw = localStorage.getItem(LOCAL_STORAGE_PREFIX + cacheKey);
  if (!raw) return null; // No cached data

  try {
    const { data, timestamp, ttl } = JSON.parse(raw);
    const now = Date.now();

    if (ttl && now - timestamp > ttl) {
      return { data, expired: true }; // Stale cached data
    }

    return { data, expired: false }; // fresh
  } catch {
    console.error("Error parsing cached data:", raw);
    localStorage.removeItem(LOCAL_STORAGE_PREFIX + cacheKey);
    return null; // Invalid cached data format
  }
};

const setCachedData = (cacheKey, data, ttl = null) => {
  const payload = {
    data,
    timestamp: Date.now(),
    ttl,
  };
  localStorage.setItem(
    LOCAL_STORAGE_PREFIX + cacheKey,
    JSON.stringify(payload)
  );
};

/**
 * Fetches data from one or more asynchronous functions with localStorage caching support.
 * Returns cached data immediately if available, and automatically re-fetches data
 * in the background if the cache is expired to keep data fresh without blocking the UI.
 * Handles loading, error states, and prevents race conditions.
 *
 * @param {Object<string, Function>} asyncFns - Object where each key maps to an async function returning a Promise.
 * @param {Array<any>} dependencies - Dependency array to determine when to re-fetch the data.
 * @param {Object} options - Optional settings.
 * @param {string} options.cacheKey - A unique key for caching the data in localStorage.
 * @param {number} [options.ttl=300000] - Time-to-live for the cache in milliseconds (default: 5 minutes).
 *
 * @returns {{
 *   data: Object,
 *   loading: boolean,
 *   error: any
 * }}
 */
export function useAsyncData(asyncFns, dependencies = [], options = {}) {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const requestIdRef = useRef(0);
  const { cacheKey, ttl = 1000 * 60 * 5 } = options; // default: 5 minutes

  useEffect(() => {
    const currentRequestId = ++requestIdRef.current;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const fns = Object.entries(asyncFns);
        const results = await Promise.all(fns.map(([_, fn]) => fn()));

        if (currentRequestId !== requestIdRef.current) return;

        const structuredData = fns.reduce((acc, [key], i) => {
          acc[key] = results[i];
          return acc;
        }, {});

        if (cacheKey) {
          setCachedData(cacheKey, structuredData, ttl);
        }

        setData(structuredData);
      } catch (err) {
        if (currentRequestId !== requestIdRef.current) return;
        setError(err);
      } finally {
        if (currentRequestId === requestIdRef.current) {
          setLoading(false);
        }
      }
    };

    // Load from cache first
    if (cacheKey) {
      const cached = getCachedData(cacheKey);
      if (cached) {
        setData(cached.data);
        setLoading(false);

        // Trigger background refetch if expired
        if (cached.expired) {
          fetchData();
        }
        return;
      }
    }

    // No cache: fetch immediately
    fetchData();
  }, dependencies);

  return { data, loading, error };
}

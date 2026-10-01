import { useCallback, useEffect, useRef, useState } from "react";
import axiosInstance from "services.js/axiosInstance";
import { extractList, extractTotal } from "layouts/dashboard/utils/apiShape";

const ENDPOINTS = {
  employees: {
    url: "/employees",
    params: { activeOnly: true, page: 0, size: 500, sort: "firstName" },
  },
  departments: { url: "/departments", params: { activeOnly: false } },
  projects: { url: "/projects" },
  kras: { url: "/project-kras", params: { page: 0, size: 200 } },
  kpas: { url: "/project-kpas", params: { activeOnly: true, page: 0, size: 200 } },
};

const KEYS = Object.keys(ENDPOINTS);

const emptySlice = { list: [], total: 0 };

/**
 * Polls every dashboard endpoint in parallel.
 *
 * - One failing endpoint never blanks the others (Promise.allSettled).
 * - A failed refresh keeps the last good data and reports the error.
 * - Polls with setTimeout *after* each cycle finishes, so slow responses
 *   never stack up overlapping requests.
 * - Pauses while the browser tab is hidden, refreshes as soon as it is visible.
 */
export default function useDashboardData({ live = true, intervalMs = 30000 } = {}) {
  const [data, setData] = useState(() =>
    KEYS.reduce((acc, k) => ({ ...acc, [k]: emptySlice }), {})
  );
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  const inFlight = useRef(false);
  const controllerRef = useRef(null);
  const timerRef = useRef(null);
  const mounted = useRef(true);

  const fetchAll = useCallback(async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    setRefreshing(true);

    const controller = new AbortController();
    controllerRef.current = controller;

    const results = await Promise.allSettled(
      KEYS.map((key) =>
        axiosInstance.get(ENDPOINTS[key].url, {
          params: ENDPOINTS[key].params,
          signal: controller.signal,
        })
      )
    );

    inFlight.current = false;
    if (!mounted.current || controller.signal.aborted) return;

    const nextErrors = {};
    setData((prev) => {
      const next = { ...prev };
      results.forEach((result, i) => {
        const key = KEYS[i];
        if (result.status === "fulfilled") {
          const body = result.value.data;
          next[key] = { list: extractList(body), total: extractTotal(body) };
        } else {
          const err = result.reason;
          nextErrors[key] =
            err?.response?.data?.message ||
            (err?.response ? `HTTP ${err.response.status}` : err?.message || "Request failed");
        }
      });
      return next;
    });

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length < KEYS.length) setLastUpdated(new Date());
    setLoading(false);
    setRefreshing(false);
  }, []);

  // Initial load + polling loop
  useEffect(() => {
    mounted.current = true;
    let cancelled = false;

    const schedule = () => {
      clearTimeout(timerRef.current);
      if (!live || cancelled) return;
      timerRef.current = setTimeout(async () => {
        if (!document.hidden) await fetchAll();
        schedule();
      }, intervalMs);
    };

    const onVisible = () => {
      if (!document.hidden && live) {
        fetchAll().then(schedule);
      }
    };

    fetchAll().then(schedule);
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      cancelled = true;
      clearTimeout(timerRef.current);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [live, intervalMs, fetchAll]);

  // Abort any request still running when the dashboard unmounts
  useEffect(
    () => () => {
      mounted.current = false;
      controllerRef.current?.abort();
    },
    []
  );

  return { data, errors, loading, refreshing, lastUpdated, refresh: fetchAll };
}

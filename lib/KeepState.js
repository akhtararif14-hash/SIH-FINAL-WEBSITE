'use client';
// lib/KeepState.js
// Keeps a page's state alive when the user goes to another page and comes back.
//
// THE PROBLEM
// Next.js unmounts a page component when you navigate away, and useState dies
// with it. So a finished location study, a chat conversation or a calculator
// result all vanished the moment you tapped another menu item. Worse, if a
// study was still running, its result landed in a component that no longer
// existed, so the work was thrown away.
//
// THE FIX
// The values are kept in a store that lives in the layout, ABOVE the pages.
// The layout never unmounts, so neither does the store.
//
// useKeepState works exactly like useState — same [value, setValue] — except
// the value is stored under a key that outlives the page:
//
//     const [report, setReport] = useKeepState('advisor.report', null);
//
// Because setValue writes straight into that store, a fetch that finishes
// after the user has already left the page still saves its result. Come back
// and it is there, finished.

import { createContext, useContext, useRef, useCallback, useSyncExternalStore } from 'react';

function createStore() {
  const values = new Map();
  const listeners = new Map(); // key -> Set of callbacks

  return {
    has: (key) => values.has(key),
    read: (key) => values.get(key),

    seed(key, initial) {
      if (!values.has(key)) {
        values.set(key, typeof initial === 'function' ? initial() : initial);
      }
    },

    write(key, next) {
      const current = values.get(key);
      const value = typeof next === 'function' ? next(current) : next;
      if (Object.is(value, current)) return;
      values.set(key, value);
      const subs = listeners.get(key);
      if (subs) subs.forEach((fn) => fn());
    },

    subscribe(key, fn) {
      if (!listeners.has(key)) listeners.set(key, new Set());
      listeners.get(key).add(fn);
      return () => {
        const subs = listeners.get(key);
        if (subs) subs.delete(fn);
      };
    },

    // Used on logout, so the next person does not see the last one's data.
    clearAll() {
      const keys = [...values.keys()];
      values.clear();
      for (const key of keys) {
        const subs = listeners.get(key);
        if (subs) subs.forEach((fn) => fn());
      }
    },
  };
}

const KeepContext = createContext(null);

export function KeepStateProvider({ children }) {
  // useRef so the same store survives every re-render of the layout.
  const storeRef = useRef(null);
  if (storeRef.current === null) storeRef.current = createStore();
  return <KeepContext.Provider value={storeRef.current}>{children}</KeepContext.Provider>;
}

export function useKeepState(key, initial) {
  const store = useContext(KeepContext);

  // If the provider is missing for any reason, fall back to plain state so a
  // page still works instead of crashing.
  const fallback = useRef(null);
  if (!store && fallback.current === null) fallback.current = createStore();
  const s = store || fallback.current;

  s.seed(key, initial);

  const value = useSyncExternalStore(
    useCallback((cb) => s.subscribe(key, cb), [s, key]),
    useCallback(() => s.read(key), [s, key]),
    useCallback(() => s.read(key), [s, key]) // same value during server render
  );

  const setValue = useCallback((next) => s.write(key, next), [s, key]);

  return [value, setValue];
}

// Wipes everything kept in memory. Called when someone logs out.
export function useClearKeptState() {
  const store = useContext(KeepContext);
  return useCallback(() => store?.clearAll(), [store]);
}
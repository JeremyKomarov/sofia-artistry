'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const Ctx = createContext(null);
const DRAFT_KEY = '__preview_draft';

export function ContentProvider({ children }) {
  const [draft, setDraft] = useState(null);

  useEffect(() => {
    // Load any existing draft on mount (e.g. editor was already open)
    try {
      const stored = localStorage.getItem(DRAFT_KEY);
      if (stored) setDraft(JSON.parse(stored));
    } catch {}

    // React to changes written by the admin editor window
    function onStorage(e) {
      if (e.key !== DRAFT_KEY) return;
      if (e.newValue === null) { setDraft(null); return; }
      try { setDraft(JSON.parse(e.newValue)); } catch {}
    }
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  return <Ctx.Provider value={draft}>{children}</Ctx.Provider>;
}

export function useDraft(key, fallback) {
  const draft = useContext(Ctx);
  return draft?.[key] ?? fallback;
}

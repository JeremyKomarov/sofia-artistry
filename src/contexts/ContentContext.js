'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const Ctx = createContext(null);
const DRAFT_KEY = '__preview_draft';

export function ContentProvider({ children }) {
  const [draft, setDraft] = useState(null);

  useEffect(() => {
    // Drafts apply only inside the admin preview iframe — the public
    // site always renders published content.
    const isPreview = new URLSearchParams(window.location.search).get('preview') === '1';
    if (!isPreview) return;

    // Load any existing draft on mount (e.g. editor was already open).
    // setTimeout defers setState out of the synchronous effect body.
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

    function onMessage(e) {
      if (e.origin !== window.location.origin) return;
      if (!e.data || e.data.type !== '__preview_draft') return;
      setDraft(e.data.data);
    }

    window.addEventListener('storage', onStorage);
    window.addEventListener('message', onMessage);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('message', onMessage);
    };
  }, []);

  return <Ctx.Provider value={draft}>{children}</Ctx.Provider>;
}

export function useDraft(key, fallback) {
  const draft = useContext(Ctx);
  return draft?.[key] ?? fallback;
}

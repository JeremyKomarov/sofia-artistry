"use client";

import { useState, useEffect, useRef } from "react";
import FieldRow from "./FieldRow";
import ArrayEditor from "./ArrayEditor";
import HrefField from "./HrefField";
import LeadsTab from "./LeadsTab";
import VisitorsTab from "./VisitorsTab";

function setNestedValue(obj, path, value) {
  const segments = path.replace(/\[(\d+)\]/g, ".$1").split(".");
  const result = { ...obj };
  let cur = result;
  for (let i = 0; i < segments.length - 1; i++) {
    const key = segments[i];
    cur[key] = Array.isArray(cur[key]) ? [...cur[key]] : { ...cur[key] };
    cur = cur[key];
  }
  cur[segments[segments.length - 1]] = value;
  return result;
}

function EyeIcon({ off }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {off ? (
        <>
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
          <line x1="1" y1="1" x2="23" y2="23" />
        </>
      ) : (
        <>
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </>
      )}
    </svg>
  );
}

function Section({ label, id, open, onToggle, visible, onToggleVisible, children }) {
  const hidden = visible === false;
  return (
    <div
      className={`admin-section${open ? " admin-section--open" : ""}${hidden ? " admin-section--hidden" : ""}`}
    >
      <div className="admin-section__header">
        <button
          type="button"
          className="admin-section__title"
          onClick={onToggle}
          aria-expanded={open}
        >
          {label}
          <span className="admin-section__chevron">▼</span>
        </button>
        {onToggleVisible && (
          <button
            type="button"
            className={`admin-section__eye${hidden ? " admin-section__eye--off" : ""}`}
            onClick={onToggleVisible}
            title={hidden ? "Hidden on site — click to show" : "Shown on site — click to hide"}
            aria-label={hidden ? `Show ${label} on site` : `Hide ${label} on site`}
            aria-pressed={!hidden}
          >
            <EyeIcon off={hidden} />
          </button>
        )}
      </div>
      <div className="admin-section__body">{children}</div>
    </div>
  );
}

function PanelIcon({ open }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="9" y1="3" x2="9" y2="21" />
      {open && <polyline points="5 10 7 12 5 14" />}
      {!open && <polyline points="13 10 11 12 13 14" />}
    </svg>
  );
}

function DesktopIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <path d="M8 21h8M12 17v4" />
    </svg>
  );
}

function MobileIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="5" y="2" width="14" height="20" rx="2" />
      <circle cx="12" cy="17" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

const DEFAULT_FOOTER = {
  brandLine: 'Makeup Artist',
  cols: [
    { heading: 'Services', links: [{ label: 'Bridal Makeup', href: '#services' }, { label: 'Glam & Events', href: '#services' }, { label: 'Editorial', href: '#services' }] },
    { heading: 'Studio', links: [{ label: 'About Sofia', href: '#about' }, { label: 'Portfolio', href: '#gallery' }, { label: 'Reviews', href: '#reviews' }, { label: 'FAQ', href: '#faq' }] },
    { heading: 'Book', links: [{ label: 'Book a Session', href: '#lead-form' }, { label: 'Call Sofia', href: 'tel:+13105550192' }, { label: 'Instagram DM', href: 'https://instagram.com/sofiaartistry', external: true }] },
  ],
};

const DEFAULT_SECTIONS = {
  trust: true,
  services: true,
  gallery: true,
  reviews: true,
  about: true,
  process: true,
  faq: true,
  finalCta: true,
};

function normalizeContent(data) {
  return {
    ...data,
    FOOTER: data.FOOTER ?? DEFAULT_FOOTER,
    SECTIONS: { ...DEFAULT_SECTIONS, ...data.SECTIONS },
  };
}

const BLANK_SERVICE = {
  tag: "",
  title: "",
  photoLabel: "",
  photoGradient: "",
  photoSrc: "",
  photoAlt: "",
  description: "",
  price: "",
  duration: "",
  ctaText: "",
};
const BLANK_GALLERY = { label: "", src: "", alt: "", hidden: false, mobileOnly: false };
const BLANK_REVIEW = { stars: 5, body: "", name: "", role: "", initial: "" };
const BLANK_FAQ = { q: "", a: "" };

export default function Editor({ hasGoogleReviews = false }) {
  const iframeRef = useRef(null);
  const contentRef = useRef(null);
  const savedContentRef = useRef(null);
  const handleSaveRef = useRef(null);

  const [content, setContentState] = useState(null);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [open, setOpen] = useState("site");
  const [dirty, setDirty] = useState(false);
  const [syncStatus, setSyncStatus] = useState("idle");
  const [syncError, setSyncError] = useState("");
  const [viewport, setViewport] = useState("desktop");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("content");

  function applyContent(data) {
    contentRef.current = data;
    setContentState(data);
  }

  function writeDraft(data) {
    localStorage.setItem("__preview_draft", JSON.stringify(data));
  }

  useEffect(() => {
    fetch("/api/admin/content")
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load");
        return r.json();
      })
      .then((data) => {
        const normalized = normalizeContent(data);
        applyContent(normalized);
        savedContentRef.current = normalized;
        writeDraft(normalized);
      })
      .catch(() => setError("Could not load content. Check GitHub env vars."));
  }, []);

  function change(path, value) {
    const next = setNestedValue(contentRef.current, path, value);
    applyContent(next);
    writeDraft(next);
    setDirty(true);
    if (status === "saved" || status === "pristine") setStatus("idle");
  }

  function arrChange(key, i, field, value) {
    const arr = [...contentRef.current[key]];
    arr[i] = { ...arr[i], [field]: value };
    const next = { ...contentRef.current, [key]: arr };
    applyContent(next);
    writeDraft(next);
    setDirty(true);
    if (status === "saved" || status === "pristine") setStatus("idle");
  }

  function arrAdd(key, blank) {
    const next = { ...contentRef.current, [key]: [...contentRef.current[key], { ...blank }] };
    applyContent(next);
    writeDraft(next);
    setDirty(true);
    if (status === "saved" || status === "pristine") setStatus("idle");
  }

  function arrRemove(key, i) {
    const next = {
      ...contentRef.current,
      [key]: contentRef.current[key].filter((_, idx) => idx !== i),
    };
    applyContent(next);
    writeDraft(next);
    setDirty(true);
    if (status === "saved" || status === "pristine") setStatus("idle");
  }

  function footerColChange(ci, field, value) {
    const cols = contentRef.current.FOOTER.cols.map((col, idx) =>
      idx === ci ? { ...col, [field]: value } : col
    );
    change('FOOTER.cols', cols);
  }

  function footerLinkChange(ci, li, field, value) {
    const cols = contentRef.current.FOOTER.cols.map((col, ci2) => {
      if (ci2 !== ci) return col;
      return { ...col, links: col.links.map((link, li2) => li2 === li ? { ...link, [field]: value } : link) };
    });
    change('FOOTER.cols', cols);
  }

  function footerLinkAdd(ci) {
    const cols = contentRef.current.FOOTER.cols.map((col, ci2) =>
      ci2 === ci ? { ...col, links: [...col.links, { label: '', href: '' }] } : col
    );
    change('FOOTER.cols', cols);
  }

  function footerLinkRemove(ci, li) {
    const cols = contentRef.current.FOOTER.cols.map((col, ci2) =>
      ci2 === ci ? { ...col, links: col.links.filter((_, idx) => idx !== li) } : col
    );
    change('FOOTER.cols', cols);
  }

  async function handleSave() {
    if (!dirty) {
      setStatus("pristine");
      return;
    }
    setStatus("saving");
    setError("");
    const res = await fetch("/api/admin/content", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(contentRef.current),
    });
    if (res.ok) {
      savedContentRef.current = contentRef.current;
      setStatus("saved");
      setDirty(false);
    } else {
      const d = await res.json();
      setError(d.error || "Save failed");
      setStatus("error");
    }
  }

  async function handleReset() {
    const res = await fetch("/api/admin/content");
    if (!res.ok) return;
    const data = normalizeContent(await res.json());
    applyContent(data);
    savedContentRef.current = data;
    writeDraft(data);
    setStatus("idle");
    setError("");
    setDirty(false);
  }

  async function handleGoogleSync() {
    setSyncStatus("syncing");
    setSyncError("");
    try {
      const res = await fetch("/api/admin/reviews");
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Sync failed");
      }
      const reviews = await res.json();
      const next = { ...contentRef.current, REVIEWS: reviews };
      applyContent(next);
      writeDraft(next);
      setDirty(true);
      if (status === "saved" || status === "pristine") setStatus("idle");
      setSyncStatus("synced");
    } catch (e) {
      setSyncError(e.message);
      setSyncStatus("error");
    }
  }

  // Keep ref current so keyboard shortcut always calls the latest version
  useEffect(() => { handleSaveRef.current = handleSave; });

  // Cmd/Ctrl+S to publish
  useEffect(() => {
    function onKeyDown(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        handleSaveRef.current?.();
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // Warn before leaving with unsaved changes
  useEffect(() => {
    if (!dirty) return;
    function onBeforeUnload(e) { e.preventDefault(); e.returnValue = ''; }
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [dirty]);

  function toggle(id) {
    setOpen((prev) => (prev === id ? null : id));
  }

  function toggleSection(key) {
    change(`SECTIONS.${key}`, contentRef.current.SECTIONS[key] === false);
  }

  if (error && !content) return <p className="admin-loading">{error}</p>;
  if (!content) return <p className="admin-loading">Loading content…</p>;

  const c = content;

  return (
    <div className={`admin-split${sidebarOpen ? "" : " admin-split--collapsed"}`}>
      {/* ── LEFT SIDEBAR ─────────────────────────────────── */}
      <aside className="admin-split__sidebar">
        <div className="admin-tabs">
          <button
            type="button"
            className={`admin-tab${activeTab === "content" ? " admin-tab--active" : ""}`}
            onClick={() => setActiveTab("content")}
          >
            Content
          </button>
          <button
            type="button"
            className={`admin-tab${activeTab === "leads" ? " admin-tab--active" : ""}`}
            onClick={() => setActiveTab("leads")}
          >
            Leads
          </button>
          <button
            type="button"
            className={`admin-tab${activeTab === "visitors" ? " admin-tab--active" : ""}`}
            onClick={() => setActiveTab("visitors")}
          >
            Visitors
          </button>
        </div>
        <div style={{ display: activeTab === "leads" ? "block" : "none" }}><LeadsTab /></div>
        <div style={{ display: activeTab === "visitors" ? "block" : "none" }}><VisitorsTab /></div>
        {activeTab === "content" && (
        <><div className="admin-save-bar">
          <div className="admin-save-bar__actions">
            <button
              type="button"
              className="admin-btn admin-btn--primary"
              onClick={handleSave}
              disabled={status === "saving"}
              title="Publish live (⌘S / Ctrl+S)"
            >
              {status === "saving" ? "Publishing…" : "Publish Live"}
            </button>
            <button
              type="button"
              className="admin-btn admin-btn--ghost admin-btn--sm"
              onClick={handleReset}
              title="Reload saved content and reset preview"
            >
              Reset to Saved
            </button>
          </div>

          {status === "saved" && (
            <p className="admin-save-msg admin-save-msg--ok">
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                aria-hidden="true"
              >
                <path d="M20 6L9 17l-5-5" />
              </svg>
              Published — live in ~60s
            </p>
          )}
          {status === "pristine" && (
            <p className="admin-save-msg admin-save-msg--info">
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              Nothing to publish — no changes made
            </p>
          )}
          {status === "error" && (
            <p className="admin-save-msg admin-save-msg--fail">
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                aria-hidden="true"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
              {error}
            </p>
          )}
        </div>

        {/* 1 — Business Info */}
        <Section
          label="Business Info"
          id="site"
          open={open === "site"}
          onToggle={() => toggle("site")}
        >
          <div className="admin-field__row">
            <FieldRow
              label="Business Name"
              value={c.SITE.name}
              onChange={(v) => change("SITE.name", v)}
            />
            <FieldRow
              label="Tagline"
              value={c.SITE.tagline}
              onChange={(v) => change("SITE.tagline", v)}
            />
          </div>
          <div className="admin-field__row">
            <FieldRow
              label="Phone (display)"
              type="tel"
              value={c.SITE.phone}
              onChange={(v) => change("SITE.phone", v)}
            />
            <FieldRow
              label="Phone href"
              type="tel"
              value={c.SITE.phoneHref}
              onChange={(v) => change("SITE.phoneHref", v)}
              hint="tel:+13105550192"
            />
          </div>
          <div className="admin-field__row">
            <FieldRow
              label="Email"
              type="email"
              value={c.SITE.email}
              onChange={(v) => change("SITE.email", v)}
            />
            <FieldRow
              label="Hours"
              value={c.SITE.hours}
              onChange={(v) => change("SITE.hours", v)}
            />
          </div>
          <div className="admin-field__row">
            <FieldRow label="City" value={c.SITE.city} onChange={(v) => change("SITE.city", v)} />
            <FieldRow
              label="Service Area"
              value={c.SITE.serviceArea}
              onChange={(v) => change("SITE.serviceArea", v)}
            />
          </div>
          <FieldRow
            label="Instagram URL"
            type="url"
            value={c.SITE.instagram}
            onChange={(v) => change("SITE.instagram", v)}
          />
          <div className="admin-field__row">
            <FieldRow
              label="TikTok URL"
              type="url"
              value={c.SITE.tiktok}
              onChange={(v) => change("SITE.tiktok", v)}
            />
            <FieldRow
              label="Pinterest URL"
              type="url"
              value={c.SITE.pinterest}
              onChange={(v) => change("SITE.pinterest", v)}
            />
          </div>
          <div className="admin-field__row">
            <FieldRow
              label="Facebook URL"
              type="url"
              value={c.SITE.facebook ?? ""}
              onChange={(v) => change("SITE.facebook", v)}
            />
            <FieldRow
              label="YouTube URL"
              type="url"
              value={c.SITE.youtube ?? ""}
              onChange={(v) => change("SITE.youtube", v)}
            />
          </div>
          <p className="admin-field__hint-block">Leave a social URL empty to hide its icon in the footer.</p>
          <div className="admin-field">
            <span className="admin-field__label">Site URL</span>
            <span className="admin-field__readonly">Set via <code>NEXT_PUBLIC_SITE_URL</code> env var</span>
          </div>
        </Section>

        {/* 2 — Hero */}
        <Section
          label="Hero Section"
          id="hero"
          open={open === "hero"}
          onToggle={() => toggle("hero")}
        >
          <FieldRow
            label="Eyebrow"
            value={c.HERO.eyebrow}
            onChange={(v) => change("HERO.eyebrow", v)}
          />
          <div className="admin-field__row">
            <FieldRow
              label="Headline (plain part)"
              value={c.HERO.headline}
              onChange={(v) => change("HERO.headline", v)}
            />
            <FieldRow
              label="Headline emphasis (italic)"
              value={c.HERO.headlineEm}
              onChange={(v) => change("HERO.headlineEm", v)}
              hint="Renders in italic"
            />
          </div>
          <FieldRow
            label="Sub-headline"
            type="textarea"
            rows={2}
            value={c.HERO.sub}
            onChange={(v) => change("HERO.sub", v)}
          />
          <div className="admin-field__row">
            <FieldRow
              label="Primary CTA label"
              value={c.HERO.ctaPrimary}
              onChange={(v) => change("HERO.ctaPrimary", v)}
            />
            <FieldRow
              label="Secondary CTA label"
              value={c.HERO.ctaSecondary}
              onChange={(v) => change("HERO.ctaSecondary", v)}
            />
          </div>
          <p className="admin-section__group-label">Proof Bar (3 stats)</p>
          {c.HERO.proof.map((p, i) => (
            <div key={i} className="admin-field__row">
              <FieldRow
                label={`Stat ${i + 1} — Value`}
                value={p.value}
                onChange={(v) => {
                  const arr = [...c.HERO.proof];
                  arr[i] = { ...arr[i], value: v };
                  change("HERO.proof", arr);
                }}
              />
              <FieldRow
                label={`Stat ${i + 1} — Label`}
                value={p.label}
                onChange={(v) => {
                  const arr = [...c.HERO.proof];
                  arr[i] = { ...arr[i], label: v };
                  change("HERO.proof", arr);
                }}
              />
            </div>
          ))}
        </Section>

        {/* 3 — Trust Bar */}
        <Section
          label="Trust Bar"
          id="trust"
          open={open === "trust"}
          onToggle={() => toggle("trust")}
          visible={c.SECTIONS.trust}
          onToggleVisible={() => toggleSection("trust")}
        >
          {c.TRUST_ITEMS.map((t, i) => (
            <div key={i} className="admin-field__row">
              <FieldRow
                label={`Item ${i + 1} — Value`}
                value={t.value}
                onChange={(v) => arrChange("TRUST_ITEMS", i, "value", v)}
              />
              <FieldRow
                label={`Item ${i + 1} — Label`}
                value={t.label}
                onChange={(v) => arrChange("TRUST_ITEMS", i, "label", v)}
              />
            </div>
          ))}
        </Section>

        {/* 4 — Services */}
        <Section
          label="Services"
          id="services"
          open={open === "services"}
          onToggle={() => toggle("services")}
          visible={c.SECTIONS.services}
          onToggleVisible={() => toggleSection("services")}
        >
          <ArrayEditor
            items={c.SERVICES}
            onAdd={() => arrAdd("SERVICES", BLANK_SERVICE)}
            onRemove={(i) => arrRemove("SERVICES", i)}
            getLabel={(svc, i) => svc.title || `Service ${i + 1}`}
            addLabel="Add Service"
            renderItem={(svc, i) => (
              <>
                <div className="admin-field__row">
                  <FieldRow
                    label="Title"
                    value={svc.title}
                    onChange={(v) => arrChange("SERVICES", i, "title", v)}
                  />
                  <FieldRow
                    label="Tag / Badge"
                    value={svc.tag}
                    onChange={(v) => arrChange("SERVICES", i, "tag", v)}
                  />
                </div>
                <div className="admin-field__row">
                  <FieldRow
                    label="Price"
                    value={svc.price}
                    onChange={(v) => arrChange("SERVICES", i, "price", v)}
                  />
                  <FieldRow
                    label="Duration"
                    value={svc.duration}
                    onChange={(v) => arrChange("SERVICES", i, "duration", v)}
                  />
                </div>
                <FieldRow
                  label="Description"
                  type="textarea"
                  rows={3}
                  value={svc.description}
                  onChange={(v) => arrChange("SERVICES", i, "description", v)}
                />
                <FieldRow
                  label="CTA Button Text"
                  value={svc.ctaText}
                  onChange={(v) => arrChange("SERVICES", i, "ctaText", v)}
                />
                <p className="admin-section__group-label">Photo</p>
                <FieldRow
                  label="Image Path"
                  value={svc.photoSrc}
                  onChange={(v) => arrChange("SERVICES", i, "photoSrc", v)}
                  hint="/images/bridal.webp"
                />
                <FieldRow
                  label="Image Alt Text"
                  value={svc.photoAlt}
                  onChange={(v) => arrChange("SERVICES", i, "photoAlt", v)}
                />
                <div className="admin-field__row">
                  <FieldRow
                    label="Overlay Label"
                    value={svc.photoLabel}
                    onChange={(v) => arrChange("SERVICES", i, "photoLabel", v)}
                  />
                  <FieldRow
                    label="CSS Gradient (fallback)"
                    value={svc.photoGradient}
                    onChange={(v) => arrChange("SERVICES", i, "photoGradient", v)}
                  />
                </div>
              </>
            )}
          />
        </Section>

        {/* 5 — Gallery */}
        <Section
          label="Gallery"
          id="gallery"
          open={open === "gallery"}
          onToggle={() => toggle("gallery")}
          visible={c.SECTIONS.gallery}
          onToggleVisible={() => toggleSection("gallery")}
        >
          <ArrayEditor
            items={c.GALLERY_ITEMS}
            onAdd={() => arrAdd("GALLERY_ITEMS", BLANK_GALLERY)}
            onRemove={(i) => arrRemove("GALLERY_ITEMS", i)}
            getLabel={(item, i) => item.label || `Photo ${i + 1}`}
            addLabel="Add Photo"
            renderItem={(item, i) => (
              <>
                <FieldRow
                  label="Caption / Label"
                  value={item.label}
                  onChange={(v) => arrChange("GALLERY_ITEMS", i, "label", v)}
                />
                <FieldRow
                  label="Image Path"
                  value={item.src}
                  onChange={(v) => arrChange("GALLERY_ITEMS", i, "src", v)}
                  hint="/images/gallery-1.webp"
                />
                <FieldRow
                  label="Alt Text"
                  value={item.alt}
                  onChange={(v) => arrChange("GALLERY_ITEMS", i, "alt", v)}
                />
                <div className="admin-checkbox-row">
                  <FieldRow
                    label="Hidden on desktop"
                    type="checkbox"
                    value={item.hidden}
                    onChange={(v) => arrChange("GALLERY_ITEMS", i, "hidden", v)}
                  />
                  <FieldRow
                    label="Mobile only"
                    type="checkbox"
                    value={item.mobileOnly}
                    onChange={(v) => arrChange("GALLERY_ITEMS", i, "mobileOnly", v)}
                  />
                </div>
              </>
            )}
          />
        </Section>

        {/* 6 — Reviews */}
        <Section
          label="Reviews"
          id="reviews"
          open={open === "reviews"}
          onToggle={() => toggle("reviews")}
          visible={c.SECTIONS.reviews}
          onToggleVisible={() => toggleSection("reviews")}
        >
          {hasGoogleReviews && (
            <>
              <div className="admin-sync-bar">
                <div className="admin-sync-bar__info">
                  <strong>Google Reviews</strong>
                  <span>Pulls your latest reviews directly from Google</span>
                </div>
                <button
                  type="button"
                  className="admin-btn admin-btn--ghost admin-btn--sm"
                  onClick={handleGoogleSync}
                  disabled={syncStatus === "syncing"}
                >
                  {syncStatus === "syncing" ? "Syncing…" : "Sync from Google"}
                </button>
              </div>
              {syncStatus === "synced" && (
                <p className="admin-save-msg admin-save-msg--ok" style={{ marginBottom: 16 }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><path d="M20 6L9 17l-5-5" /></svg>
                  Reviews synced from Google — publish to go live
                </p>
              )}
              {syncStatus === "error" && (
                <p className="admin-save-msg admin-save-msg--fail" style={{ marginBottom: 16 }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><path d="M18 6L6 18M6 6l12 12" /></svg>
                  {syncError}
                </p>
              )}
            </>
          )}
          <ArrayEditor
            items={c.REVIEWS}
            onAdd={() => arrAdd("REVIEWS", BLANK_REVIEW)}
            onRemove={(i) => arrRemove("REVIEWS", i)}
            getLabel={(r, i) => r.name || `Review ${i + 1}`}
            addLabel="Add Review"
            renderItem={(r, i) => (
              <>
                <div className="admin-field__row">
                  <FieldRow
                    label="Name"
                    value={r.name}
                    onChange={(v) => arrChange("REVIEWS", i, "name", v)}
                  />
                  <FieldRow
                    label="Role / Location"
                    value={r.role}
                    onChange={(v) => arrChange("REVIEWS", i, "role", v)}
                  />
                </div>
                <div className="admin-field__row">
                  {hasGoogleReviews && (
                    <div className="admin-field">
                      <span className="admin-field__label">Stars</span>
                      <div className="admin-star-rating">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <button
                            key={n}
                            type="button"
                            className={`admin-star${n <= r.stars ? " admin-star--on" : ""}`}
                            onClick={() => arrChange("REVIEWS", i, "stars", n)}
                            aria-label={`${n} star${n !== 1 ? "s" : ""}`}
                          >
                            ★
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  <FieldRow
                    label="Avatar Letter"
                    value={r.initial}
                    onChange={(v) => arrChange("REVIEWS", i, "initial", v)}
                    hint="Single letter, e.g. S"
                  />
                </div>
                <FieldRow
                  label="Review Text"
                  type="textarea"
                  rows={4}
                  value={r.body}
                  onChange={(v) => arrChange("REVIEWS", i, "body", v)}
                />
              </>
            )}
          />
        </Section>

        {/* 7 — About */}
        <Section
          label="About Me"
          id="about"
          open={open === "about"}
          onToggle={() => toggle("about")}
          visible={c.SECTIONS.about}
          onToggleVisible={() => toggleSection("about")}
        >
          <FieldRow
            label="Eyebrow"
            value={c.ABOUT.eyebrow}
            onChange={(v) => change("ABOUT.eyebrow", v)}
          />
          <div className="admin-field__row">
            <FieldRow
              label="Headline (plain)"
              value={c.ABOUT.headline}
              onChange={(v) => change("ABOUT.headline", v)}
            />
            <FieldRow
              label="Headline emphasis"
              value={c.ABOUT.headlineEm}
              onChange={(v) => change("ABOUT.headlineEm", v)}
            />
          </div>
          <FieldRow
            label="Bio Paragraph 1"
            type="textarea"
            rows={4}
            value={c.ABOUT.bio[0]}
            onChange={(v) => {
              const b = [...c.ABOUT.bio];
              b[0] = v;
              change("ABOUT.bio", b);
            }}
          />
          <FieldRow
            label="Bio Paragraph 2"
            type="textarea"
            rows={4}
            value={c.ABOUT.bio[1]}
            onChange={(v) => {
              const b = [...c.ABOUT.bio];
              b[1] = v;
              change("ABOUT.bio", b);
            }}
          />
          <p className="admin-section__group-label">Credentials (4 bullet points)</p>
          {c.ABOUT.credentials.map((cred, idx) => (
            <FieldRow
              key={idx}
              label={`Credential ${idx + 1}`}
              value={cred}
              onChange={(v) => {
                const arr = [...c.ABOUT.credentials];
                arr[idx] = v;
                change("ABOUT.credentials", arr);
              }}
            />
          ))}
          <p className="admin-section__group-label">Credential Badge</p>
          <div className="admin-field__row">
            <FieldRow
              label="Badge Title"
              value={c.ABOUT.credential.title}
              onChange={(v) => change("ABOUT.credential.title", v)}
            />
            <FieldRow
              label="Badge Subtitle"
              value={c.ABOUT.credential.subtitle}
              onChange={(v) => change("ABOUT.credential.subtitle", v)}
            />
          </div>
          <div className="admin-field__row">
            <FieldRow
              label="Photo Alt Text"
              value={c.ABOUT.photoAlt}
              onChange={(v) => change("ABOUT.photoAlt", v)}
            />
            <FieldRow
              label="CTA Label"
              value={c.ABOUT.cta}
              onChange={(v) => change("ABOUT.cta", v)}
            />
          </div>
        </Section>

        {/* 8 — Process */}
        <Section
          label="Booking Process"
          id="process"
          open={open === "process"}
          onToggle={() => toggle("process")}
          visible={c.SECTIONS.process}
          onToggleVisible={() => toggleSection("process")}
        >
          {c.PROCESS_STEPS.map((step, i) => (
            <div key={i}>
              {i > 0 && <hr className="admin-section__divider" />}
              <p className="admin-section__group-label">Step {step.num}</p>
              <div className="admin-field__row">
                <FieldRow
                  label="Number label"
                  value={step.num}
                  onChange={(v) => {
                    const s = [...c.PROCESS_STEPS];
                    s[i] = { ...s[i], num: v };
                    change("PROCESS_STEPS", s);
                  }}
                  hint="e.g. 01"
                />
                <FieldRow
                  label="Sub-label"
                  value={step.label}
                  onChange={(v) => {
                    const s = [...c.PROCESS_STEPS];
                    s[i] = { ...s[i], label: v };
                    change("PROCESS_STEPS", s);
                  }}
                  hint="e.g. Step one"
                />
              </div>
              <FieldRow
                label="Title"
                value={step.title}
                onChange={(v) => {
                  const s = [...c.PROCESS_STEPS];
                  s[i] = { ...s[i], title: v };
                  change("PROCESS_STEPS", s);
                }}
              />
              <FieldRow
                label="Body"
                type="textarea"
                rows={3}
                value={step.body}
                onChange={(v) => {
                  const s = [...c.PROCESS_STEPS];
                  s[i] = { ...s[i], body: v };
                  change("PROCESS_STEPS", s);
                }}
              />
            </div>
          ))}
        </Section>

        {/* 9 — FAQ */}
        <Section
          label="FAQ"
          id="faq"
          open={open === "faq"}
          onToggle={() => toggle("faq")}
          visible={c.SECTIONS.faq}
          onToggleVisible={() => toggleSection("faq")}
        >
          <ArrayEditor
            items={c.FAQ_ITEMS}
            onAdd={() => arrAdd("FAQ_ITEMS", BLANK_FAQ)}
            onRemove={(i) => arrRemove("FAQ_ITEMS", i)}
            getLabel={(item, i) => item.q || `Question ${i + 1}`}
            addLabel="Add Question"
            renderItem={(item, i) => (
              <>
                <FieldRow
                  label="Question"
                  value={item.q}
                  onChange={(v) => arrChange("FAQ_ITEMS", i, "q", v)}
                />
                <FieldRow
                  label="Answer"
                  type="textarea"
                  rows={3}
                  value={item.a}
                  onChange={(v) => arrChange("FAQ_ITEMS", i, "a", v)}
                />
              </>
            )}
          />
        </Section>

        {/* 10 — Book Me (final CTA content; the form itself is not editable) */}
        <Section
          label="Book Me"
          id="cta"
          open={open === "cta"}
          onToggle={() => toggle("cta")}
          visible={c.SECTIONS.finalCta}
          onToggleVisible={() => toggleSection("finalCta")}
        >
          <FieldRow
            label="Eyebrow"
            value={c.FINAL_CTA.eyebrow}
            onChange={(v) => change("FINAL_CTA.eyebrow", v)}
          />
          <div className="admin-field__row">
            <FieldRow
              label="Headline (plain)"
              value={c.FINAL_CTA.headline}
              onChange={(v) => change("FINAL_CTA.headline", v)}
            />
            <FieldRow
              label="Headline emphasis"
              value={c.FINAL_CTA.headlineEm}
              onChange={(v) => change("FINAL_CTA.headlineEm", v)}
            />
          </div>
          <FieldRow
            label="Body paragraph"
            type="textarea"
            rows={2}
            value={c.FINAL_CTA.body}
            onChange={(v) => change("FINAL_CTA.body", v)}
          />
          <p className="admin-section__group-label">Trust Points</p>
          <ArrayEditor
            items={c.FINAL_CTA.trustPoints}
            onAdd={() => change("FINAL_CTA.trustPoints", [...c.FINAL_CTA.trustPoints, ""])}
            onRemove={(i) =>
              change("FINAL_CTA.trustPoints", c.FINAL_CTA.trustPoints.filter((_, idx) => idx !== i))
            }
            getLabel={(pt, i) => pt || `Point ${i + 1}`}
            addLabel="Add Trust Point"
            renderItem={(pt, i) => (
              <FieldRow
                label={`Trust Point ${i + 1}`}
                value={pt}
                onChange={(v) => {
                  const arr = [...c.FINAL_CTA.trustPoints];
                  arr[i] = v;
                  change("FINAL_CTA.trustPoints", arr);
                }}
              />
            )}
          />
        </Section>

        {/* 11 — Footer */}
        <Section label="Footer" id="footer" open={open === "footer"} onToggle={() => toggle("footer")}>
          <FieldRow
            label="Brand Subtitle"
            value={c.FOOTER.brandLine}
            onChange={(v) => change("FOOTER.brandLine", v)}
            hint='Shown under the business name, e.g. "Makeup Artist"'
          />
          {c.FOOTER.cols.map((col, ci) => (
            <div key={ci}>
              <p className="admin-section__group-label">{col.heading || `Column ${ci + 1}`}</p>
              <FieldRow
                label="Column Heading"
                value={col.heading}
                onChange={(v) => footerColChange(ci, 'heading', v)}
              />
              <ArrayEditor
                items={col.links}
                onAdd={() => footerLinkAdd(ci)}
                onRemove={(li) => footerLinkRemove(ci, li)}
                getLabel={(link, li) => link.label || `Link ${li + 1}`}
                addLabel="Add Link"
                renderItem={(link, li) => (
                  <>
                    <FieldRow
                      label="Label"
                      value={link.label}
                      onChange={(v) => footerLinkChange(ci, li, 'label', v)}
                    />
                    <div className="admin-field">
                      <span className="admin-field__label">Link Target</span>
                      <HrefField
                        value={link.href}
                        onChange={(href) => {
                          footerLinkChange(ci, li, 'href', href);
                          const isExt = !href.startsWith('#') && !href.startsWith('tel:') && !href.startsWith('mailto:');
                          footerLinkChange(ci, li, 'external', isExt);
                        }}
                      />
                    </div>
                  </>
                )}
              />
            </div>
          ))}
        </Section>
        </>)}
      </aside>

      {/* ── RIGHT PREVIEW ────────────────────────────────── */}
      <div className="admin-split__preview">
        <div className="admin-split__preview-bar">
          <button
            type="button"
            className="admin-panel-toggle"
            onClick={() => setSidebarOpen((s) => !s)}
            title={sidebarOpen ? "Close editor panel" : "Open editor panel"}
            aria-label={sidebarOpen ? "Close editor panel" : "Open editor panel"}
            aria-pressed={sidebarOpen}
          >
            <PanelIcon open={sidebarOpen} />
          </button>
          <span className="admin-split__preview-label">Live Preview</span>
          <div className="admin-vp-toggle">
            <button
              type="button"
              className={`admin-vp-btn${viewport === 'desktop' ? ' admin-vp-btn--on' : ''}`}
              onClick={() => setViewport('desktop')}
              title="Desktop view"
              aria-label="Desktop view"
              aria-pressed={viewport === 'desktop'}
            >
              <DesktopIcon />
            </button>
            <button
              type="button"
              className={`admin-vp-btn${viewport === 'mobile' ? ' admin-vp-btn--on' : ''}`}
              onClick={() => setViewport('mobile')}
              title="Mobile view"
              aria-label="Mobile view"
              aria-pressed={viewport === 'mobile'}
            >
              <MobileIcon />
            </button>
          </div>
        </div>
        <div className={`admin-split__iframe-wrap${viewport === 'mobile' ? ' admin-split__iframe-wrap--mobile' : ''}`}>
          <iframe ref={iframeRef} src="/?preview=1" title="Site Preview" className="admin-split__iframe" />
        </div>
      </div>
    </div>
  );
}

'use client';
import React, { useEffect, useState, useMemo } from 'react';

const PER_PAGE = 15;

function fmtDuration(secs) {
  if (secs == null) return null;
  if (secs < 60) return `${secs}s`;
  return `${Math.floor(secs / 60)}m ${secs % 60}s`;
}

function fmtDate(d) {
  return new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function fmtSource(v) {
  if (!v.utm_source && !v.referrer) return 'direct';
  if (v.utm_source) return v.utm_source;
  try { return new URL(v.referrer).hostname.replace('www.', ''); }
  catch { return v.referrer || 'direct'; }
}

function applyDateFilter(v, filterDate) {
  if (filterDate === 'all') return true;
  const age = Date.now() - new Date(v.enteredAt).getTime();
  if (filterDate === 'today') return age < 86_400_000;
  if (filterDate === '7d')    return age < 7 * 86_400_000;
  if (filterDate === '30d')   return age < 30 * 86_400_000;
  return true;
}

function DeviceIcon({ device }) {
  if (device === 'mobile') return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="5" y="2" width="14" height="20" rx="2"/><circle cx="12" cy="17" r="1" fill="currentColor" stroke="none"/>
    </svg>
  );
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>
    </svg>
  );
}

export default function VisitorsTab() {
  const [visitors, setVisitors]         = useState(null);
  const [error, setError]               = useState('');
  const [expanded, setExpanded]         = useState(null);
  const [filterDevice,  setFilterDevice]  = useState('all');
  const [filterSource,  setFilterSource]  = useState('all');
  const [filterSection, setFilterSection] = useState('all');
  const [filterDate,    setFilterDate]    = useState('all');
  const [groupBy, setGroupBy]           = useState('none');
  const [page, setPage]                 = useState(1);

  useEffect(() => {
    fetch('/api/admin/visitors')
      .then(r => r.json())
      .then(d => { if (d.ok) setVisitors(d.visitors); else setError('Failed to load visitors.'); })
      .catch(() => setError('Failed to load visitors.'));
  }, []);

  useEffect(() => { setPage(1); setExpanded(null); }, [filterDevice, filterSource, filterSection, filterDate, groupBy]);

  const sources  = useMemo(() => visitors ? [...new Set(visitors.map(fmtSource))].sort() : [], [visitors]);
  const sections = useMemo(() => visitors ? [...new Set(visitors.map(v => v.exitSection).filter(Boolean))].sort() : [], [visitors]);

  const filtered = useMemo(() => {
    if (!visitors) return [];
    return visitors.filter(v =>
      (filterDevice  === 'all' || v.device === filterDevice) &&
      (filterSource  === 'all' || fmtSource(v) === filterSource) &&
      (filterSection === 'all' || v.exitSection === filterSection) &&
      applyDateFilter(v, filterDate)
    );
  }, [visitors, filterDevice, filterSource, filterSection, filterDate]);

  const grouped = useMemo(() => {
    if (groupBy === 'none') return null;
    const map = {};
    for (const v of filtered) {
      const key =
        groupBy === 'device'  ? (v.device || 'unknown') :
        groupBy === 'source'  ? fmtSource(v) :
        (v.exitSection || 'unknown');
      if (!map[key]) map[key] = { key, count: 0, durTotal: 0, durCount: 0 };
      map[key].count++;
      if (v.duration != null) { map[key].durTotal += v.duration; map[key].durCount++; }
    }
    return Object.values(map).sort((a, b) => b.count - a.count);
  }, [filtered, groupBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated  = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  if (error)     return <p className="leads-tab__error">{error}</p>;
  if (!visitors) return <p className="leads-tab__loading">Loading visitors…</p>;

  return (
    <div className="vt">

      {/* ── FILTERS ── */}
      <div className="vt-filters">
        <div className="vt-filters__row">
          {[
            { value: filterDate,    set: setFilterDate,    opts: [['all','All time'],['today','Today'],['7d','7 days'],['30d','30 days']] },
            { value: filterDevice,  set: setFilterDevice,  opts: [['all','All devices'],['mobile','Mobile'],['desktop','Desktop']] },
          ].map(({ value, set, opts }) => (
            <select key={opts[0][1]} className="vt-select" value={value} onChange={e => set(e.target.value)}>
              {opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          ))}
        </div>
        <div className="vt-filters__row">
          <select className="vt-select vt-select--grow" value={filterSource} onChange={e => setFilterSource(e.target.value)}>
            <option value="all">All sources</option>
            {sources.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select className="vt-select vt-select--grow" value={filterSection} onChange={e => setFilterSection(e.target.value)}>
            <option value="all">All sections</option>
            {sections.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="vt-filters__row vt-filters__row--between">
          <span className="vt-count">
            {filtered.length} session{filtered.length !== 1 ? 's' : ''}
            {filtered.length !== visitors.length && <em> of {visitors.length}</em>}
          </span>
          <select className="vt-select vt-select--accent" value={groupBy} onChange={e => setGroupBy(e.target.value)}>
            <option value="none">No grouping</option>
            <option value="device">By device</option>
            <option value="source">By source</option>
            <option value="section">By exit section</option>
          </select>
        </div>
      </div>

      {/* ── GROUPED TABLE ── */}
      {grouped ? (
        <div className="vt-scroll">
          <table className="vt-table">
            <thead>
              <tr>
                <th>{groupBy === 'device' ? 'Device' : groupBy === 'source' ? 'Source' : 'Exit Section'}</th>
                <th>Sessions</th>
                <th>Avg time</th>
              </tr>
            </thead>
            <tbody>
              {grouped.map(g => (
                <tr key={g.key}>
                  <td>{g.key}</td>
                  <td>{g.count}</td>
                  <td>{g.durCount > 0 ? fmtDuration(Math.round(g.durTotal / g.durCount)) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : filtered.length === 0 ? (
        <p className="leads-tab__empty">No sessions match these filters.</p>
      ) : (

      /* ── SESSION CARDS ── */
      <>
        <ul className="vt-cards">
          {paginated.map(v => {
            const id = String(v._id);
            const isOpen = expanded === id;
            const dur = fmtDuration(v.duration);
            const src = fmtSource(v);
            return (
              <li key={id} className={`vt-card${isOpen ? ' vt-card--open' : ''}`}>
                <div className="vt-card__main" onClick={() => v.clicks?.length && setExpanded(isOpen ? null : id)}>
                  <div className="vt-card__top">
                    <span className="vt-card__date">{fmtDate(v.enteredAt)}</span>
                    <span className="vt-card__meta">
                      {v.device && <><DeviceIcon device={v.device} />{v.device}</>}
                      {dur && <span className="vt-card__dur">{dur}</span>}
                    </span>
                  </div>
                  <div className="vt-card__bottom">
                    <span className="vt-card__tag vt-card__tag--source">{src}</span>
                    {v.exitSection && <span className="vt-card__tag vt-card__tag--section">left: {v.exitSection}</span>}
                    {v.clicks?.length > 0 && (
                      <button type="button" className={`vt-card__expand${isOpen ? ' vt-card__expand--open' : ''}`}>
                        {v.clicks.length} click{v.clicks.length !== 1 ? 's' : ''} {isOpen ? '▲' : '▼'}
                      </button>
                    )}
                  </div>
                </div>
                {isOpen && (
                  <ul className="vt-clicks">
                    {v.clicks.map((c, i) => (
                      <li key={i} className="vt-clicks__item">
                        <span className="vt-clicks__section">{c.section}</span>
                        <span className="vt-clicks__label">{c.label}</span>
                        <span className="vt-clicks__ts">+{c.ts}s</span>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>

        {totalPages > 1 && (
          <div className="vt-pagination">
            <button className="vt-page-btn" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>← Prev</button>
            <span className="vt-page-info">{page} / {totalPages}</span>
            <button className="vt-page-btn" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next →</button>
          </div>
        )}
      </>
      )}
    </div>
  );
}

'use client';
import { useEffect, useState } from 'react';

function fmt(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString([], { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function LeadCard({ lead, open, onToggle }) {
  const id = String(lead._id);
  const replySubject = encodeURIComponent('Re: Your inquiry — Sofia Artistry');
  const replyBody = encodeURIComponent(`Hi ${lead.name},\n\nThank you for reaching out!\n\n---\nYour message:\n${lead.message || ''}`);
  const mailto = `mailto:${lead.email}?subject=${replySubject}&body=${replyBody}`;

  return (
    <div className={`leads-card${open ? ' leads-card--open' : ''}`}>
      <button className="leads-card__header" onClick={onToggle} aria-expanded={open}>
        <span className="leads-card__name">{lead.name}</span>
        <span className="leads-card__meta">
          {new Date(lead.createdAt).toLocaleDateString()} · {lead.phone || lead.email || '—'}
        </span>
        <svg className="leads-card__chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div className="leads-card__body">
          <dl className="leads-card__fields">
            <div><dt>Phone</dt><dd>{lead.phone ? <a href={`tel:${lead.phone}`}>{lead.phone}</a> : '—'}</dd></div>
            <div><dt>Email</dt><dd>{lead.email || '—'}</dd></div>
            <div><dt>Service</dt><dd>{lead.service || '—'}</dd></div>
            <div><dt>Event date</dt><dd>{lead.date || '—'}</dd></div>
            <div><dt>Source</dt><dd>{lead.source || '—'}</dd></div>
            <div><dt>Submitted</dt><dd>{fmt(lead.createdAt)}</dd></div>
          </dl>
          {lead.message && (
            <div className="leads-card__message">
              <p className="leads-card__message-label">Message</p>
              <p>{lead.message}</p>
            </div>
          )}
          {lead.email && (
            <a href={mailto} className="leads-card__reply" target="_blank" rel="noopener noreferrer">
              Reply by email
            </a>
          )}
        </div>
      )}
    </div>
  );
}

export default function LeadsTab() {
  const [leads, setLeads] = useState(null);
  const [error, setError] = useState('');
  const [openId, setOpenId] = useState(null);

  useEffect(() => {
    fetch('/api/admin/leads')
      .then((r) => r.json())
      .then((d) => { if (d.ok) setLeads(d.leads); else setError('Failed to load leads.'); })
      .catch(() => setError('Failed to load leads.'));
  }, []);

  if (error) return <p className="leads-tab__error">{error}</p>;
  if (!leads) return <p className="leads-tab__loading">Loading leads…</p>;
  if (leads.length === 0) return <p className="leads-tab__empty">No leads yet.</p>;

  function toggle(id) {
    setOpenId((prev) => (prev === id ? null : id));
  }

  return (
    <div className="leads-tab">
      <p className="leads-tab__count">{leads.length} lead{leads.length !== 1 ? 's' : ''}</p>
      <div className="leads-list">
        {leads.map((l) => {
          const id = String(l._id);
          return <LeadCard key={id} lead={l} open={openId === id} onToggle={() => toggle(id)} />;
        })}
      </div>
    </div>
  );
}

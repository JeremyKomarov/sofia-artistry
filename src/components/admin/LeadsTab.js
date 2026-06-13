'use client';
import { useEffect, useState } from 'react';

export default function LeadsTab() {
  const [leads, setLeads] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/leads')
      .then((r) => r.json())
      .then((d) => {
        if (d.ok) setLeads(d.leads);
        else setError('Failed to load leads.');
      })
      .catch(() => setError('Failed to load leads.'));
  }, []);

  if (error) return <p className="leads-tab__error">{error}</p>;
  if (!leads) return <p className="leads-tab__loading">Loading leads…</p>;
  if (leads.length === 0) return <p className="leads-tab__empty">No leads yet.</p>;

  return (
    <div className="leads-tab">
      <p className="leads-tab__count">{leads.length} lead{leads.length !== 1 ? 's' : ''}</p>
      <table className="leads-tab__table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Name</th>
            <th>Phone</th>
            <th>Email</th>
            <th>Message</th>
            <th>Source</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((l) => (
            <tr key={String(l._id)}>
              <td>{new Date(l.createdAt).toLocaleDateString()}</td>
              <td>{l.name}</td>
              <td>{l.phone || '—'}</td>
              <td>{l.email || '—'}</td>
              <td className="leads-tab__msg">{l.message || '—'}</td>
              <td>{l.source || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

'use client';
import { useEffect, useState } from 'react';

function fmt(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function SitesTab() {
  const [customers, setCustomers] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/websites')
      .then((r) => r.json())
      .then((d) => { if (d.ok) setCustomers(d.websites); else setError('Failed to load sites.'); })
      .catch(() => setError('Failed to load sites.'));
  }, []);

  if (error)      return <p className="leads-tab__error">{error}</p>;
  if (!customers) return <p className="leads-tab__loading">Loading sites…</p>;
  if (customers.length === 0) return <p className="leads-tab__empty">No sites registered yet.</p>;

  return (
    <div className="sites-tab">
      <p className="leads-tab__count">{customers.length} site{customers.length !== 1 ? 's' : ''}</p>
      <table className="sites-table">
        <thead>
          <tr>
            <th>Client</th>
            <th>Slug</th>
            <th>Admin Email</th>
            <th>Plan</th>
            <th>Added</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((c) => (
            <tr key={c.slug}>
              <td>
                <strong>{c.name}</strong>
                {c.url && (
                  <a href={c.url} target="_blank" rel="noopener noreferrer" className="sites-table__url">
                    {c.url.replace(/^https?:\/\//, '')}
                  </a>
                )}
              </td>
              <td><code>{c.slug}</code></td>
              <td>{c.adminEmail || '—'}</td>
              <td><span className={`sites-tag sites-tag--${c.plan || 'standard'}`}>{c.plan || 'standard'}</span></td>
              <td>{fmt(c.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

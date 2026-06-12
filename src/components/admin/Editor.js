'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import FieldRow from './FieldRow';
import ArrayEditor from './ArrayEditor';

function setNestedValue(obj, path, value) {
  const segments = path.replace(/\[(\d+)\]/g, '.$1').split('.');
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

function Section({ label, id, open, onToggle, children }) {
  return (
    <div className={`admin-section${open ? ' admin-section--open' : ''}`}>
      <button type="button" className="admin-section__header" onClick={onToggle} aria-expanded={open}>
        {label}
        <span className="admin-section__chevron">▼</span>
      </button>
      <div className="admin-section__body">{children}</div>
    </div>
  );
}

const BLANK_SERVICE = { tag: '', title: '', photoLabel: '', photoGradient: '', photoSrc: '', photoAlt: '', description: '', price: '', duration: '', ctaText: '' };
const BLANK_GALLERY = { label: '', src: '', alt: '', hidden: false, mobileOnly: false };
const BLANK_REVIEW = { stars: 5, body: '', name: '', role: '', initial: '' };
const BLANK_FAQ = { q: '', a: '' };

export default function Editor() {
  const router = useRouter();
  const [content, setContent] = useState(null);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const [open, setOpen] = useState('site');

  useEffect(() => {
    fetch('/api/admin/content')
      .then((r) => { if (!r.ok) throw new Error('Failed to load'); return r.json(); })
      .then(setContent)
      .catch(() => setError('Could not load content. Check GitHub env vars.'));
  }, []);

  function change(path, value) {
    setContent((prev) => setNestedValue(prev, path, value));
  }

  function arrChange(key, i, field, value) {
    setContent((prev) => {
      const arr = [...prev[key]];
      arr[i] = { ...arr[i], [field]: value };
      return { ...prev, [key]: arr };
    });
  }

  function arrAdd(key, blank) {
    setContent((prev) => ({ ...prev, [key]: [...prev[key], { ...blank }] }));
  }

  function arrRemove(key, i) {
    setContent((prev) => ({ ...prev, [key]: prev[key].filter((_, idx) => idx !== i) }));
  }

  async function handleSave() {
    setStatus('saving');
    setError('');
    const res = await fetch('/api/admin/content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(content),
    });
    if (res.ok) {
      setStatus('saved');
    } else {
      const d = await res.json();
      setError(d.error || 'Save failed');
      setStatus('error');
    }
  }

  async function handleLogout() {
    await fetch('/api/admin/auth', { method: 'DELETE' });
    router.push('/admin');
  }

  function toggle(id) { setOpen((prev) => (prev === id ? null : id)); }

  if (error && !content) return <p className="admin-loading">{error}</p>;
  if (!content) return <p className="admin-loading">Loading content…</p>;

  const c = content;

  return (
    <div>
      <div className="admin-save-bar">
        <button type="button" className="admin-btn admin-btn--primary" onClick={handleSave} disabled={status === 'saving'}>
          {status === 'saving' ? 'Publishing…' : 'Save & Publish'}
        </button>
        {status === 'saved' && <span className="admin-status admin-status--saved">Published — live in ~60s</span>}
        {status === 'error' && <span className="admin-status admin-status--error">{error}</span>}
        <span className="admin-save-bar__hint" style={{ marginLeft: 'auto' }}>
          <button type="button" className="admin-btn admin-btn--ghost admin-btn--sm" onClick={handleLogout}>Sign out</button>
        </span>
      </div>

      {/* 1 — Business Info */}
      <Section label="Business Info" id="site" open={open === 'site'} onToggle={() => toggle('site')}>
        <div className="admin-field__row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <FieldRow label="Business Name" value={c.SITE.name} onChange={(v) => change('SITE.name', v)} />
          <FieldRow label="Tagline" value={c.SITE.tagline} onChange={(v) => change('SITE.tagline', v)} />
        </div>
        <div className="admin-field__row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <FieldRow label="Phone (display)" type="tel" value={c.SITE.phone} onChange={(v) => change('SITE.phone', v)} />
          <FieldRow label="Phone href" type="tel" value={c.SITE.phoneHref} onChange={(v) => change('SITE.phoneHref', v)} hint="tel:+13105550192" />
        </div>
        <div className="admin-field__row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <FieldRow label="Email" type="email" value={c.SITE.email} onChange={(v) => change('SITE.email', v)} />
          <FieldRow label="Hours" value={c.SITE.hours} onChange={(v) => change('SITE.hours', v)} />
        </div>
        <div className="admin-field__row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <FieldRow label="City" value={c.SITE.city} onChange={(v) => change('SITE.city', v)} />
          <FieldRow label="Service Area" value={c.SITE.serviceArea} onChange={(v) => change('SITE.serviceArea', v)} />
        </div>
        <FieldRow label="Instagram URL" type="url" value={c.SITE.instagram} onChange={(v) => change('SITE.instagram', v)} />
        <div className="admin-field__row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <FieldRow label="TikTok URL" type="url" value={c.SITE.tiktok} onChange={(v) => change('SITE.tiktok', v)} />
          <FieldRow label="Pinterest URL" type="url" value={c.SITE.pinterest} onChange={(v) => change('SITE.pinterest', v)} />
        </div>
        <div className="admin-field">
          <span className="admin-field__label">Site URL</span>
          <span className="admin-field__readonly">Set via NEXT_PUBLIC_SITE_URL environment variable</span>
        </div>
      </Section>

      {/* 2 — Hero */}
      <Section label="Hero Section" id="hero" open={open === 'hero'} onToggle={() => toggle('hero')}>
        <FieldRow label="Eyebrow" value={c.HERO.eyebrow} onChange={(v) => change('HERO.eyebrow', v)} />
        <div className="admin-field__row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <FieldRow label="Headline (plain part)" value={c.HERO.headline} onChange={(v) => change('HERO.headline', v)} />
          <FieldRow label="Headline emphasis (italic)" value={c.HERO.headlineEm} onChange={(v) => change('HERO.headlineEm', v)} hint="This part renders in italic" />
        </div>
        <FieldRow label="Sub-headline" type="textarea" rows={2} value={c.HERO.sub} onChange={(v) => change('HERO.sub', v)} />
        <div className="admin-field__row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <FieldRow label="Primary CTA label" value={c.HERO.ctaPrimary} onChange={(v) => change('HERO.ctaPrimary', v)} />
          <FieldRow label="Secondary CTA label" value={c.HERO.ctaSecondary} onChange={(v) => change('HERO.ctaSecondary', v)} />
        </div>
        <p className="admin-section__group-label">Proof Bar (3 stats)</p>
        {c.HERO.proof.map((p, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <FieldRow label={`Stat ${i + 1} — Value`} value={p.value} onChange={(v) => { const arr = [...c.HERO.proof]; arr[i] = { ...arr[i], value: v }; change('HERO.proof', arr); }} />
            <FieldRow label={`Stat ${i + 1} — Label`} value={p.label} onChange={(v) => { const arr = [...c.HERO.proof]; arr[i] = { ...arr[i], label: v }; change('HERO.proof', arr); }} />
          </div>
        ))}
      </Section>

      {/* 3 — Trust Bar */}
      <Section label="Trust Bar" id="trust" open={open === 'trust'} onToggle={() => toggle('trust')}>
        {c.TRUST_ITEMS.map((t, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <FieldRow label={`Item ${i + 1} — Value`} value={t.value} onChange={(v) => arrChange('TRUST_ITEMS', i, 'value', v)} />
            <FieldRow label={`Item ${i + 1} — Label`} value={t.label} onChange={(v) => arrChange('TRUST_ITEMS', i, 'label', v)} />
          </div>
        ))}
      </Section>

      {/* 4 — Services */}
      <Section label="Services" id="services" open={open === 'services'} onToggle={() => toggle('services')}>
        <ArrayEditor
          items={c.SERVICES}
          onAdd={() => arrAdd('SERVICES', BLANK_SERVICE)}
          onRemove={(i) => arrRemove('SERVICES', i)}
          addLabel="Add Service"
          renderItem={(svc, i) => (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <FieldRow label="Title" value={svc.title} onChange={(v) => arrChange('SERVICES', i, 'title', v)} />
                <FieldRow label="Tag / Badge" value={svc.tag} onChange={(v) => arrChange('SERVICES', i, 'tag', v)} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <FieldRow label="Price" value={svc.price} onChange={(v) => arrChange('SERVICES', i, 'price', v)} />
                <FieldRow label="Duration" value={svc.duration} onChange={(v) => arrChange('SERVICES', i, 'duration', v)} />
              </div>
              <FieldRow label="Description" type="textarea" rows={3} value={svc.description} onChange={(v) => arrChange('SERVICES', i, 'description', v)} />
              <FieldRow label="CTA Text" value={svc.ctaText} onChange={(v) => arrChange('SERVICES', i, 'ctaText', v)} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <FieldRow label="Photo Src" value={svc.photoSrc} onChange={(v) => arrChange('SERVICES', i, 'photoSrc', v)} hint="/images/bridal.webp" />
                <FieldRow label="Photo Alt" value={svc.photoAlt} onChange={(v) => arrChange('SERVICES', i, 'photoAlt', v)} />
              </div>
              <FieldRow label="Photo Label (overlay)" value={svc.photoLabel} onChange={(v) => arrChange('SERVICES', i, 'photoLabel', v)} />
              <FieldRow label="Photo Gradient (CSS)" value={svc.photoGradient} onChange={(v) => arrChange('SERVICES', i, 'photoGradient', v)} hint="Used as fallback background" />
            </>
          )}
        />
      </Section>

      {/* 5 — Gallery */}
      <Section label="Gallery" id="gallery" open={open === 'gallery'} onToggle={() => toggle('gallery')}>
        <ArrayEditor
          items={c.GALLERY_ITEMS}
          onAdd={() => arrAdd('GALLERY_ITEMS', BLANK_GALLERY)}
          onRemove={(i) => arrRemove('GALLERY_ITEMS', i)}
          addLabel="Add Photo"
          renderItem={(item, i) => (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <FieldRow label="Label" value={item.label} onChange={(v) => arrChange('GALLERY_ITEMS', i, 'label', v)} />
                <FieldRow label="Image Src" value={item.src} onChange={(v) => arrChange('GALLERY_ITEMS', i, 'src', v)} hint="/images/gallery-1.webp" />
              </div>
              <FieldRow label="Alt Text" value={item.alt} onChange={(v) => arrChange('GALLERY_ITEMS', i, 'alt', v)} />
              <div style={{ display: 'flex', gap: '24px', marginTop: '4px' }}>
                <FieldRow label="Hidden on desktop" type="checkbox" value={item.hidden} onChange={(v) => arrChange('GALLERY_ITEMS', i, 'hidden', v)} />
                <FieldRow label="Mobile only" type="checkbox" value={item.mobileOnly} onChange={(v) => arrChange('GALLERY_ITEMS', i, 'mobileOnly', v)} />
              </div>
            </>
          )}
        />
      </Section>

      {/* 6 — Reviews */}
      <Section label="Reviews" id="reviews" open={open === 'reviews'} onToggle={() => toggle('reviews')}>
        <ArrayEditor
          items={c.REVIEWS}
          onAdd={() => arrAdd('REVIEWS', BLANK_REVIEW)}
          onRemove={(i) => arrRemove('REVIEWS', i)}
          addLabel="Add Review"
          renderItem={(r, i) => (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <FieldRow label="Name" value={r.name} onChange={(v) => arrChange('REVIEWS', i, 'name', v)} />
                <FieldRow label="Role / Location" value={r.role} onChange={(v) => arrChange('REVIEWS', i, 'role', v)} />
                <FieldRow label="Avatar Letter" value={r.initial} onChange={(v) => arrChange('REVIEWS', i, 'initial', v)} hint="Single letter" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 4fr', gap: '12px' }}>
                <FieldRow label="Stars (1–5)" type="number" value={r.stars} onChange={(v) => arrChange('REVIEWS', i, 'stars', Number(v))} />
                <div />
              </div>
              <FieldRow label="Review Text" type="textarea" rows={4} value={r.body} onChange={(v) => arrChange('REVIEWS', i, 'body', v)} />
            </>
          )}
        />
      </Section>

      {/* 7 — About */}
      <Section label="About Me" id="about" open={open === 'about'} onToggle={() => toggle('about')}>
        <FieldRow label="Eyebrow" value={c.ABOUT.eyebrow} onChange={(v) => change('ABOUT.eyebrow', v)} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <FieldRow label="Headline (plain)" value={c.ABOUT.headline} onChange={(v) => change('ABOUT.headline', v)} />
          <FieldRow label="Headline emphasis" value={c.ABOUT.headlineEm} onChange={(v) => change('ABOUT.headlineEm', v)} />
        </div>
        <FieldRow label="Bio Paragraph 1" type="textarea" rows={4} value={c.ABOUT.bio[0]} onChange={(v) => { const b = [...c.ABOUT.bio]; b[0] = v; change('ABOUT.bio', b); }} />
        <FieldRow label="Bio Paragraph 2" type="textarea" rows={4} value={c.ABOUT.bio[1]} onChange={(v) => { const b = [...c.ABOUT.bio]; b[1] = v; change('ABOUT.bio', b); }} />
        <p className="admin-section__group-label">Credentials (4 bullet points)</p>
        {c.ABOUT.credentials.map((cred, i) => (
          <FieldRow key={i} label={`Credential ${i + 1}`} value={cred} onChange={(v) => { const arr = [...c.ABOUT.credentials]; arr[i] = v; change('ABOUT.credentials', arr); }} />
        ))}
        <p className="admin-section__group-label">Credential Badge</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <FieldRow label="Badge Title" value={c.ABOUT.credential.title} onChange={(v) => change('ABOUT.credential.title', v)} />
          <FieldRow label="Badge Subtitle" value={c.ABOUT.credential.subtitle} onChange={(v) => change('ABOUT.credential.subtitle', v)} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <FieldRow label="Photo Alt Text" value={c.ABOUT.photoAlt} onChange={(v) => change('ABOUT.photoAlt', v)} />
          <FieldRow label="CTA Label" value={c.ABOUT.cta} onChange={(v) => change('ABOUT.cta', v)} />
        </div>
      </Section>

      {/* 8 — Process */}
      <Section label="Booking Process" id="process" open={open === 'process'} onToggle={() => toggle('process')}>
        {c.PROCESS_STEPS.map((step, i) => (
          <div key={i}>
            {i > 0 && <hr className="admin-section__divider" />}
            <p className="admin-section__group-label">Step {step.num}</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <FieldRow label="Number label" value={step.num} onChange={(v) => { const s = [...c.PROCESS_STEPS]; s[i] = { ...s[i], num: v }; change('PROCESS_STEPS', s); }} hint="e.g. 01" />
              <FieldRow label="Sub-label" value={step.label} onChange={(v) => { const s = [...c.PROCESS_STEPS]; s[i] = { ...s[i], label: v }; change('PROCESS_STEPS', s); }} hint="e.g. Step one" />
            </div>
            <FieldRow label="Title" value={step.title} onChange={(v) => { const s = [...c.PROCESS_STEPS]; s[i] = { ...s[i], title: v }; change('PROCESS_STEPS', s); }} />
            <FieldRow label="Body" type="textarea" rows={3} value={step.body} onChange={(v) => { const s = [...c.PROCESS_STEPS]; s[i] = { ...s[i], body: v }; change('PROCESS_STEPS', s); }} />
          </div>
        ))}
      </Section>

      {/* 9 — FAQ */}
      <Section label="FAQ" id="faq" open={open === 'faq'} onToggle={() => toggle('faq')}>
        <ArrayEditor
          items={c.FAQ_ITEMS}
          onAdd={() => arrAdd('FAQ_ITEMS', BLANK_FAQ)}
          onRemove={(i) => arrRemove('FAQ_ITEMS', i)}
          addLabel="Add Question"
          renderItem={(item, i) => (
            <>
              <FieldRow label="Question" value={item.q} onChange={(v) => arrChange('FAQ_ITEMS', i, 'q', v)} />
              <FieldRow label="Answer" type="textarea" rows={3} value={item.a} onChange={(v) => arrChange('FAQ_ITEMS', i, 'a', v)} />
            </>
          )}
        />
      </Section>

      {/* 10 — Final CTA */}
      <Section label="Final CTA" id="cta" open={open === 'cta'} onToggle={() => toggle('cta')}>
        <FieldRow label="Eyebrow" value={c.FINAL_CTA.eyebrow} onChange={(v) => change('FINAL_CTA.eyebrow', v)} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <FieldRow label="Headline (plain)" value={c.FINAL_CTA.headline} onChange={(v) => change('FINAL_CTA.headline', v)} />
          <FieldRow label="Headline emphasis" value={c.FINAL_CTA.headlineEm} onChange={(v) => change('FINAL_CTA.headlineEm', v)} />
        </div>
        <FieldRow label="Body paragraph" type="textarea" rows={2} value={c.FINAL_CTA.body} onChange={(v) => change('FINAL_CTA.body', v)} />
        <p className="admin-section__group-label">Trust Points (4 items)</p>
        {c.FINAL_CTA.trustPoints.map((pt, i) => (
          <FieldRow key={i} label={`Trust Point ${i + 1}`} value={pt} onChange={(v) => { const arr = [...c.FINAL_CTA.trustPoints]; arr[i] = v; change('FINAL_CTA.trustPoints', arr); }} />
        ))}
      </Section>
    </div>
  );
}

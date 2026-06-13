'use strict';

import data from '../data/content.json';

function fa(arr) {
  return Object.freeze(arr.map((item) => Object.freeze({ ...item })));
}

export const SITE = Object.freeze({
  ...data.SITE,
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://sofiaartistry.com',
});

export const HERO = Object.freeze({
  ...data.HERO,
  proof: fa(data.HERO.proof),
});

export const TRUST_ITEMS = fa(data.TRUST_ITEMS);
export const SERVICES = fa(data.SERVICES);
export const GALLERY_ITEMS = fa(data.GALLERY_ITEMS);
export const REVIEWS = fa(data.REVIEWS);

export const ABOUT = Object.freeze({
  ...data.ABOUT,
  bio: Object.freeze([...data.ABOUT.bio]),
  credentials: Object.freeze([...data.ABOUT.credentials]),
  credential: Object.freeze({ ...data.ABOUT.credential }),
});

export const PROCESS_STEPS = fa(data.PROCESS_STEPS);
export const FAQ_ITEMS = fa(data.FAQ_ITEMS);

export const FINAL_CTA = Object.freeze({
  ...data.FINAL_CTA,
  trustPoints: Object.freeze([...data.FINAL_CTA.trustPoints]),
});

export const FOOTER = Object.freeze({
  brandLine: data.FOOTER.brandLine,
  cols: Object.freeze(data.FOOTER.cols.map((col) =>
    Object.freeze({ ...col, links: Object.freeze(col.links.map((l) => Object.freeze({ ...l }))) })
  )),
});

export const SECTIONS = Object.freeze({
  trust: true,
  services: true,
  gallery: true,
  reviews: true,
  about: true,
  process: true,
  faq: true,
  finalCta: true,
  ...data.SECTIONS,
});

export const NAV_LINKS = Object.freeze([
  { href: '#services', label: 'Services' },
  { href: '#gallery', label: 'Portfolio' },
  { href: '#reviews', label: 'Reviews' },
  { href: '#about', label: 'About' },
  { href: '#faq', label: 'FAQ' },
]);

export const SECTION_NAV = Object.freeze([
  { href: '#', label: 'Home', section: 'hero' },
  { href: '#services', label: 'Services', section: 'services' },
  { href: '#gallery', label: 'Portfolio', section: 'gallery' },
  { href: '#reviews', label: 'Reviews', section: 'reviews' },
  { href: '#about', label: 'About', section: 'about' },
  { href: '#faq', label: 'FAQ', section: 'faq' },
  // key: SECTIONS visibility key when it differs from the DOM section id
  { href: '#lead-form', label: 'Book Me', section: 'lead-form', key: 'finalCta' },
]);


export const FORM_SERVICES = Object.freeze([
  { value: 'bridal', label: 'Bridal Makeup' },
  { value: 'trial', label: 'Bridal Trial' },
  { value: 'glam', label: 'Glam / Event' },
  { value: 'editorial', label: 'Editorial / Photoshoot' },
  { value: 'other', label: 'Not sure yet' },
]);

import { SITE, FAQ_ITEMS, REVIEWS, SECTIONS } from '@/constants/site';

const BASE = process.env.NEXT_PUBLIC_SITE_URL || 'https://sofiaartistry.com';
const BUSINESS_ID = `${BASE}/#business`;

const ratingValue = (
  REVIEWS.reduce((sum, r) => sum + (r.stars || 5), 0) / REVIEWS.length
).toFixed(1);

const localBusiness = {
  '@context': 'https://schema.org',
  '@type': 'BeautySalon',
  '@id': BUSINESS_ID,
  name: SITE.name,
  image: `${BASE}/og.jpg`,
  url: BASE,
  telephone: SITE.phoneHref.replace('tel:', ''),
  email: SITE.email,
  address: {
    '@type': 'PostalAddress',
    addressLocality: SITE.city,
    addressRegion: 'CA',
    addressCountry: 'US',
  },
  areaServed: {
    '@type': 'AdministrativeArea',
    name: SITE.serviceArea,
  },
  sameAs: [SITE.instagram, SITE.tiktok, SITE.pinterest].filter(Boolean),
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      opens: '08:00',
      closes: '20:00',
    },
  ],
  priceRange: '$$',
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue,
    reviewCount: String(REVIEWS.length),
  },
};

const faqPage = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ_ITEMS.map((item) => ({
    '@type': 'Question',
    name: item.q,
    acceptedAnswer: { '@type': 'Answer', text: item.a },
  })),
};

const service = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'Bridal & Event Makeup',
  provider: { '@id': BUSINESS_ID },
  areaServed: { '@type': 'City', name: 'Los Angeles' },
  description:
    'Professional bridal, glam, and editorial makeup artistry in Los Angeles. Mobile artist — I come to you.',
};

const schemas = [localBusiness, service];
if (SECTIONS.faq !== false) schemas.push(faqPage);

export default function JsonLd() {
  return schemas.map((schema, i) => (
    <script
      key={i}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026') }}
    />
  ));
}

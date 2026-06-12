import { SITE, FAQ_ITEMS } from '@/constants/site';

const BASE = process.env.NEXT_PUBLIC_SITE_URL || 'https://sofiaartistry.com';

const localBusiness = {
  '@context': 'https://schema.org',
  '@type': 'BeautySalon',
  name: SITE.name,
  image: `${BASE}/og.jpg`,
  url: BASE,
  telephone: SITE.phoneHref,
  email: SITE.email,
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Los Angeles',
    addressRegion: 'CA',
    addressCountry: 'US',
  },
  areaServed: {
    '@type': 'State',
    name: 'California',
  },
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
    ratingValue: '5.0',
    reviewCount: '200',
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
  provider: { '@type': 'BeautySalon', name: SITE.name },
  areaServed: { '@type': 'City', name: 'Los Angeles' },
  description:
    'Professional bridal, glam, and editorial makeup artistry in Los Angeles. Mobile artist — I come to you.',
};

export default function JsonLd() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusiness) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPage) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(service) }}
      />
    </>
  );
}

'use strict';

const BASE = process.env.NEXT_PUBLIC_SITE_URL || 'https://sofiaartistry.com';

export default function sitemap() {
  return [
    {
      url: BASE,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
  ];
}

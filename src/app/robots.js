'use strict';

const BASE = process.env.NEXT_PUBLIC_SITE_URL || 'https://sofiaartistry.com';

export default function robots() {
  return {
    rules: { userAgent: '*', allow: '/', disallow: '/admin' },
    sitemap: `${BASE}/sitemap.xml`,
  };
}

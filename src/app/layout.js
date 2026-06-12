import { Cormorant_Garamond, DM_Sans } from 'next/font/google';
import Script from 'next/script';
import '../styles/globals.scss';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-display',
  display: 'swap',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-body',
  display: 'swap',
});

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://sofiaartistry.com'),
  title: 'Makeup Artist in Los Angeles | Sofia Artistry',
  description:
    'Professional bridal, glam & editorial makeup artist serving Los Angeles County. 5.0 Google rating, 200+ clients. Mobile — I come to you. Book now.',
  alternates: { canonical: process.env.NEXT_PUBLIC_SITE_URL || 'https://sofiaartistry.com' },
  openGraph: {
    title: 'Makeup Artist in Los Angeles | Sofia Artistry',
    description:
      'Professional bridal, glam & editorial makeup artist. 5.0 Google rating. Mobile artist serving all of Los Angeles County.',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://sofiaartistry.com',
    siteName: 'Sofia Artistry',
    images: [{ url: '/og.jpg', width: 1200, height: 630, alt: 'Sofia Artistry — Makeup Artist in Los Angeles' }],
    locale: 'en_US',
    type: 'website',
  },
  robots: { index: true, follow: true },
};

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${cormorant.variable} ${dmSans.variable}`}>
      <body>
        {children}

        {GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">{`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_ID}');
            `}</Script>
          </>
        )}

        {PIXEL_ID && (
          <>
            <Script id="meta-pixel" strategy="afterInteractive">{`
              !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
              n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
              document,'script','https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${PIXEL_ID}');
              fbq('track', 'PageView');
            `}</Script>
            <noscript>
              <img
                height="1"
                width="1"
                style={{ display: 'none' }}
                src={`https://www.facebook.com/tr?id=${PIXEL_ID}&ev=PageView&noscript=1`}
                alt=""
              />
            </noscript>
          </>
        )}
      </body>
    </html>
  );
}

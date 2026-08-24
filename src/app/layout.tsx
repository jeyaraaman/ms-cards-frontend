import type { Metadata } from "next";

import "@fontsource/geist/400.css";
import "@fontsource/geist/500.css";
import "@fontsource/geist/600.css";
import "@fontsource/geist/700.css";

import "@fontsource/cormorant-garamond/400.css";
import "@fontsource/cormorant-garamond/500.css";
import "@fontsource/cormorant-garamond/600.css";
import "@fontsource/cormorant-garamond/700.css";

import "./globals.css";

import { Providers } from "@/components/providers/providers";
import { RouteLayout } from "@/components/layout/root-layout";

/* ============================================================
   SITE CONFIGURATION
============================================================ */

const SITE_URL = "https://meenakshiscreen.com";

const SITE_NAME = "Meenakshi Screen";

const COMPANY_NAME =
  "Meenakshi Screen Printers & Cards";

const DEFAULT_DESCRIPTION =
  "Premium wedding invitations, luxury invitation cards, commercial printing, and customized stationery by Meenakshi Screen Printers & Cards, Madurai.";

const PHONE = "+91 72006 76070";

const INSTAGRAM_URL =
  "https://www.instagram.com/meenakshiscreen_cards";

const WHATSAPP_URL =
  "https://api.whatsapp.com/send/?phone=917200676070&text&type=phone_number&app_absent=0";

/* ============================================================
   BUSINESS ADDRESS
============================================================ */

const BUSINESS_ADDRESS = {
  "@type": "PostalAddress",
  streetAddress:
    "31-B/1, Manjanakara St, near KMT Lorry Service, South Gate, Madurai Main",
  addressLocality: "Madurai",
  addressRegion: "Tamil Nadu",
  postalCode: "625001",
  addressCountry: "IN",
};

/* ============================================================
   GLOBAL SEO METADATA
============================================================ */

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),

  /* ==========================================================
     TITLE
  ========================================================== */

  title: {
    default:
      "Meenakshi Screen | Premium Wedding Invitations & Printing Services",

    template:
      "%s | Meenakshi Screen",
  },

  /* ==========================================================
     DESCRIPTION
  ========================================================== */

  description:
    DEFAULT_DESCRIPTION,

  /* ==========================================================
     KEYWORDS
  ========================================================== */

  keywords: [
    "Meenakshi Screen",
    "Meenakshi Screen Printers",
    "Meenakshi Screen Printers & Cards",
    "Wedding Invitations",
    "Wedding Invitation Cards",
    "Luxury Wedding Invitations",
    "Wedding Cards",
    "Wedding Cards Madurai",
    "Wedding Invitations Madurai",
    "Invitation Printing",
    "Wedding Card Printing",
    "Commercial Printing",
    "Acrylic Invitations",
    "Laser Cut Invitations",
    "Premium Wedding Cards",
    "Wedding Cards Tamil Nadu",
    "Customized Wedding Invitations",
  ],

  /* ==========================================================
     AUTHOR / PUBLISHER
  ========================================================== */

  authors: [
    {
      name: COMPANY_NAME,
    },
  ],

  creator: COMPANY_NAME,

  publisher: COMPANY_NAME,

  /* ==========================================================
     APPLICATION
  ========================================================== */

  applicationName: SITE_NAME,

  category: "Business",

  /* ==========================================================
     CANONICAL URL
  ========================================================== */

  alternates: {
    canonical: "/",
  },

  /* ==========================================================
     ROBOTS
  ========================================================== */

  robots: {
    index: true,
    follow: true,

    googleBot: {
      index: true,
      follow: true,

      "max-image-preview": "large",

      "max-snippet": -1,

      "max-video-preview": -1,
    },
  },

  /* ==========================================================
     OPEN GRAPH
  ========================================================== */

  openGraph: {
    type: "website",

    url: SITE_URL,

    siteName: SITE_NAME,

    locale: "en_IN",

    title:
      "Meenakshi Screen | Premium Wedding Invitations & Printing Services",

    description:
      DEFAULT_DESCRIPTION,
  },

  /* ==========================================================
     TWITTER / X
  ========================================================== */

  twitter: {
    card: "summary_large_image",

    title:
      "Meenakshi Screen | Premium Wedding Invitations & Printing Services",

    description:
      DEFAULT_DESCRIPTION,
  },

  /* ==========================================================
     FAVICON
     
     Light browser/OS theme → black M
     Dark browser/OS theme  → white M
  ========================================================== */

  icons: {
    icon: [
      {
        url: "/favicon-b.ico",
        media:
          "(prefers-color-scheme: light)",
      },
      {
        url: "/favicon-w.ico",
        media:
          "(prefers-color-scheme: dark)",
      },
    ],
  },

  /* ==========================================================
     FORMAT DETECTION
  ========================================================== */

  formatDetection: {
    telephone: true,
    email: true,
    address: false,
  },
};

/* ============================================================
   LOCAL BUSINESS STRUCTURED DATA
============================================================ */

const localBusinessSchema = {
  "@context": "https://schema.org",

  "@type": "LocalBusiness",

  "@id": `${SITE_URL}/#business`,

  name: COMPANY_NAME,

  alternateName: SITE_NAME,

  url: SITE_URL,

  telephone: PHONE,

  address: BUSINESS_ADDRESS,

  areaServed: {
    "@type": "City",
    name: "Madurai",
  },

  sameAs: [
    INSTAGRAM_URL,
  ],

  contactPoint: {
    "@type": "ContactPoint",
    telephone: PHONE,
    contactType: "customer service",
    areaServed: "IN",
    availableLanguage: [
      "English",
      "Tamil",
    ],
  },
};

/* ============================================================
   ORGANIZATION STRUCTURED DATA
============================================================ */

const organizationSchema = {
  "@context": "https://schema.org",

  "@type": "Organization",

  "@id": `${SITE_URL}/#organization`,

  name: COMPANY_NAME,

  alternateName: SITE_NAME,

  url: SITE_URL,

  telephone: PHONE,

  address: BUSINESS_ADDRESS,

  sameAs: [
    INSTAGRAM_URL,
  ],
};

/* ============================================================
   WEBSITE STRUCTURED DATA
============================================================ */

const websiteSchema = {
  "@context": "https://schema.org",

  "@type": "WebSite",

  "@id": `${SITE_URL}/#website`,

  name: SITE_NAME,

  alternateName: COMPANY_NAME,

  url: SITE_URL,

  publisher: {
    "@id": `${SITE_URL}/#organization`,
  },

  inLanguage: "en-IN",
};

/* ============================================================
   ROOT LAYOUT
============================================================ */

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({
  children,
}: RootLayoutProps) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
    >
      <head>
        {/* ====================================================
            LOCAL BUSINESS SCHEMA
        ==================================================== */}

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html:
              JSON.stringify(
                localBusinessSchema,
              ),
          }}
        />

        {/* ====================================================
            ORGANIZATION SCHEMA
        ==================================================== */}

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html:
              JSON.stringify(
                organizationSchema,
              ),
          }}
        />

        {/* ====================================================
            WEBSITE SCHEMA
        ==================================================== */}

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html:
              JSON.stringify(
                websiteSchema,
              ),
          }}
        />
      </head>

      <body className="min-h-screen bg-background text-foreground antialiased">
        <Providers>
          <RouteLayout>
            {children}
          </RouteLayout>
        </Providers>
      </body>
    </html>
  );
}
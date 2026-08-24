import type { Metadata } from "next";

import { HomePage } from "@/features/home";

const SITE_URL = "https://meenakshiscreen.com";
const SITE_NAME = "Meenakshi Screen";

export const metadata: Metadata = {
  title: "Meenakshi Screen | Wedding Cards & Printing",
  description:
    "Explore premium wedding invitations, wedding cards and customized printing from Meenakshi Screen.",
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: "en_IN",
    title:
      "Meenakshi Screen | Wedding Cards & Printing",
    description:
      "Explore premium wedding invitations, wedding cards and customized printing from Meenakshi Screen.",
  },
};

/* ============================================================
   ORGANIZATION + WEBSITE STRUCTURED DATA
============================================================ */

function HomeStructuredData() {
  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: SITE_URL,
  };

  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: SITE_NAME,
    url: SITE_URL,
    publisher: {
      "@id": `${SITE_URL}/#organization`,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            organization,
          ),
        }}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            website,
          ),
        }}
      />
    </>
  );
}

/* ============================================================
   HOME PAGE
============================================================ */

export default function Page() {
  return (
    <>
      <HomeStructuredData />

      <HomePage />
    </>
  );
}
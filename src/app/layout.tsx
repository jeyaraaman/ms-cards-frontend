import type { Metadata } from "next";
import { Geist, Cormorant_Garamond } from "next/font/google";

import "./globals.css";

import { Providers } from "@/components/providers/providers";
import { AppLayout } from "@/components/layout/app-layout";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://mscards.in"),

  title: {
    default: "MS Cards | Premium Wedding Invitations & Printing Services",
    template: "%s | MS Cards",
  },

  description:
    "Premium wedding invitations, luxury invitation cards, commercial printing, and customized stationery by Meenakshi Screen Printers & Cards, Madurai.",

  keywords: [
    "Wedding Invitation",
    "Luxury Invitation Cards",
    "Wedding Cards Madurai",
    "Invitation Printing",
    "Commercial Printing",
    "Acrylic Invitations",
    "Laser Cut Invitations",
    "Wedding Cards Tamil Nadu",
    "MS Cards",
    "Meenakshi Screen Printers",
  ],

  authors: [
    {
      name: "Meenakshi Screen Printers & Cards",
    },
  ],

  creator: "Meenakshi Screen Printers & Cards",

  publisher: "Meenakshi Screen Printers & Cards",

  robots: {
    index: true,
    follow: true,
  },

  category: "Business",

  applicationName: "MS Cards",
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({
  children,
}: RootLayoutProps) {
  return (
    <html
      lang="en"
      className={`${geist.variable} ${cormorant.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-background text-foreground antialiased">
        <Providers>
          <AppLayout>{children}</AppLayout>
        </Providers>
      </body>
    </html>
  );
}
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers/providers";
import { AppLayout } from "@/components/layout/app-layout";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
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
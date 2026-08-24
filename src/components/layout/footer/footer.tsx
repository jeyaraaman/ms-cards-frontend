"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Mail,
  MapPin,
  Phone,
  MessageCircle,
} from "lucide-react";
import { FaInstagram } from "react-icons/fa";

import { Container } from "@/components/common/container";

interface SiteSettings {
  company_name: string;
  address: string;
  phone: string;
  email: string;
  whatsapp_url: string;
  instagram_url: string;
  google_maps_url: string;
  copyright_text: string;

  /* Admin-controlled Footer Description */
  footer_description: string;

  active: boolean;
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:8000";

export function Footer() {
  const [settings, setSettings] =
    useState<SiteSettings | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchSiteSettings() {
      try {
        const response =
          await fetch(
            `${API_URL}/api/site-settings/`,
            {
              cache: "no-store",
            },
          );

        if (!response.ok) {
          throw new Error(
            "Failed to fetch site settings",
          );
        }

        const data: SiteSettings =
          await response.json();

        if (!cancelled) {
          setSettings(data);
        }
      } catch (error) {
        console.error(
          "Failed to load site settings:",
          error,
        );
      }
    }

    fetchSiteSettings();

    return () => {
      cancelled = true;
    };
  }, []);

  /*
   * ============================================================
   * FOOTER DESCRIPTION
   *
   * Admin-controlled through:
   *
   * Meenakshi Screen Admin
   * → Site Settings
   * → Footer
   * → Footer Description
   *
   * The original description is retained as a fallback so
   * the footer doesn't become empty if the field hasn't been
   * populated yet.
   * ============================================================
   */

  const footerDescription =
    settings?.footer_description?.trim() ||
    "Premium Wedding Invitations & Commercial Printing Since 1997. Crafting unforgettable invitations for weddings, engagements, housewarmings, and every special occasion.";

  return (
    <footer
      className="
        border-t
        bg-[#F3E8D7]
        dark:bg-muted/30
      "
    >
      <Container>
        <div className="grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-4">

          {/* ==================================================
              COMPANY
          ================================================== */}

          <div>
            <h3 className="font-heading text-3xl text-primary">
              {settings?.company_name ||
                "Meenakshi Screen"}
            </h3>

            <p className="mt-4 whitespace-pre-line leading-7 text-muted-foreground">
              {footerDescription}
            </p>
          </div>

          {/* ==================================================
              QUICK LINKS
          ================================================== */}

          <div>
            <h4 className="mb-4 text-lg font-semibold">
              Quick Links
            </h4>

            <ul className="space-y-3 text-muted-foreground">
              <li>
                <Link
                  href="/"
                  className="transition-colors hover:text-primary"
                >
                  Home
                </Link>
              </li>

              <li>
                <Link
                  href="/catalogue"
                  className="transition-colors hover:text-primary"
                >
                  Catalogue
                </Link>
              </li>

              <li>
                <Link
                  href="/enquiry"
                  className="transition-colors hover:text-primary"
                >
                  Enquiry
                </Link>
              </li>

              {settings?.google_maps_url && (
                <li>
                  <a
                    href={
                      settings.google_maps_url
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-colors hover:text-primary"
                  >
                    Find Us on Google Maps
                  </a>
                </li>
              )}
            </ul>
          </div>

          {/* ==================================================
              CONTACT
          ================================================== */}

          <div>
            <h4 className="mb-4 text-lg font-semibold">
              Contact
            </h4>

            <div className="space-y-4 text-muted-foreground">

              {/* Google Maps */}

              {settings?.google_maps_url && (
                <a
                  href={
                    settings.google_maps_url
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 transition-colors hover:text-primary"
                >
                  <MapPin className="mt-1 h-5 w-5 shrink-0 text-primary" />

                  <span className="whitespace-pre-line">
                    {settings.address}
                  </span>
                </a>
              )}

              {/* Phone */}

              {settings?.phone && (
                <a
                  href={`tel:${settings.phone}`}
                  className="flex items-center gap-3 transition-colors hover:text-primary"
                >
                  <Phone className="h-5 w-5 shrink-0 text-primary" />

                  <span>
                    {settings.phone}
                  </span>
                </a>
              )}

              {/* Email */}

              {settings?.email && (
                <a
                  href={`mailto:${settings.email}`}
                  className="flex items-center gap-3 transition-colors hover:text-primary"
                >
                  <Mail className="h-5 w-5 shrink-0 text-primary" />

                  <span>
                    {settings.email}
                  </span>
                </a>
              )}
            </div>
          </div>

          {/* ==================================================
              SOCIAL
          ================================================== */}

          <div>
            <h4 className="mb-4 text-lg font-semibold">
              Follow Us
            </h4>

            <div className="flex gap-4">

              {/* Instagram */}

              {settings?.instagram_url && (
                <a
                  href={
                    settings.instagram_url
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-border transition-all duration-300 hover:border-primary hover:bg-primary hover:text-white"
                >
                  <FaInstagram className="h-5 w-5" />
                </a>
              )}

              {/* WhatsApp */}

              {settings?.whatsapp_url && (
                <a
                  href={
                    settings.whatsapp_url
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp"
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-border transition-all duration-300 hover:border-primary hover:bg-primary hover:text-white"
                >
                  <MessageCircle className="h-5 w-5" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* ====================================================
            COPYRIGHT
        ==================================================== */}

        <div className="border-t py-6 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()}{" "}
          {settings?.company_name ||
            "Meenakshi Screen Printers & Cards"}
          .{" "}
          {settings?.copyright_text ||
            "All Rights Reserved."}
        </div>
      </Container>
    </footer>
  );
}
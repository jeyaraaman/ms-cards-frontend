"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  MessageCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/common/container";
import { Section } from "@/components/common/section";

/* ============================================================
   CTA DATA
============================================================ */

interface CtaBannerData {
  id: number;

  eyebrow: string;

  title: string;

  description: string;

  primary_button_text: string;

  primary_button_link: string;

  secondary_button_text: string;

  secondary_button_link: string;

  active: boolean;
}

/* ============================================================
   SITE SETTINGS
============================================================ */

interface SiteSettings {
  whatsapp_url: string;
}

/* ============================================================
   API
============================================================ */

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:8000";

/* ============================================================
   CTA BANNER
============================================================ */

export function CtaBanner() {
  const [cta, setCta] =
    useState<CtaBannerData | null>(null);

  const [whatsappUrl, setWhatsappUrl] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  /* ==========================================================
     FETCH CTA + SITE SETTINGS
  ========================================================== */

  useEffect(() => {
    let cancelled = false;

    async function fetchCtaAndSiteSettings() {
      try {
        setLoading(true);
        setError("");

        /* ======================================================
           FETCH BOTH APIs
        ====================================================== */

        const [
          ctaResponse,
          siteSettingsResponse,
        ] = await Promise.all([
          fetch(
            `${API_URL}/api/cta/`,
            {
              cache: "no-store",
            },
          ),

          fetch(
            `${API_URL}/api/site-settings/`,
            {
              cache: "no-store",
            },
          ),
        ]);

        /* ======================================================
           CTA RESPONSE
        ====================================================== */

        if (!ctaResponse.ok) {
          throw new Error(
            "Failed to fetch CTA banner",
          );
        }

        const ctaData: CtaBannerData[] =
          await ctaResponse.json();

        /* ======================================================
           ACTIVE CTA
        ====================================================== */

        const activeCta =
          ctaData.find(
            (item) => item.active,
          );

        /* ======================================================
           SITE SETTINGS
        ====================================================== */

        let siteSettings:
          | SiteSettings
          | null = null;

        if (
          siteSettingsResponse.ok
        ) {
          siteSettings =
            await siteSettingsResponse.json();
        }

        /* ======================================================
           SAVE STATE
        ====================================================== */

        if (!cancelled) {
          setCta(
            activeCta ?? null,
          );

          /*
           * WhatsApp is now controlled by:
           *
           * Admin
           *   ↓
           * Site Settings
           *   ↓
           * WhatsApp URL
           *   ↓
           * Home CTA
           *
           * If Site Settings does not have a WhatsApp URL,
           * fall back to the existing CTA secondary link.
           */

          setWhatsappUrl(
            siteSettings?.whatsapp_url?.trim() ||
              activeCta?.secondary_button_link?.trim() ||
              "",
          );
        }
      } catch (error) {
        console.error(
          "Failed to load CTA banner:",
          error,
        );

        if (!cancelled) {
          setError(
            "Unable to load CTA banner.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchCtaAndSiteSettings();

    return () => {
      cancelled = true;
    };
  }, []);

  /* ==========================================================
     LOADING
  ========================================================== */

  if (loading) {
    return (
      <Section>
        <Container>
          <div className="h-80 animate-pulse rounded-3xl bg-muted" />
        </Container>
      </Section>
    );
  }

  /* ==========================================================
     ERROR / NO CTA
  ========================================================== */

  if (error || !cta) {
    return null;
  }

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <Section>
      <Container>
        <div className="overflow-hidden rounded-3xl bg-primary px-8 py-16 text-center text-primary-foreground shadow-xl md:px-16">

          {/* ==================================================
              EYEBROW
          ================================================== */}

          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-primary-foreground/80">
            {cta.eyebrow}
          </p>

          {/* ==================================================
              TITLE
          ================================================== */}

          <h2 className="font-heading text-4xl font-semibold md:text-5xl">
            {cta.title}
          </h2>

          {/* ==================================================
              DESCRIPTION
          ================================================== */}

          <p className="mx-auto mt-6 max-w-2xl text-lg text-primary-foreground/90">
            {cta.description}
          </p>

          {/* ==================================================
              BUTTONS
          ================================================== */}

          <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">

            {/* ==================================================
                PRIMARY BUTTON
            ================================================== */}

            <Button
              asChild
              size="lg"
              variant="secondary"
              className="rounded-full"
            >
              <Link
                href={
                  cta.primary_button_link
                }
              >
                {cta.primary_button_text}

                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>

            {/* ==================================================
                WHATSAPP BUTTON

                URL comes from:

                Admin
                  ↓
                Site Settings
                  ↓
                WhatsApp URL
                  ↓
                This button
            ================================================== */}

            {whatsappUrl && (
              <Button
                asChild
                size="lg"
                variant="outline"
                className="rounded-full border-white bg-transparent text-white hover:bg-white hover:text-primary"
              >
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="mr-2 h-4 w-4" />

                  {cta.secondary_button_text}
                </a>
              </Button>
            )}
          </div>
        </div>
      </Container>
    </Section>
  );
}
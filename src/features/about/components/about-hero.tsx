"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/common/container";
import { Section } from "@/components/common/section";

interface SiteSettings {
  about_hero_eyebrow: string;
  about_hero_title: string;
  about_hero_description: string;
  about_hero_image: string;
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:8000";

const FALLBACK_IMAGE =
  "/images/about/about-hero.jpg";

export function AboutHero() {
  const [settings, setSettings] =
    useState<SiteSettings | null>(null);

  const [loading, setLoading] =
    useState(true);

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
            "Failed to fetch Site Settings",
          );
        }

        const data: SiteSettings =
          await response.json();

        if (!cancelled) {
          setSettings(data);
        }
      } catch (error) {
        console.error(
          "Failed to load About Hero Site Settings:",
          error,
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchSiteSettings();

    return () => {
      cancelled = true;
    };
  }, []);

  /*
   * ============================================================
   * ADMIN-CONTROLLED CONTENT
   *
   * If a field is empty, we use the original About Hero
   * content as a fallback.
   * ============================================================
   */

  const eyebrow =
    settings?.about_hero_eyebrow?.trim() ||
    "About Meenakshi Screen";

  const title =
    settings?.about_hero_title?.trim() ||
    "Creating\nMoments That\nLast";

  const description =
    settings?.about_hero_description?.trim() ||
    "We bring together thoughtful design, quality printing, and careful craftsmanship to create products for life's most meaningful occasions.";

  const image =
    settings?.about_hero_image?.trim() ||
    FALLBACK_IMAGE;

  /*
   * ============================================================
   * LOADING STATE
   * ============================================================
   */

  if (loading) {
    return (
      <Section className="relative overflow-hidden pt-12 pb-16 lg:pt-20 lg:pb-24">
        <Container>
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
            {/* Left skeleton */}

            <div className="relative z-10">
              <div className="h-5 w-40 animate-pulse rounded bg-muted" />

              <div className="mt-6 space-y-3">
                <div className="h-14 w-full max-w-xl animate-pulse rounded bg-muted" />

                <div className="h-14 w-5/6 animate-pulse rounded bg-muted" />

                <div className="h-14 w-4/6 animate-pulse rounded bg-muted" />
              </div>

              <div className="mt-7 h-24 max-w-xl animate-pulse rounded bg-muted" />

              <div className="mt-9 h-11 w-32 animate-pulse rounded-full bg-muted" />
            </div>

            {/* Image skeleton */}

            <div className="overflow-hidden rounded-[2rem] bg-muted p-2">
              <div className="aspect-[4/3] animate-pulse rounded-[1.6rem] bg-muted-foreground/10" />
            </div>
          </div>
        </Container>
      </Section>
    );
  }

  return (
    <Section className="relative overflow-hidden pt-12 pb-16 lg:pt-20 lg:pb-24">
      {/* ==================================================
          AMBIENT BACKGROUND
      ================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          -left-40
          top-10
          h-80
          w-80
          rounded-full
          bg-primary/7
          blur-3xl
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          -right-40
          bottom-0
          h-96
          w-96
          rounded-full
          bg-[#c6a15b]/8
          blur-3xl
        "
      />

      <Container>
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          {/* ==================================================
              LEFT CONTENT
          ================================================== */}

          <div className="relative z-10">
            {/* Eyebrow */}

            {eyebrow && (
              <p
                className="
                  text-sm
                  font-semibold
                  uppercase
                  tracking-[0.3em]
                  text-primary
                "
              >
                {eyebrow}
              </p>
            )}

            {/* Title */}

            <h1
              className="
                mt-5
                max-w-xl
                whitespace-pre-line
                font-heading
                text-5xl
                leading-[1.05]
                text-foreground
                sm:text-6xl
                lg:text-7xl
              "
            >
              {title}
            </h1>

            {/* Description */}

            {description && (
              <p
                className="
                  mt-7
                  max-w-xl
                  text-lg
                  leading-8
                  text-muted-foreground
                "
              >
                {description}
              </p>
            )}

            {/* Existing CTA */}

            <div className="mt-9">
              <Button
                size="lg"
                asChild
                className="
                  rounded-full
                  px-7
                  shadow-[0_8px_30px_rgba(122,31,43,0.18)]
                  transition-all
                  duration-300
                  hover:-translate-y-1
                  hover:shadow-[0_12px_40px_rgba(122,31,43,0.30)]
                "
              >
                <Link href="/enquiry">
                  Talk to Us
                </Link>
              </Button>
            </div>
          </div>

          {/* ==================================================
              RIGHT IMAGE GLASS FRAME
          ================================================== */}

          <div
            className="
              glass
              group
              relative
              overflow-hidden
              rounded-[2rem]
              p-2
            "
          >
            {/* Burgundy glow */}

            <div
              className="
                pointer-events-none
                absolute
                -right-24
                -top-24
                z-20
                h-64
                w-64
                rounded-full
                bg-primary/12
                blur-3xl
              "
            />

            {/* Champagne glow */}

            <div
              className="
                pointer-events-none
                absolute
                -bottom-24
                -left-24
                z-20
                h-64
                w-64
                rounded-full
                bg-[#c6a15b]/12
                blur-3xl
              "
            />

            <div
              className="
                relative
                aspect-[4/3]
                overflow-hidden
                rounded-[1.6rem]
                bg-muted
              "
            >
              <Image
                src={image}
                alt={
                  title.replace(
                    /\n/g,
                    " ",
                  ) ||
                  "Meenakshi Screen"
                }
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="
                  object-cover
                  transition-transform
                  duration-700
                  ease-out
                  group-hover:scale-[1.025]
                "
              />

              <div
                className="
                  pointer-events-none
                  absolute
                  inset-0
                  bg-gradient-to-br
                  from-white/10
                  via-transparent
                  to-primary/10
                "
              />

              <div
                className="
                  pointer-events-none
                  absolute
                  left-1/2
                  top-0
                  z-30
                  h-px
                  w-2/3
                  -translate-x-1/2
                  bg-gradient-to-r
                  from-transparent
                  via-white/35
                  to-transparent
                "
              />
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
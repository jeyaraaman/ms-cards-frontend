"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/common/container";
import { Section } from "@/components/common/section";
import { getImageUrl } from "@/lib/image-url";

/* ============================================================
   TYPES
============================================================ */

interface HeroData {
  id: number;
  eyebrow: string;
  title: string;
  description: string;

  primary_button_text: string;
  primary_button_link: string;

  secondary_button_text: string;
  secondary_button_link: string;

  image: string;
  active: boolean;
}

interface SiteSettings {
  home_hero_eyebrow: string;
  home_hero_title: string;
  home_hero_description: string;
  home_hero_image: string;
}

/* ============================================================
   API
============================================================ */

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:8000";

/* ============================================================
   HOME HERO
============================================================ */

export function Hero() {
  const [hero, setHero] =
    useState<HeroData | null>(null);

  const [siteSettings, setSiteSettings] =
    useState<SiteSettings | null>(null);

  const [loading, setLoading] =
    useState(true);

  /* ==========================================================
     FETCH HERO DATA
  ========================================================== */

  useEffect(() => {
    let cancelled = false;

    async function fetchHeroData() {
      try {
        /* ======================================================
           LOAD HERO
        ====================================================== */

        const heroResponse =
          await fetch(
            `${API_URL}/api/hero/`,
            {
              cache: "no-store",
            },
          );

        if (!heroResponse.ok) {
          throw new Error(
            "Failed to fetch hero",
          );
        }

        const heroData: HeroData[] =
          await heroResponse.json();

        /* ======================================================
           LOAD SITE SETTINGS
        ====================================================== */

        const settingsResponse =
          await fetch(
            `${API_URL}/api/site-settings/`,
            {
              cache: "no-store",
            },
          );

        if (!settingsResponse.ok) {
          throw new Error(
            "Failed to fetch site settings",
          );
        }

        const settingsData: SiteSettings =
          await settingsResponse.json();

        if (cancelled) {
          return;
        }

        setHero(
          heroData[0] ?? null,
        );

        setSiteSettings(
          settingsData,
        );
      } catch (error) {
        console.error(
          "Failed to load Home Hero:",
          error,
        );

        /* ====================================================
           FALLBACK

           If Site Settings fails, still try to
           load the original Hero data.
        ==================================================== */

        if (!cancelled) {
          try {
            const fallbackResponse =
              await fetch(
                `${API_URL}/api/hero/`,
                {
                  cache: "no-store",
                },
              );

            if (
              fallbackResponse.ok
            ) {
              const fallbackData: HeroData[] =
                await fallbackResponse.json();

              setHero(
                fallbackData[0] ?? null,
              );
            }
          } catch (
            fallbackError
          ) {
            console.error(
              "Failed to load fallback hero:",
              fallbackError,
            );
          }
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchHeroData();

    return () => {
      cancelled = true;
    };
  }, []);

  /* ==========================================================
     LOADING STATE
  ========================================================== */

  if (loading) {
    return (
      <Section
        className="
          pt-24
          pb-16
          lg:pt-20
          lg:pb-24
        "
      >
        <Container>
          <div
            className="
              grid
              items-center
              gap-12
              lg:grid-cols-2
              lg:gap-20
            "
          >
            {/* ==================================================
                LEFT SKELETON
            ================================================== */}

            <div>
              <div
                className="
                  h-5
                  w-32
                  animate-pulse
                  rounded
                  bg-muted
                "
              />

              <div
                className="
                  mt-6
                  space-y-3
                "
              >
                <div
                  className="
                    h-12
                    w-full
                    animate-pulse
                    rounded
                    bg-muted
                  "
                />

                <div
                  className="
                    h-12
                    w-5/6
                    animate-pulse
                    rounded
                    bg-muted
                  "
                />

                <div
                  className="
                    h-12
                    w-4/6
                    animate-pulse
                    rounded
                    bg-muted
                  "
                />
              </div>

              <div
                className="
                  mt-8
                  h-20
                  max-w-xl
                  animate-pulse
                  rounded
                  bg-muted
                "
              />

              <div
                className="
                  mt-10
                  flex
                  gap-4
                "
              >
                <div
                  className="
                    h-11
                    w-40
                    animate-pulse
                    rounded
                    bg-muted
                  "
                />

                <div
                  className="
                    h-11
                    w-40
                    animate-pulse
                    rounded
                    bg-muted
                  "
                />
              </div>
            </div>

            {/* ==================================================
                RIGHT IMAGE SKELETON
            ================================================== */}

            <div
              className="
                relative
                w-full
              "
            >
              <div
                className="
                  glass
                  relative
                  aspect-[4/3]
                  w-full
                  overflow-hidden
                  rounded-[2rem]
                  p-2
                "
              >
                <div
                  className="
                    h-full
                    w-full
                    animate-pulse
                    rounded-[1.6rem]
                    bg-muted
                  "
                />
              </div>
            </div>
          </div>
        </Container>
      </Section>
    );
  }

  /* ==========================================================
     NO HERO
  ========================================================== */

  if (!hero) {
    return null;
  }

  /* ============================================================
     SITE SETTINGS OVERRIDE

     Site Settings values take priority.

     If a Site Settings value is empty,
     the original Hero value is used.
  ============================================================ */

  const eyebrow =
    siteSettings?.home_hero_eyebrow?.trim() ||
    hero.eyebrow;

  const title =
    siteSettings?.home_hero_title?.trim() ||
    hero.title;

  const description =
    siteSettings?.home_hero_description?.trim() ||
    hero.description;

  const image =
    siteSettings?.home_hero_image?.trim() ||
    hero.image;

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <Section
      className="
        relative
        overflow-hidden
        pt-12
        pb-16
        lg:pt-20
        lg:pb-24
      "
    >
      {/* ======================================================
          AMBIENT PAGE GLOW
      ====================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          -left-48
          top-10
          h-96
          w-96
          rounded-full
          bg-primary/5
          blur-3xl
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          -right-48
          top-1/3
          h-96
          w-96
          rounded-full
          bg-[#c6a15b]/5
          blur-3xl
        "
      />

      <Container>
        <div
          className="
            grid
            items-center
            gap-12
            lg:grid-cols-2
            lg:gap-20
          "
        >
          {/* ==================================================
              LEFT CONTENT
          ================================================== */}

          <div>
            {/* ==================================================
                EYEBROW
            ================================================== */}

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

            {/* ==================================================
                TITLE
            ================================================== */}

            <h1
              className="
                mt-5
                max-w-2xl
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

            {/* ==================================================
                DESCRIPTION
            ================================================== */}

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

            {/* ==================================================
                HERO BUTTONS
            ================================================== */}

            <div
              className="
                mt-9
                flex
                flex-wrap
                items-center
                gap-4
              "
            >
              {/* ==================================================
                  PRIMARY BUTTON
              ================================================== */}

              {hero.primary_button_text && (
                <Button
                  size="lg"
                  asChild
                  className="
                    rounded-xl
                    transition-all
                    duration-300
                    hover:-translate-y-0.5
                    hover:shadow-lg
                  "
                >
                  <Link
                    href={
                      hero.primary_button_link ||
                      "/catalogue"
                    }
                  >
                    {
                      hero.primary_button_text
                    }
                  </Link>
                </Button>
              )}

              {/* ==================================================
                  SECONDARY BUTTON
              ================================================== */}

              {hero.secondary_button_text && (
                <Button
                  variant="outline"
                  size="lg"
                  asChild
                  className="
                    rounded-xl
                    transition-all
                    duration-300
                    hover:-translate-y-0.5
                    hover:border-primary/40
                    hover:bg-primary/5
                    hover:shadow-md
                  "
                >
                  <Link
                    href={
                      hero.secondary_button_link ||
                      "/enquiry"
                    }
                  >
                    {
                      hero.secondary_button_text
                    }
                  </Link>
                </Button>
              )}
            </div>
          </div>

          {/* ==================================================
              RIGHT HERO IMAGE
          ================================================== */}

          <div
            className="
              relative
              w-full
            "
          >
            {/* ==================================================
                BURGUNDY OUTER GLOW
            ================================================== */}

            <div
              className="
                pointer-events-none
                absolute
                -right-16
                -top-16
                z-0
                h-56
                w-56
                rounded-full
                bg-primary/10
                blur-3xl
                transition-all
                duration-700
              "
            />

            {/* ==================================================
                CHAMPAGNE OUTER GLOW
            ================================================== */}

            <div
              className="
                pointer-events-none
                absolute
                -bottom-16
                -left-16
                z-0
                h-56
                w-56
                rounded-full
                bg-[#c6a15b]/10
                blur-3xl
                transition-all
                duration-700
              "
            />

            {/* ==================================================
                PREMIUM GLASS FRAME

                Same visual language as Premium Hero.
            ================================================== */}

            <div
              className="
                glass
                group
                relative
                z-10
                aspect-[4/3]
                w-full
                overflow-hidden
                rounded-[2rem]
                p-2
                transition-all
                duration-500
                hover:-translate-y-1
                hover:shadow-[0_24px_70px_rgba(122,31,43,0.18)]
              "
            >
              {/* ==================================================
                  IMAGE CONTAINER
              ================================================== */}

              <div
                className="
                  relative
                  h-full
                  w-full
                  overflow-hidden
                  rounded-[1.6rem]
                  bg-muted
                "
              >
                {/* ==================================================
                    IMAGE
                ================================================== */}

                {image ? (
                  <Image
                    src={getImageUrl(image)}
                    alt={
                      title ||
                      "Meenakshi Screen Printers & Cards"
                    }
                    fill
                    priority
                    sizes="
                      (max-width: 1024px) 100vw,
                      50vw
                    "
                    className="
                      object-cover
                      transition-transform
                      duration-1000
                      ease-out
                      group-hover:scale-[1.045]
                    "
                  />
                ) : (
                  <div
                    className="
                      flex
                      h-full
                      w-full
                      items-center
                      justify-center
                      px-8
                      text-center
                    "
                  >
                    <div>
                      <p
                        className="
                          text-sm
                          font-semibold
                          uppercase
                          tracking-[0.25em]
                          text-primary
                        "
                      >
                        Meenakshi Screen
                      </p>

                      <p
                        className="
                          mt-4
                          font-heading
                          text-3xl
                          text-foreground
                        "
                      >
                        Crafting Invitations
                        <br />
                        That Become
                        <br />
                        Lifetime Memories
                      </p>
                    </div>
                  </div>
                )}

                {/* ==================================================
                    IMAGE LIGHT OVERLAY
                ================================================== */}

                <div
                  className="
                    pointer-events-none
                    absolute
                    inset-0
                    bg-gradient-to-br
                    from-white/10
                    via-transparent
                    to-primary/10
                    opacity-70
                    transition-opacity
                    duration-500
                    group-hover:opacity-100
                  "
                />

                {/* ==================================================
                    IMAGE SHINE
                ================================================== */}

                <div
                  className="
                    pointer-events-none
                    absolute
                    inset-0
                    bg-gradient-to-r
                    from-transparent
                    via-white/5
                    to-transparent
                    opacity-0
                    transition-opacity
                    duration-700
                    group-hover:opacity-100
                  "
                />

                {/* ==================================================
                    INNER GLASS BORDER
                ================================================== */}

                <div
                  className="
                    pointer-events-none
                    absolute
                    inset-0
                    rounded-[1.6rem]
                    ring-1
                    ring-inset
                    ring-white/10
                    transition-all
                    duration-500
                    group-hover:ring-white/20
                  "
                />
              </div>

              {/* ==================================================
                  TOP RIGHT AMBIENT GLOW
              ================================================== */}

              <div
                className="
                  pointer-events-none
                  absolute
                  -right-20
                  -top-20
                  z-20
                  h-48
                  w-48
                  rounded-full
                  bg-primary/10
                  blur-3xl
                  opacity-60
                  transition-all
                  duration-700
                  group-hover:scale-125
                  group-hover:opacity-100
                "
              />

              {/* ==================================================
                  BOTTOM LEFT AMBIENT GLOW
              ================================================== */}

              <div
                className="
                  pointer-events-none
                  absolute
                  -bottom-20
                  -left-20
                  z-20
                  h-48
                  w-48
                  rounded-full
                  bg-[#c6a15b]/10
                  blur-3xl
                  opacity-60
                  transition-all
                  duration-700
                  group-hover:scale-125
                  group-hover:opacity-100
                "
              />
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
"use client";

import Image from "next/image";
import { ArrowRight } from "lucide-react";

import { Container } from "@/components/common/container";
import { Section } from "@/components/common/section";
import { getImageUrl } from "@/lib/image-url";

interface AccessoriesHeroProps {
  image?: string;
}

export function AccessoriesHero({
  image,
}: AccessoriesHeroProps) {
  const handleExploreAccessories = () => {
    const target =
      document.getElementById(
        "accessories-services",
      );

    if (!target) {
      return;
    }

    const headerOffset = 100;

    const targetPosition =
      target.getBoundingClientRect().top +
      window.scrollY -
      headerOffset;

    window.scrollTo({
      top: targetPosition,
      behavior: "smooth",
    });

    window.history.replaceState(
      null,
      "",
      "#accessories-services",
    );
  };

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
            <p
              className="
                text-sm
                font-semibold
                uppercase
                tracking-[0.3em]
                text-primary
              "
            >
              Accessories
            </p>

            <h1
              className="
                mt-5
                max-w-xl
                font-heading
                text-5xl
                leading-[1.05]
                text-foreground
                sm:text-6xl
                lg:text-7xl
              "
            >
              Complete Your
              <br />
              Celebration
            </h1>

            <p
              className="
                mt-7
                max-w-xl
                text-lg
                leading-8
                text-muted-foreground
              "
            >
              Thoughtfully crafted accessories to
              complement your invitations and make
              every celebration even more special.
            </p>

            {/* ==================================================
                EXPLORE BUTTON
            ================================================== */}

            <div className="mt-9 flex items-center">
              <button
                type="button"
                onClick={
                  handleExploreAccessories
                }
                className="
                  group
                  inline-flex
                  items-center
                  gap-2
                  rounded-full
                  bg-primary
                  px-7
                  py-3.5
                  text-sm
                  font-semibold
                  text-primary-foreground
                  shadow-[0_8px_30px_rgba(122,31,43,0.18)]
                  transition-all
                  duration-300
                  hover:-translate-y-1
                  hover:bg-primary/90
                  hover:shadow-[0_12px_40px_rgba(122,31,43,0.30)]
                "
              >
                Explore Accessories

                <ArrowRight
                  className="
                    h-4
                    w-4
                    transition-transform
                    duration-300
                    group-hover:translate-x-1
                  "
                />
              </button>
            </div>
          </div>

          {/* ==================================================
              RIGHT GLASS IMAGE
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
                transition-opacity
                duration-500
                group-hover:opacity-80
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

            {/* ==================================================
                IMAGE CONTAINER
            ================================================== */}

            <div
              className="
                relative
                aspect-[4/3]
                overflow-hidden
                rounded-[1.6rem]
                bg-muted
              "
            >
              {image ? (
                <Image
                  src={getImageUrl(image)}
                  alt="Wedding and invitation accessories"
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
              ) : (
                <div
                  className="
                    flex
                    h-full
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
                      Accessories
                    </p>

                    <p
                      className="
                        mt-4
                        font-heading
                        text-3xl
                        text-foreground
                      "
                    >
                      Complete Your
                      <br />
                      Celebration
                    </p>
                  </div>
                </div>
              )}

              {/* Image glass overlay */}

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

              {/* Top glass highlight */}

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
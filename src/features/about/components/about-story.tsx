import {
  Headset,
  Pencil,
  Printer,
} from "lucide-react";

import { Container } from "@/components/common/container";
import { Section } from "@/components/common/section";

const storyPoints = [
  {
    title: "Thoughtful Design",
    description:
      "Designs that balance traditional elegance with contemporary styles.",
    icon: Pencil,
  },
  {
    title: "Quality Printing",
    description:
      "Careful attention to materials, printing, finishing, and presentation.",
    icon: Printer,
  },
  {
    title: "Personal Service",
    description:
      "We work closely with customers to understand their requirements and deliver the right result.",
    icon: Headset,
  },
];

export function AboutStory() {
  return (
    <Section className="relative overflow-hidden pt-16 pb-20 lg:pt-20 lg:pb-28">
      {/* ==================================================
          AMBIENT BACKGROUND
      ================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          -left-40
          top-1/3
          h-80
          w-80
          rounded-full
          bg-primary/6
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
          bg-[#c6a15b]/7
          blur-3xl
        "
      />

      <Container>
        <div className="grid items-center gap-12 lg:grid-cols-[0.9fr_1.5fr] lg:gap-20">
          {/* ==================================================
              LEFT — STORY TEXT
              NO GLASS BOX
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
              Our Story
            </p>

            <h2
              className="
                mt-5
                max-w-xl
                font-heading
                text-4xl
                leading-[1.08]
                text-foreground
                sm:text-5xl
                lg:text-6xl
              "
            >
              More Than Just
              <br />
              Printing
            </h2>

            <p
              className="
                mt-7
                max-w-xl
                text-base
                leading-8
                text-muted-foreground
                lg:text-lg
              "
            >
              At Meenakshi Screen, every design is created
              with the occasion in mind. From elegant
              invitations to everyday business
              printing, we focus on quality, detail,
              and a finished product our customers can
              be proud of.
            </p>
          </div>

          {/* ==================================================
              RIGHT — STORY CARDS
          ================================================== */}

          <div className="relative z-10 grid gap-6 md:grid-cols-3">
            {storyPoints.map((point) => {
              const Icon = point.icon;

              return (
                <article
                  key={point.title}
                  className="
                    glass
                    group
                    relative
                    overflow-hidden
                    rounded-3xl
                    p-7
                    transition-all
                    duration-500
                    hover:-translate-y-2
                    hover:border-[#c6a15b]/25
                    hover:shadow-[0_20px_50px_rgba(122,31,43,0.14)]
                  "
                >
                  {/* Burgundy glow */}

                  <div
                    className="
                      pointer-events-none
                      absolute
                      -right-16
                      -top-16
                      h-32
                      w-32
                      rounded-full
                      bg-primary/8
                      opacity-0
                      blur-3xl
                      transition-opacity
                      duration-500
                      group-hover:opacity-100
                    "
                  />

                  {/* Top highlight */}

                  <div
                    className="
                      pointer-events-none
                      absolute
                      left-1/2
                      top-0
                      h-px
                      w-2/3
                      -translate-x-1/2
                      bg-gradient-to-r
                      from-transparent
                      via-white/25
                      to-transparent
                    "
                  />

                  <div className="relative z-10">
                    {/* Icon */}

                    <div
                      className="
                        flex
                        h-16
                        w-16
                        items-center
                        justify-center
                        rounded-full
                        border
                        border-[#c6a15b]/50
                        text-[#c6a15b]
                        transition-all
                        duration-300
                        group-hover:scale-105
                        group-hover:bg-[#c6a15b]/10
                      "
                    >
                      <Icon className="h-7 w-7" />
                    </div>

                    {/* Title */}

                    <h3
                      className="
                        mt-7
                        font-heading
                        text-2xl
                        leading-tight
                        text-foreground
                      "
                    >
                      {point.title}
                    </h3>

                    {/* Description */}

                    <p
                      className="
                        mt-4
                        text-sm
                        leading-7
                        text-muted-foreground
                      "
                    >
                      {point.description}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </Container>
    </Section>
  );
}
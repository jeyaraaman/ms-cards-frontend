import {
  Diamond,
  PenLine,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import { Container } from "@/components/common/container";
import { Section } from "@/components/common/section";

const values = [
  {
    title: "Quality",
    description:
      "We pay attention to the details that make a printed product feel special.",
    icon: Diamond,
  },
  {
    title: "Craftsmanship",
    description:
      "Every finish and presentation is handled with care.",
    icon: PenLine,
  },
  {
    title: "Reliability",
    description:
      "We aim to provide consistent service and dependable results.",
    icon: ShieldCheck,
  },
  {
    title: "Customer First",
    description:
      "We listen to what each customer needs before recommending a solution.",
    icon: UserRound,
  },
];

export function AboutValues() {
  return (
    <Section className="relative overflow-hidden pt-8 pb-20 lg:pt-12 lg:pb-24">
      {/* ==================================================
          AMBIENT BACKGROUND
      ================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          -left-48
          top-10
          h-96
          w-96
          rounded-full
          bg-primary/6
          blur-3xl
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          -right-48
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
              LEFT — VALUES TEXT
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
              What Matters To Us
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
              Built Around
              <br />
              Quality &amp; Trust
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
              Our approach is simple: understand the
              requirement, pay attention to the details,
              and deliver a finished product that feels
              right for the occasion.
            </p>
          </div>

          {/* ==================================================
              RIGHT — VALUE CARDS
          ================================================== */}

          <div className="relative z-10 grid gap-5 sm:grid-cols-2">
            {values.map((value, index) => {
              const Icon = value.icon;

              return (
                <article
                  key={value.title}
                  className="
                    glass
                    group
                    relative
                    min-h-[270px]
                    overflow-hidden
                    rounded-3xl
                    p-7
                    transition-all
                    duration-500
                    hover:-translate-y-2
                    hover:border-primary/20
                    hover:shadow-[0_20px_50px_rgba(122,31,43,0.14)]
                  "
                >
                  {/* Burgundy glow */}

                  <div
                    className="
                      pointer-events-none
                      absolute
                      -right-20
                      -top-20
                      h-40
                      w-40
                      rounded-full
                      bg-primary/8
                      opacity-0
                      blur-3xl
                      transition-opacity
                      duration-500
                      group-hover:opacity-100
                    "
                  />

                  {/* Top glass highlight */}

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

                  <div className="relative z-10 flex h-full flex-col">
                    {/* Number */}

                    <span
                      className="
                        text-sm
                        font-semibold
                        tracking-[0.25em]
                        text-primary
                      "
                    >
                      {String(index + 1).padStart(
                        2,
                        "0",
                      )}
                    </span>

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
                      {value.title}
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
                      {value.description}
                    </p>

                    {/* Icon */}

                    <div
                      className="
                        mt-auto
                        flex
                        h-14
                        w-14
                        items-center
                        justify-center
                        rounded-full
                        border
                        border-primary/30
                        bg-primary/10
                        text-primary
                        transition-all
                        duration-300
                        group-hover:scale-105
                        group-hover:border-primary/50
                        group-hover:bg-primary/15
                      "
                    >
                      <Icon className="h-6 w-6" />
                    </div>
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
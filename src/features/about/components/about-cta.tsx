import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/common/container";
import { Section } from "@/components/common/section";

export function AboutCTA() {
  return (
    <Section className="relative overflow-hidden">
      {/* ==================================================
          AMBIENT BACKGROUND
      ================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          left-1/2
          top-1/2
          h-96
          w-96
          -translate-x-1/2
          -translate-y-1/2
          rounded-full
          bg-primary/10
          blur-3xl
        "
      />

      <Container>
        <div
          className="
            glass
            group
            relative
            overflow-hidden
            rounded-3xl
            border-primary/20
            px-8
            py-16
            text-center
            transition-all
            duration-500
            hover:shadow-[0_25px_70px_rgba(122,31,43,0.16)]
            lg:px-16
          "
        >
          {/* ==================================================
              BURGUNDY GLOW
          ================================================== */}

          <div
            className="
              pointer-events-none
              absolute
              -left-32
              -top-32
              h-72
              w-72
              rounded-full
              bg-primary/15
              blur-3xl
              transition-opacity
              duration-500
              group-hover:opacity-80
            "
          />

          {/* ==================================================
              CHAMPAGNE GLOW
          ================================================== */}

          <div
            className="
              pointer-events-none
              absolute
              -bottom-32
              -right-32
              h-72
              w-72
              rounded-full
              bg-[#c6a15b]/15
              blur-3xl
              transition-opacity
              duration-500
              group-hover:opacity-80
            "
          />

          {/* ==================================================
              TOP HIGHLIGHT
          ================================================== */}

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
              via-primary/30
              to-transparent
            "
          />

          {/* ==================================================
              CONTENT
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
              Let&apos;s Work Together
            </p>

            <h2
              className="
                mt-5
                font-heading
                text-4xl
                text-foreground
                lg:text-5xl
              "
            >
              Have Something in Mind?
            </h2>

            <p
              className="
                mx-auto
                mt-5
                max-w-2xl
                text-sm
                leading-7
                text-muted-foreground
                lg:text-base
              "
            >
              Whether you need invitations,
              commercial printing, or
              celebration accessories, we&apos;d
              love to hear from you.
            </p>

            <div className="mt-8">
              <Button
                size="lg"
                asChild
                className="
                  rounded-full
                  bg-primary
                  px-8
                  text-primary-foreground
                  shadow-[0_8px_30px_rgba(122,31,43,0.20)]
                  transition-all
                  duration-300
                  hover:-translate-y-1
                  hover:bg-primary/90
                  hover:shadow-[0_12px_40px_rgba(122,31,43,0.35)]
                "
              >
                <Link href="/enquiry">
                  Make an Enquiry
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
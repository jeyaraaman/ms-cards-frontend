import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/common/container";
import { Section } from "@/components/common/section";

export function ContactForm() {
  return (
    <Section className="relative overflow-hidden pt-8 pb-20 lg:pt-12 lg:pb-28">
      <Container>
        <div
          className="
            glass
            group
            relative
            overflow-hidden
            rounded-[2rem]
            px-8
            py-12
            md:px-12
            lg:grid
            lg:grid-cols-2
            lg:items-center
            lg:px-16
            lg:py-16
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
              bg-primary/10
              blur-3xl
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
              h-80
              w-80
              rounded-full
              bg-[#c6a15b]/10
              blur-3xl
            "
          />

          {/* ==================================================
              DECORATIVE CIRCLES
          ================================================== */}

          <div
            className="
              pointer-events-none
              absolute
              -right-24
              -top-24
              h-64
              w-64
              rounded-full
              border
              border-primary/10
            "
          />

          <div
            className="
              pointer-events-none
              absolute
              -bottom-32
              right-10
              h-80
              w-80
              rounded-full
              border
              border-[#c6a15b]/10
            "
          />

          {/* ==================================================
              TOP GLASS HIGHLIGHT
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
              via-white/30
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
                tracking-[0.25em]
                text-primary
              "
            >
              Start A Conversation
            </p>

            <h2
              className="
                mt-4
                font-heading
                text-4xl
                leading-tight
                text-foreground
                lg:text-5xl
              "
            >
              Tell Us What
              <br />
              You Need
            </h2>

            <p
              className="
                mt-5
                max-w-xl
                text-sm
                leading-7
                text-muted-foreground
                lg:text-base
              "
            >
              Have a specific design, printing
              requirement, or custom request?
              Send us the details and our team can
              help you choose the right solution.
            </p>
          </div>

          {/* ==================================================
              BUTTON
          ================================================== */}

          <div
            className="
              relative
              z-10
              mt-8
              flex
              justify-start
              lg:mt-0
              lg:justify-end
            "
          >
            <Button
              size="lg"
              asChild
              className="
                group/button
                rounded-full
                px-8
                shadow-[0_8px_30px_rgba(122,31,43,0.18)]
                transition-all
                duration-300
                hover:-translate-y-1
                hover:shadow-[0_12px_40px_rgba(122,31,43,0.30)]
              "
            >
              <Link href="/enquiry">
                Send An Enquiry

                <span
                  className="
                    ml-2
                    transition-transform
                    duration-300
                    group-hover/button:translate-x-1
                  "
                >
                  →
                </span>
              </Link>
            </Button>
          </div>
        </div>
      </Container>
    </Section>
  );
}
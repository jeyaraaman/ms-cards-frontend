import { Container } from "@/components/common/container";
import { Section } from "@/components/common/section";

export function ContactHero() {
  return (
    <Section className="relative overflow-hidden pt-24 pb-16 lg:pt-25 lg:pb-20">
      {/* ==================================================
          AMBIENT BACKGROUND
      ================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          -left-40
          top-0
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
          h-80
          w-80
          rounded-full
          bg-[#c6a15b]/7
          blur-3xl
        "
      />

      <Container>
        <div
          className="
            glass
            relative
            mx-auto
            max-w-4xl
            overflow-hidden
            rounded-[2rem]
            px-7
            py-14
            text-center
            md:px-12
            lg:px-16
            lg:py-16
          "
        >
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
              -left-28
              -bottom-28
              h-72
              w-72
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
                tracking-[0.3em]
                text-primary
              "
            >
              Contact Us
            </p>

            <h1
              className="
                mt-5
                font-heading
                text-5xl
                leading-[1.05]
                text-foreground
                lg:text-7xl
              "
            >
              Let&apos;s Talk About
              <br />
              Your Requirement
            </h1>

            <p
              className="
                mx-auto
                mt-7
                max-w-2xl
                text-lg
                leading-8
                text-muted-foreground
              "
            >
              Whether you are looking for invitations,
              commercial printing, or celebration
              accessories, our team is here to help.
            </p>
          </div>
        </div>
      </Container>
    </Section>
  );
}
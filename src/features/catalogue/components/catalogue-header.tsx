import { Container } from "@/components/common/container";
import { Section } from "@/components/common/section";
import { SectionHeading } from "@/components/common/section-heading";

export function CatalogueHeader() {
  return (
    <Section className="pb-8 pt-16 md:pt-20">
      <Container>
        <div
          className="
            glass
            relative
            overflow-hidden
            rounded-3xl
            px-6
            py-10
            md:px-10
            md:py-12
          "
        >
          {/* ================================================== */}
          {/* SUBTLE BURGUNDY LIGHT */}
          {/* ================================================== */}

          <div
            className="
              pointer-events-none
              absolute
              -right-24
              -top-24
              h-56
              w-56
              rounded-full
              bg-primary/10
              blur-3xl
            "
          />

          {/* ================================================== */}
          {/* SUBTLE CHAMPAGNE LIGHT */}
          {/* ================================================== */}

          <div
            className="
              pointer-events-none
              absolute
              -bottom-28
              -left-20
              h-52
              w-52
              rounded-full
              bg-[#c6a15b]/10
              blur-3xl
            "
          />

          {/* ================================================== */}
          {/* HEADING */}
          {/* ================================================== */}

          <div className="relative z-10">
            <SectionHeading
              eyebrow="Our Catalogue"
              title="Discover Your Perfect Invitation"
              description="Explore our curated collection of premium wedding invitations, crafted with elegant materials and refined printing techniques."
            />
          </div>
        </div>
      </Container>
    </Section>
  );
}
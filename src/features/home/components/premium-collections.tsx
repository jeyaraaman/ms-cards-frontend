import { CollectionCard } from "@/components/common/collection-card";
import { Container } from "@/components/common/container";
import { Section } from "@/components/common/section";
import { SectionHeading } from "@/components/common/section-heading";
import { premiumCollections } from "@/data/premium-collections";

export function PremiumCollections() {
  return (
    <Section>
      <Container>
        <SectionHeading
          eyebrow="Luxury Collection"
          title="Premium Invitation Collections"
          description="Discover our finest invitation collections crafted with premium materials and exceptional finishes."
        />

        <div className="mt-16 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {premiumCollections.map((collection) => (
            <CollectionCard
              key={collection.id}
              collection={collection}
            />
          ))}
        </div>
      </Container>
    </Section>
  );
}
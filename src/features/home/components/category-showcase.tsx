import { CategoryCard } from "@/components/common/category-card";
import { Container } from "@/components/common/container";
import { Section } from "@/components/common/section";
import { SectionHeading } from "@/components/common/section-heading";
import { categories } from "@/data/categories";

export function CategoryShowcase() {
  return (
    <Section>
      <Container>
        <SectionHeading
          eyebrow="Collections"
          title="Find the Perfect Invitation"
          description="Explore our beautifully crafted invitation collections designed for every celebration."
        />

        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
            />
          ))}
        </div>
      </Container>
    </Section>
  );
}
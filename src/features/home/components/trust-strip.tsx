import { Container } from "@/components/common/container";
import { Section } from "@/components/common/section";
import { trustItems } from "@/data/trust";

export function TrustStrip() {
  return (
    <Section className="py-12">
      <Container>
        <div className="grid gap-6 rounded-3xl border bg-card p-8 md:grid-cols-2 lg:grid-cols-4">
          {trustItems.map((item) => (
            <div key={item.id} className="text-center">
              <h3 className="text-3xl font-bold text-primary">
                {item.value}
              </h3>

              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}
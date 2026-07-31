import { Button } from "@/components/ui/button";
import { Container } from "@/components/common/container";
import { Section } from "@/components/common/section";

export function Hero() {
  return (
    <Section className="pt-24 lg:pt-32">
      <Container>
        <div className="grid items-center gap-16 lg:grid-cols-2">
          {/* Left Content */}
          <div>
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-primary">
              Since 1997
            </p>

            <h1 className="text-5xl font-bold leading-tight lg:text-7xl">
              Crafting Invitations
              <br />
              That Become
              <br />
              Lifetime Memories
            </h1>

            <p className="mt-8 max-w-xl text-lg leading-8 text-muted-foreground">
              One Day Invitation – Lifetime Connection.
              Premium wedding invitations and luxury printing
              solutions crafted for unforgettable celebrations.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <Button size="lg">
                Explore Collection
              </Button>

              <Button
                variant="outline"
                size="lg"
              >
                Make an Enquiry
              </Button>
            </div>
          </div>

          {/* Right Side */}
          <div className="flex justify-center">
            <div className="aspect-square w-full max-w-md rounded-3xl border bg-muted" />
          </div>
        </div>
      </Container>
    </Section>
  );
}
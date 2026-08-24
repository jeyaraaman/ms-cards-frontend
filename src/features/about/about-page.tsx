import { AboutHero } from "./components/about-hero";
import { AboutStory } from "./components/about-story";
import { AboutValues } from "./components/about-values";
import { AboutCTA } from "./components/about-cta";

export function AboutPage() {
  return (
    <main>
      <AboutHero />
      <AboutStory />
      <AboutValues />
      <AboutCTA />
    </main>
  );
}
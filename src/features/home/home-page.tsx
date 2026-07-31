import { Hero } from "./components/hero";
import { TrustStrip } from "./components/trust-strip";
import { CategoryShowcase } from "./components/category-showcase";
import { PremiumCollections } from "./components/premium-collections";

export function HomePage() {
  return (
    <>
      <Hero />
      <TrustStrip />
      <CategoryShowcase />
      <PremiumCollections />
    </>
  );
}
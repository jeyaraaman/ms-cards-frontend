import { Hero } from "./components/hero";
import { TrustStrip } from "./components/trust-strip";
import { CategoryShowcase } from "./components/category-showcase";

export function HomePage() {
  return (
    <>
      <Hero />
      <TrustStrip />
      <CategoryShowcase />
    </>
  );
}
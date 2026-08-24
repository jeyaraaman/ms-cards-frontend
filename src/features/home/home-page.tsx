import { Hero } from "./components/hero";
import { TrustStrip } from "./components/trust-strip";
import { CategoryShowcase } from "./components/category-showcase";
import { PremiumCollections } from "./components/premium-collections";
import { WhyChooseUs } from "./components/why-choose-us";
import { HowItWorks } from "./components/how-it-works";
import { FeaturedProducts } from "./components/featured-products";
import { CtaBanner } from "./components/cta-banner";

export function HomePage() {
  return (
    <>
      <Hero />
      <TrustStrip />
      <CategoryShowcase />
      <PremiumCollections />
      <WhyChooseUs />
      <FeaturedProducts />
      <HowItWorks />
      <CtaBanner />
    </>
  );
}
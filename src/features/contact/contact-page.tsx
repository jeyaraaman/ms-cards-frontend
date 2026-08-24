import { ContactHero } from "./components/contact-hero";
import { ContactDetails } from "./components/contact-details";
import { ContactForm } from "./components/contact-form";

export function ContactPage() {
  return (
    <main>
      <ContactHero />
      <ContactDetails />
      <ContactForm />
    </main>
  );
}
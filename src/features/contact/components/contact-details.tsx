import {
  Mail,
  MapPin,
  Phone,
} from "lucide-react";

import { Container } from "@/components/common/container";
import { Section } from "@/components/common/section";
import { SectionHeading } from "@/components/common/section-heading";

function InstagramIcon({
  className,
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect
        x="3"
        y="3"
        width="18"
        height="18"
        rx="5"
      />

      <circle
        cx="12"
        cy="12"
        r="4"
      />

      <circle
        cx="17.5"
        cy="6.5"
        r="0.8"
        fill="currentColor"
        stroke="none"
      />
    </svg>
  );
}

const contactDetails = [
  {
    title: "Visit Us",
    description:
      "Come visit our showroom and explore our designs and printing options.",
    value:
      "31-B/1, Manjanakara St, near KMT Lorry Service, South Gate, Madurai Main, Madurai, Tamil Nadu 625001",
    icon: MapPin,
    href: "https://share.google/naKAV6juHnGbLa9zr",
    action: "View on Google Maps",
    external: true,
  },
  {
    title: "Call Us",
    description:
      "Speak directly with our team about your requirement.",
    value: "+91 72006 76070",
    icon: Phone,
    href: "tel:+917200676070",
    action: "Call Meenakshi Screen",
    external: false,
  },
  {
    title: "Email Us",
    description:
      "Send us your requirement and we will get back to you.",
    value: "ms.cardsmdu@gmail.com",
    icon: Mail,
    href: "mailto:ms.cardsmdu@gmail.com",
    action: "Send an Email",
    external: false,
  },
  {
    title: "Instagram",
    description:
      "Follow Meenakshi Screen for our latest designs, creations, and updates.",
    value: "@meenakshiscreen_cards",
    icon: InstagramIcon,
    href: "https://www.instagram.com/meenakshiscreen_cards?igsh=eXpuejFldTlmMnho",
    action: "Visit Instagram",
    external: true,
  },
];

export function ContactDetails() {
  return (
    <Section className="relative overflow-hidden">
      {/* ==================================================
          AMBIENT BACKGROUND
      ================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          -left-40
          top-1/2
          h-80
          w-80
          -translate-y-1/2
          rounded-full
          bg-primary/5
          blur-3xl
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          -right-40
          top-1/3
          h-80
          w-80
          rounded-full
          bg-[#c6a15b]/6
          blur-3xl
        "
      />

      <Container>
        <SectionHeading
          eyebrow="Get In Touch"
          title="We'd Love To Hear From You"
          description="Choose the most convenient way to reach our team."
        />

        {/* ==================================================
            CONTACT CARDS
        ================================================== */}

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {contactDetails.map((detail) => {
            const Icon = detail.icon;

            return (
              <a
                key={detail.title}
                href={detail.href}
                target={
                  detail.external ? "_blank" : undefined
                }
                rel={
                  detail.external
                    ? "noopener noreferrer"
                    : undefined
                }
                className="group block h-full"
              >
                <article
                  className="
                    glass
                    relative
                    h-full
                    min-h-[330px]
                    overflow-hidden
                    rounded-3xl
                    p-7
                    transition-all
                    duration-500
                    group-hover:-translate-y-2
                    group-hover:border-primary/20
                    group-hover:shadow-[0_20px_50px_rgba(122,31,43,0.14)]
                  "
                >
                  {/* ==================================================
                      CARD GLOW
                  ================================================== */}

                  <div
                    className="
                      pointer-events-none
                      absolute
                      -right-20
                      -top-20
                      h-40
                      w-40
                      rounded-full
                      bg-primary/8
                      opacity-0
                      blur-3xl
                      transition-opacity
                      duration-500
                      group-hover:opacity-100
                    "
                  />

                  {/* ==================================================
                      TOP HIGHLIGHT
                  ================================================== */}

                  <div
                    className="
                      pointer-events-none
                      absolute
                      left-1/2
                      top-0
                      h-px
                      w-2/3
                      -translate-x-1/2
                      bg-gradient-to-r
                      from-transparent
                      via-white/25
                      to-transparent
                    "
                  />

                  <div className="relative z-10 flex h-full flex-col">
                    {/* ==================================================
                        ICON
                    ================================================== */}

                    <div
                      className="
                        flex
                        h-12
                        w-12
                        items-center
                        justify-center
                        rounded-full
                        border
                        border-primary/15
                        bg-primary/10
                        text-primary
                        transition-all
                        duration-300
                        group-hover:scale-105
                        group-hover:bg-primary
                        group-hover:text-primary-foreground
                      "
                    >
                      <Icon className="h-5 w-5" />
                    </div>

                    {/* ==================================================
                        TITLE
                    ================================================== */}

                    <h3
                      className="
                        mt-6
                        font-heading
                        text-2xl
                        text-foreground
                        transition-colors
                        duration-300
                        group-hover:text-primary
                      "
                    >
                      {detail.title}
                    </h3>

                    {/* ==================================================
                        DESCRIPTION
                    ================================================== */}

                    <p
                      className="
                        mt-4
                        text-sm
                        leading-6
                        text-muted-foreground
                      "
                    >
                      {detail.description}
                    </p>

                    {/* ==================================================
                        VALUE
                    ================================================== */}

                    <p
                      className="
                        mt-5
                        text-sm
                        font-semibold
                        leading-6
                        text-foreground
                      "
                    >
                      {detail.value}
                    </p>

                    {/* ==================================================
                        ACTION
                    ================================================== */}

                    <div
                      className="
                        mt-auto
                        flex
                        items-center
                        gap-2
                        pt-6
                        text-sm
                        font-medium
                        text-primary
                      "
                    >
                      {detail.action}

                      <span
                        className="
                          transition-transform
                          duration-300
                          group-hover:translate-x-1
                        "
                      >
                        →
                      </span>
                    </div>
                  </div>
                </article>
              </a>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}
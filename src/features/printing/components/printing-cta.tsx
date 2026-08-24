// import Link from "next/link";

// import { Button } from "@/components/ui/button";
// import { Container } from "@/components/common/container";
// import { Section } from "@/components/common/section";

// export function PrintingCTA() {
//   return (
//     <Section>
//       <Container>
//         <div className="rounded-3xl bg-primary px-8 py-16 text-center text-primary-foreground lg:px-16">
//           <p className="text-sm font-semibold uppercase tracking-[0.3em] opacity-80">
//             Need Something Custom?
//           </p>

//           <h2 className="mt-5 font-heading text-4xl lg:text-5xl">
//             Let&apos;s Create It Together
//           </h2>

//           <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 opacity-80 lg:text-base">
//             Tell us what you need and our team will help you find the right
//             printing solution for your business.
//           </p>

//           <div className="mt-8">
//             <Button
//               size="lg"
//               variant="secondary"
//               asChild
//               className="rounded-full px-8"
//             >
//               <Link href="/enquiry">
//                 Make an Enquiry
//               </Link>
//             </Button>
//           </div>
//         </div>
//       </Container>
//     </Section>
//   );
// }

"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Container } from "@/components/common/container";
import { Section } from "@/components/common/section";

export function PrintingCTA() {
  return (
    <Section className="pt-8 pb-20 lg:pt-12 lg:pb-28">
      <Container>
        <div className="relative overflow-hidden rounded-[2rem] bg-primary px-8 py-14 text-primary-foreground sm:px-12 lg:px-16 lg:py-20">
          {/* ==================================================
              CONTENT
          =================================================== */}

          <div className="relative z-10 max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] opacity-80">
               Need Something Custom?
            </p>

            <h2 className="mt-4 font-heading text-4xl leading-tight sm:text-5xl">
               Let&apos;s Create It Together
            </h2>

            <p className="mt-5 max-w-xl text-base leading-7 opacity-85 sm:text-lg">
             Tell us what you need and our team will help you find the right
            printing solution for your business.
            </p>

            <div className="mt-8">
              <Link
                href="/enquiry"
                className="inline-flex items-center gap-2 rounded-xl bg-background px-6 py-3 text-sm font-semibold text-foreground transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
              >
                Make an Enquiry

                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* ==================================================
              DECORATIVE ELEMENT
          =================================================== */}

          <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full border border-primary-foreground/20" />

          <div className="pointer-events-none absolute -bottom-32 -right-10 h-96 w-96 rounded-full border border-primary-foreground/10" />
        </div>
      </Container>
    </Section>
  );
}
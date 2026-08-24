import { Container } from "@/components/common/container";
import { EnquiryForm } from "./components/enquiry-form";

export function EnquiryPage() {
  return (
    <main>
      <section className="relative overflow-hidden py-16 md:py-24">
        {/* ================================================== */}
        {/* AMBIENT BACKGROUND GLOW */}
        {/* ================================================== */}

        <div
          className="
            pointer-events-none
            absolute
            -left-32
            top-20
            h-72
            w-72
            rounded-full
            bg-primary/10
            blur-3xl
          "
        />

        <div
          className="
            pointer-events-none
            absolute
            -right-32
            bottom-10
            h-80
            w-80
            rounded-full
            bg-[#c6a15b]/10
            blur-3xl
          "
        />

        <Container>
          <div className="relative z-10 mx-auto max-w-3xl">
            {/* ==================================================
                HEADER
            ================================================== */}

            <div
              className="
                glass
                relative
                mb-10
                overflow-hidden
                rounded-3xl
                px-6
                py-10
                text-center
                md:px-10
                md:py-12
              "
            >
              {/* Burgundy light */}

              <div
                className="
                  pointer-events-none
                  absolute
                  -right-24
                  -top-24
                  h-56
                  w-56
                  rounded-full
                  bg-primary/10
                  blur-3xl
                "
              />

              {/* Champagne light */}

              <div
                className="
                  pointer-events-none
                  absolute
                  -bottom-24
                  -left-24
                  h-56
                  w-56
                  rounded-full
                  bg-[#c6a15b]/10
                  blur-3xl
                "
              />

              <div className="relative z-10">
                <p
                  className="
                    text-sm
                    font-semibold
                    uppercase
                    tracking-[0.25em]
                    text-primary
                  "
                >
                  Get In Touch
                </p>

                <h1
                  className="
                    mt-4
                    font-heading
                    text-4xl
                    leading-tight
                    md:text-5xl
                  "
                >
                  Send an Enquiry
                </h1>

                <p
                  className="
                    mx-auto
                    mt-5
                    max-w-2xl
                    text-muted-foreground
                  "
                >
                  Tell us about your invitation
                  requirements and our team will get
                  back to you with suitable options.
                </p>
              </div>
            </div>

            {/* ==================================================
                ENQUIRY FORM
            ================================================== */}

            <div
              className="
                glass
                relative
                overflow-hidden
                rounded-3xl
                p-6
                md:p-10
              "
            >
              {/* Subtle burgundy glow */}

              <div
                className="
                  pointer-events-none
                  absolute
                  -right-32
                  -top-32
                  h-72
                  w-72
                  rounded-full
                  bg-primary/5
                  blur-3xl
                "
              />

              {/* Subtle champagne glow */}

              <div
                className="
                  pointer-events-none
                  absolute
                  -bottom-32
                  -left-32
                  h-72
                  w-72
                  rounded-full
                  bg-[#c6a15b]/5
                  blur-3xl
                "
              />

              <div className="relative z-10">
                <EnquiryForm />
              </div>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}
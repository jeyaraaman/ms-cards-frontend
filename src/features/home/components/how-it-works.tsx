"use client";

import { useEffect, useState } from "react";

import {
  Search,
  MessageCircle,
  PenTool,
  Truck,
  type LucideIcon,
} from "lucide-react";

import { Container } from "@/components/common/container";
import { ProcessStepCard } from "@/components/common/process-step-card";
import { Section } from "@/components/common/section";
import { SectionHeading } from "@/components/common/section-heading";

interface ProcessStep {
  id: number;
  title: string;
  description: string;
  icon: string;
  active: boolean;
  display_order: number;
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:8000";

const iconMap: Record<string, LucideIcon> = {
  Search,
  MessageCircle,
  PenTool,
  Truck,
};

export function HowItWorks() {
  const [steps, setSteps] =
    useState<ProcessStep[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchProcessSteps() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/api/how-it-works/`,
        );

        if (!response.ok) {
          throw new Error(
            "Failed to fetch process steps",
          );
        }

        const data: ProcessStep[] =
          await response.json();

        setSteps(data);
      } catch (error) {
        console.error(
          "Failed to load How It Works:",
          error,
        );

        setError(
          "Unable to load How It Works content.",
        );
      } finally {
        setLoading(false);
      }
    }

    fetchProcessSteps();
  }, []);

  return (
    <Section>
      <Container>
        <SectionHeading
          eyebrow="How It Works"
          title="Simple, Personalized & Hassle-Free"
          description="From choosing your invitation to final delivery, we make every step smooth and memorable."
        />

        {loading && (
          <div className="mt-16 grid gap-8 md:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map(
              (_, index) => (
                <div
                  key={index}
                  className="h-64 animate-pulse rounded-3xl bg-muted"
                />
              ),
            )}
          </div>
        )}

        {!loading && error && (
          <div className="mt-16 py-12 text-center text-destructive">
            {error}
          </div>
        )}

        {!loading &&
          !error &&
          steps.length === 0 && (
            <div className="mt-16 py-12 text-center text-muted-foreground">
              No process steps available.
            </div>
          )}

        {!loading &&
          !error &&
          steps.length > 0 && (
            <div className="mt-16 grid gap-8 md:grid-cols-2 xl:grid-cols-4">
              {steps.map((step) => {
                const Icon =
                  iconMap[step.icon] ?? Search;

                return (
                  <ProcessStepCard
                    key={step.id}
                    step={step.display_order}
                    icon={Icon}
                    title={step.title}
                    description={step.description}
                  />
                );
              })}
            </div>
          )}
      </Container>
    </Section>
  );
}
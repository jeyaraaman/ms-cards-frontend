"use client";

import { useEffect, useState } from "react";

import {
  Award,
  Palette,
  Sparkles,
  Handshake,
  Truck,
  Gem,
  type LucideIcon,
} from "lucide-react";

import { FeatureCard } from "@/components/common/feature-card";
import { Container } from "@/components/common/container";
import { Section } from "@/components/common/section";
import { SectionHeading } from "@/components/common/section-heading";

interface WhyChooseItem {
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
  Award,
  Palette,
  Sparkles,
  Handshake,
  Truck,
  Gem,
};

export function WhyChooseUs() {
  const [items, setItems] =
    useState<WhyChooseItem[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchWhyChooseItems() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/api/why-choose/`,
        );

        if (!response.ok) {
          throw new Error(
            "Failed to fetch Why Choose Us items",
          );
        }

        const data: WhyChooseItem[] =
          await response.json();

        setItems(data);
      } catch (error) {
        console.error(
          "Failed to load Why Choose Us:",
          error,
        );

        setError(
          "Unable to load Why Choose Us content.",
        );
      } finally {
        setLoading(false);
      }
    }

    fetchWhyChooseItems();
  }, []);

  return (
    <Section>
      <Container>
        <SectionHeading
          eyebrow="Why Choose Us"
          title="Crafting Memories with Excellence"
          description="For nearly three decades, we've helped families and businesses create unforgettable first impressions through premium printing."
        />

        {loading && (
          <div className="mt-16 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map(
              (_, index) => (
                <div
                  key={index}
                  className="h-48 animate-pulse rounded-2xl bg-muted"
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
          items.length === 0 && (
            <div className="mt-16 py-12 text-center text-muted-foreground">
              No Why Choose Us items available.
            </div>
          )}

        {!loading &&
          !error &&
          items.length > 0 && (
            <div className="mt-16 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
              {items.map((item) => {
                const Icon =
                  iconMap[item.icon] ?? Award;

                return (
                  <FeatureCard
                    key={item.id}
                    icon={Icon}
                    title={item.title}
                    description={item.description}
                  />
                );
              })}
            </div>
          )}
      </Container>
    </Section>
  );
}
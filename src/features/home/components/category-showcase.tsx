"use client";

import { useEffect, useState } from "react";

import { CategoryCard } from "@/components/common/category-card";
import { Container } from "@/components/common/container";
import { Section } from "@/components/common/section";
import { SectionHeading } from "@/components/common/section-heading";

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  image: string;
  active: boolean;
  product_count: number;
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:8000";

export function CategoryShowcase() {
  const [categories, setCategories] =
    useState<Category[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchCategories() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/api/categories/`,
        );

        if (!response.ok) {
          throw new Error(
            "Failed to fetch categories",
          );
        }

        const data: Category[] =
          await response.json();

        setCategories(data);
      } catch (error) {
        console.error(
          "Failed to load categories:",
          error,
        );

        setError(
          "Unable to load categories.",
        );
      } finally {
        setLoading(false);
      }
    }

    fetchCategories();
  }, []);

  return (
    <Section>
      <Container>
        <SectionHeading
          eyebrow="Categories"
          title="Find the Perfect Invitation"
          description="Explore our beautifully crafted invitation categories designed for every celebration."
        />

        {loading && (
          <div className="mt-16 py-12 text-center text-muted-foreground">
            Loading categories...
          </div>
        )}

        {!loading && error && (
          <div className="mt-16 py-12 text-center text-destructive">
            {error}
          </div>
        )}

        {!loading &&
          !error &&
          categories.length === 0 && (
            <div className="mt-16 py-12 text-center text-muted-foreground">
              No categories available.
            </div>
          )}

        {!loading &&
          !error &&
          categories.length > 0 && (
            <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {categories.map((category) => (
                <CategoryCard
                  key={category.id}
                  category={{
                    id: String(category.id),
                    title: category.name,
                    description: category.description,
                    image: category.image,
                    href: `/catalogue?category=${category.slug}`,
                  }}
                />
              ))}
            </div>
          )}
      </Container>
    </Section>
  );
}
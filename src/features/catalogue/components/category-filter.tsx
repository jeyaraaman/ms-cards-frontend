interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  image: string;
  active: boolean;
  product_count: number;
}

interface CategoryFilterProps {
  activeCategory: string;
  categories: Category[];
  onCategoryChange: (category: string) => void;
}

export function CategoryFilter({
  activeCategory,
  categories,
  onCategoryChange,
}: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-3">
      {/* All Products */}
      <button
        type="button"
        onClick={() => onCategoryChange("all")}
        className={`rounded-full border px-5 py-2.5 text-sm font-medium transition-all duration-200 ${
          activeCategory === "all"
            ? "border-primary bg-primary text-primary-foreground"
            : "border-border bg-background hover:border-primary hover:text-primary"
        }`}
      >
        All Products
      </button>

      {/* Dynamic Categories */}
      {categories.map((category) => {
        const isActive =
          activeCategory === category.slug;

        return (
          <button
            key={category.id}
            type="button"
            onClick={() =>
              onCategoryChange(category.slug)
            }
            className={`rounded-full border px-5 py-2.5 text-sm font-medium transition-all duration-200 ${
              isActive
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background hover:border-primary hover:text-primary"
            }`}
          >
            {category.name}
          </button>
        );
      })}
    </div>
  );
}
"use client";

import { useEffect, useRef, useState } from "react";
import {
  Check,
  ChevronDown,
  Search,
  X,
} from "lucide-react";

import { Input } from "@/components/ui/input";

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  image: string;
  active: boolean;
  product_count: number;
}

interface Collection {
  id: number;
  name: string;
  slug: string;
  description: string;
  image: string;
  active: boolean;
  product_count: number;
}

interface CatalogueToolbarProps {
  searchQuery: string;
  activeCategory: string;
  activeCollection: string;
  categories: Category[];
  collections: Collection[];
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onCollectionChange: (value: string) => void;
}

interface DropdownOption {
  value: string;
  label: string;
}

interface CustomDropdownProps {
  id: string;
  label: string;
  value: string;
  options: DropdownOption[];
  onChange: (value: string) => void;
}

/* ============================================================
   CUSTOM DROPDOWN
============================================================ */

function CustomDropdown({
  id,
  label,
  value,
  options,
  onChange,
}: CustomDropdownProps) {
  const [open, setOpen] = useState(false);

  const dropdownRef =
    useRef<HTMLDivElement | null>(null);

  const selectedOption =
    options.find(
      (option) => option.value === value,
    ) ?? options[0];

  /* ==========================================================
     CLOSE WHEN CLICKING OUTSIDE
  ========================================================== */

  useEffect(() => {
    function handleClickOutside(
      event: MouseEvent,
    ) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(
          event.target as Node,
        )
      ) {
        setOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleClickOutside,
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside,
      );
    };
  }, []);

  /* ==========================================================
     ESCAPE KEY
  ========================================================== */

  useEffect(() => {
    function handleEscape(
      event: KeyboardEvent,
    ) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener(
      "keydown",
      handleEscape,
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleEscape,
      );
    };
  }, []);

  /* ==========================================================
     SELECT
  ========================================================== */

  function handleSelect(
    option: DropdownOption,
  ) {
    onChange(option.value);
    setOpen(false);
  }

  return (
    <div
      ref={dropdownRef}
      className="relative w-full md:w-64"
    >
      {/* ==================================================
          LABEL
      ================================================== */}

      <label
        htmlFor={id}
        className="
          mb-2
          block
          text-sm
          font-medium
          text-foreground
        "
      >
        {label}
      </label>

      {/* ==================================================
          TRIGGER
      ================================================== */}

      <button
        id={id}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() =>
          setOpen((current) => !current)
        }
        className={`
          flex
          h-12
          w-full
          items-center
          justify-between
          gap-3
          rounded-xl
          border
          px-4
          text-left
          text-sm
          outline-none
          backdrop-blur-xl
          transition-all
          duration-300

          /* LIGHT THEME */
          border-primary/15
          bg-white/45
          text-foreground
          shadow-[0_8px_25px_rgba(122,31,43,0.06)]
          hover:border-primary/30
          hover:bg-white/60

          /* DARK THEME */
          dark:border-white/[0.14]
          dark:bg-white/[0.055]
          dark:text-foreground
          dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]
          dark:hover:border-white/[0.20]
          dark:hover:bg-white/[0.075]

          ${
            open
              ? `
                border-primary/40
                bg-white/65
                shadow-[0_10px_30px_rgba(122,31,43,0.10)]
                ring-2
                ring-primary/10

                dark:bg-white/[0.09]
                dark:border-primary/40
              `
              : ""
          }
        `}
      >
        <span className="truncate text-foreground">
          {selectedOption?.label}
        </span>

        <ChevronDown
          className={`
            h-4
            w-4
            shrink-0
            text-muted-foreground
            transition-transform
            duration-200

            ${
              open
                ? "rotate-180 text-primary"
                : ""
            }
          `}
        />
      </button>

      {/* ==================================================
          DROPDOWN MENU
      ================================================== */}

      {open && (
        <div
          role="listbox"
          aria-label={label}
          className="
            absolute
            left-0
            top-[calc(100%+0.5rem)]
            z-50
            w-full
            overflow-hidden
            rounded-xl
            border
            border-primary/15
            bg-white/95
            p-1.5
            shadow-[0_20px_50px_rgba(122,31,43,0.15)]
            backdrop-blur-2xl
            animate-in
            fade-in
            zoom-in-95
            duration-150

            dark:border-white/[0.14]
            dark:bg-[#21191a]/95
            dark:shadow-[0_20px_50px_rgba(0,0,0,0.40)]
          "
        >
          <div
            className="
              max-h-72
              overflow-y-auto
              pr-1

              [&::-webkit-scrollbar]:w-1.5
              [&::-webkit-scrollbar-track]:bg-transparent
              [&::-webkit-scrollbar-thumb]:rounded-full
              [&::-webkit-scrollbar-thumb]:bg-primary/15
              [&::-webkit-scrollbar-thumb:hover]:bg-primary/40

              dark:[&::-webkit-scrollbar-thumb]:bg-white/15
              dark:[&::-webkit-scrollbar-thumb:hover]:bg-primary/50
            "
          >
            {options.map((option) => {
              const selected =
                option.value === value;

              return (
                <button
                  key={`${id}-${option.value}`}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() =>
                    handleSelect(option)
                  }
                  className={`
                    flex
                    w-full
                    items-center
                    justify-between
                    gap-3
                    rounded-lg
                    px-3
                    py-2.5
                    text-left
                    text-sm
                    transition-all
                    duration-150

                    ${
                      selected
                        ? `
                          bg-primary/10
                          text-primary
                        `
                        : `
                          text-foreground
                          hover:bg-primary/5
                          hover:text-primary

                          dark:text-foreground
                          dark:hover:bg-white/[0.07]
                          dark:hover:text-primary
                        `
                    }
                  `}
                >
                  <span className="truncate">
                    {option.label}
                  </span>

                  {selected && (
                    <Check
                      className="
                        h-4
                        w-4
                        shrink-0
                        text-primary
                      "
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   CATALOGUE TOOLBAR
============================================================ */

export function CatalogueToolbar({
  searchQuery,
  activeCategory,
  activeCollection,
  categories,
  collections,
  onSearchChange,
  onCategoryChange,
  onCollectionChange,
}: CatalogueToolbarProps) {
  const hasFilters =
    searchQuery.trim() !== "" ||
    activeCategory !== "all" ||
    activeCollection !== "all";

  /* ==========================================================
     CLEAR FILTERS
  ========================================================== */

  function clearFilters() {
    onSearchChange("");
    onCategoryChange("all");
    onCollectionChange("all");
  }

  /* ==========================================================
     CATEGORY OPTIONS
  ========================================================== */

  const categoryOptions: DropdownOption[] = [
    {
      value: "all",
      label: "All Categories",
    },

    ...categories
      .filter(
        (category) =>
          category.slug !== "all",
      )
      .map((category) => ({
        value: category.slug,
        label: category.name,
      })),
  ];

  /* ==========================================================
     COLLECTION OPTIONS
  ========================================================== */

  const collectionOptions: DropdownOption[] = [
    {
      value: "all",
      label: "All Collections",
    },

    ...collections
      .filter(
        (collection) =>
          collection.slug !== "all",
      )
      .map((collection) => ({
        value: collection.slug,
        label: collection.name,
      })),
  ];

  return (
    <div className="space-y-6">
      {/* ==================================================
          SEARCH
      ================================================== */}

      <div className="relative max-w-2xl">
        <Search
          className="
            pointer-events-none
            absolute
            left-4
            top-1/2
            h-5
            w-5
            -translate-y-1/2
            text-muted-foreground
          "
        />

        <Input
          type="search"
          value={searchQuery}
          onChange={(event) =>
            onSearchChange(
              event.target.value,
            )
          }
          placeholder="Search invitations..."
          className="
            glass-input
            h-12
            rounded-full
            border
            border-primary/15
            bg-white/45
            pl-12
            pr-5
            text-foreground
            placeholder:text-muted-foreground
            shadow-[0_8px_25px_rgba(122,31,43,0.06)]
            backdrop-blur-xl
            transition-all
            duration-300

            hover:border-primary/30
            hover:bg-white/60

            focus:border-primary/40
            focus:bg-white/70
            focus:ring-2
            focus:ring-primary/10

            dark:border-white/[0.14]
            dark:bg-white/[0.055]
            dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]
            dark:hover:border-white/[0.20]
            dark:hover:bg-white/[0.075]
            dark:focus:bg-white/[0.09]
          "
        />
      </div>

      {/* ==================================================
          FILTERS
      ================================================== */}

      <div
        className="
          flex
          flex-wrap
          items-end
          gap-4
        "
      >
        {/* ==================================================
            CATEGORY
        ================================================== */}

        <CustomDropdown
          id="catalogue-category"
          label="Category"
          value={activeCategory}
          options={categoryOptions}
          onChange={onCategoryChange}
        />

        {/* ==================================================
            COLLECTION
        ================================================== */}

        <CustomDropdown
          id="catalogue-collection"
          label="Collection"
          value={activeCollection}
          options={collectionOptions}
          onChange={onCollectionChange}
        />

        {/* ==================================================
            CLEAR FILTERS
        ================================================== */}

        {hasFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="
              inline-flex
              h-12
              items-center
              gap-2
              rounded-xl
              border
              border-primary/15
              bg-white/45
              px-4
              text-sm
              font-medium
              text-muted-foreground
              shadow-[0_8px_25px_rgba(122,31,43,0.06)]
              backdrop-blur-xl
              transition-all
              duration-300

              hover:border-primary/30
              hover:bg-primary/5
              hover:text-primary

              dark:border-white/[0.14]
              dark:bg-white/[0.055]
              dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]
              dark:hover:border-white/[0.20]
              dark:hover:bg-white/[0.075]
              dark:hover:bg-primary/10
            "
          >
            <X className="h-4 w-4" />

            Clear Filters
          </button>
        )}
      </div>
    </div>
  );
}
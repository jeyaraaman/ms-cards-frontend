"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import {
  CheckCircle2,
  ChevronDown,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface EnquiryFormValues {
  name: string;
  phone: string;
  email: string;
  product: string;
  quantity: string;
  occasion: string;
  message: string;
}

interface Product {
  id: number;
  name: string;
  slug: string;
  category: string;
  material: string;
  image: string;
  description: string;
  featured: boolean;
  active: boolean;
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:8000";

export function EnquiryForm() {
  const searchParams = useSearchParams();

  const [submitted, setSubmitted] = useState(false);

  const [products, setProducts] = useState<Product[]>(
    [],
  );

  const [productsLoading, setProductsLoading] =
    useState(true);

  const [productsError, setProductsError] =
    useState("");

  const [productDropdownOpen, setProductDropdownOpen] =
    useState(false);

  const productId = searchParams.get("product");

  /*
   * ==========================================================
   * LOAD PRODUCTS
   * ==========================================================
   */

  useEffect(() => {
    async function fetchProducts() {
      try {
        setProductsLoading(true);
        setProductsError("");

        const response = await fetch(
          `${API_URL}/api/products/`,
        );

        if (!response.ok) {
          throw new Error(
            "Failed to fetch products",
          );
        }

        const data = await response.json();

        const normalizedProducts: Product[] =
          Array.isArray(data)
            ? data
            : Array.isArray(data?.results)
              ? data.results
              : [];

        setProducts(normalizedProducts);
      } catch (error) {
        console.error(
          "Failed to load products:",
          error,
        );

        setProductsError(
          "Unable to load products. Please try again.",
        );
      } finally {
        setProductsLoading(false);
      }
    }

    fetchProducts();
  }, []);

  /*
   * ==========================================================
   * FIND PRODUCT FROM URL
   * ==========================================================
   */

  const selectedProduct = useMemo(
    () =>
      products.find(
        (product) =>
          product.slug === productId,
      ),
    [products, productId],
  );

  /*
   * ==========================================================
   * FORM
   * ==========================================================
   */

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: {
      errors,
      isSubmitting,
    },
  } = useForm<EnquiryFormValues>({
    mode: "onSubmit",

    defaultValues: {
      name: "",
      phone: "",
      email: "",
      product: "",
      quantity: "100",
      occasion: "",
      message: "",
    },
  });

  /*
   * ==========================================================
   * CURRENT SELECTED PRODUCT
   * ==========================================================
   */

  const selectedProductName = watch("product");

  /*
   * ==========================================================
   * AUTO SELECT PRODUCT FROM URL
   * ==========================================================
   */

  useEffect(() => {
    if (selectedProduct) {
      setValue(
        "product",
        selectedProduct.name,
        {
          shouldValidate: true,
        },
      );
    }
  }, [selectedProduct, setValue]);

  /*
   * ==========================================================
   * SELECT PRODUCT
   * ==========================================================
   */

  function handleProductSelect(
    productName: string,
  ) {
    setValue(
      "product",
      productName,
      {
        shouldValidate: true,
        shouldDirty: true,
      },
    );

    setProductDropdownOpen(false);
  }

  /*
   * ==========================================================
   * SUBMIT ENQUIRY
   * ==========================================================
   */

  async function onSubmit(
    data: EnquiryFormValues,
  ) {
    try {
      const selectedProductForSubmission =
        products.find(
          (product) =>
            product.name === data.product,
        );

      if (!selectedProductForSubmission) {
        alert(
          "Please select a valid product.",
        );

        return;
      }

      const response = await fetch(
        `${API_URL}/api/enquiries/`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            name: data.name,

            phone: data.phone,

            email: data.email || null,

            product_id:
              selectedProductForSubmission.slug,

            product_name:
              selectedProductForSubmission.name,

            quantity: Number(
              data.quantity,
            ),

            occasion: data.occasion,

            message: data.message,
          }),
        },
      );

      if (!response.ok) {
        let errorData: unknown;

        try {
          errorData =
            await response.json();
        } catch {
          errorData = null;
        }

        console.error(
          "API error:",
          errorData,
        );

        alert(
          "Unable to send enquiry. Please try again.",
        );

        return;
      }

      const result =
        await response.json();

      console.log(
        "Enquiry created:",
        result,
      );

      setSubmitted(true);
    } catch (error) {
      console.error(
        "Network error:",
        error,
      );

      alert(
        "Unable to connect to Meenakshi Screen server. Please try again.",
      );
    }
  }

  /*
   * ==========================================================
   * SUCCESS STATE
   * ==========================================================
   */

  if (submitted) {
    return (
      <div
        className="
          flex
          min-h-[400px]
          flex-col
          items-center
          justify-center
          text-center
        "
      >
        <div
          className="
            flex
            h-20
            w-20
            items-center
            justify-center
            rounded-full
            border
            border-primary/20
            bg-primary/10
            shadow-[0_0_30px_rgba(122,31,43,0.15)]
          "
        >
          <CheckCircle2
            className="h-9 w-9 text-primary"
          />
        </div>

        <h2
          className="
            mt-6
            font-heading
            text-3xl
          "
        >
          Enquiry Received
        </h2>

        <p
          className="
            mt-4
            max-w-md
            leading-7
            text-muted-foreground
          "
        >
          Thank you for contacting Meenakshi Screen.
          Our team will review your
          requirements and get back to you
          shortly.
        </p>

        <Button
          type="button"
          className="
            mt-8
            rounded-full
            shadow-[0_8px_25px_rgba(122,31,43,0.15)]
            transition-all
            duration-300
            hover:-translate-y-0.5
            hover:shadow-[0_10px_30px_rgba(122,31,43,0.25)]
          "
          onClick={() =>
            setSubmitted(false)
          }
        >
          Send Another Enquiry
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-12"
    >
      {/* =====================================================
          CUSTOMER DETAILS
      ====================================================== */}

      <div>
        <h2
          className="
            font-heading
            text-2xl
          "
        >
          Your Details
        </h2>

        <div
          className="
            mt-6
            grid
            gap-6
            md:grid-cols-2
          "
        >
          {/* ==================================================
              NAME
          ================================================== */}

          <div className="space-y-2">
            <label
              htmlFor="name"
              className="
                text-sm
                font-medium
                text-foreground
              "
            >
              Name *
            </label>

            <Input
              id="name"
              placeholder="Your full name"
              required
              {...register("name", {
                required:
                  "Please enter your name",

                minLength: {
                  value: 2,
                  message:
                    "Please enter your name",
                },
              })}
              className="
                glass-input
                h-12
                rounded-xl
                border
                bg-white/5
                shadow-none
                backdrop-blur-md
                transition-all
                duration-300
                focus:border-primary/40
                focus:ring-2
                focus:ring-primary/10
              "
            />

            {errors.name && (
              <p
                className="
                  text-sm
                  text-destructive
                "
              >
                {errors.name.message}
              </p>
            )}
          </div>

          {/* ==================================================
              PHONE
          ================================================== */}

          <div className="space-y-2">
            <label
              htmlFor="phone"
              className="
                text-sm
                font-medium
                text-foreground
              "
            >
              Phone *
            </label>

            <Input
              id="phone"
              type="tel"
              placeholder="+91 XXXXX XXXXX"
              required
              {...register("phone", {
                required:
                  "Please enter a valid phone number",

                validate: (value) =>
                  value.replace(/\D/g, "")
                    .length >= 10 ||
                  "Please enter a valid phone number",
              })}
              className="
                glass-input
                h-12
                rounded-xl
                border
                bg-white/5
                shadow-none
                backdrop-blur-md
                transition-all
                duration-300
                focus:border-primary/40
                focus:ring-2
                focus:ring-primary/10
              "
            />

            {errors.phone && (
              <p
                className="
                  text-sm
                  text-destructive
                "
              >
                {errors.phone.message}
              </p>
            )}
          </div>

          {/* ==================================================
              EMAIL
          ================================================== */}

          <div
            className="
              space-y-2
              md:col-span-2
            "
          >
            <label
              htmlFor="email"
              className="
                text-sm
                font-medium
                text-foreground
              "
            >
              Email
            </label>

            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              {...register("email", {
                pattern: {
                  value:
                    /^[^\s@]+@[^\s@]+\.[^\s@]+$/,

                  message:
                    "Please enter a valid email address",
                },
              })}
              className="
                glass-input
                h-12
                rounded-xl
                border
                bg-white/5
                shadow-none
                backdrop-blur-md
                transition-all
                duration-300
                focus:border-primary/40
                focus:ring-2
                focus:ring-primary/10
              "
            />

            {errors.email && (
              <p
                className="
                  text-sm
                  text-destructive
                "
              >
                {errors.email.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* =====================================================
          ENQUIRY DETAILS
      ====================================================== */}

      <div>
        <h2
          className="
            font-heading
            text-2xl
          "
        >
          Enquiry Details
        </h2>

        <div className="mt-6 space-y-6">
          {/* ==================================================
              PRODUCT CUSTOM DROPDOWN
          ================================================== */}

          <div className="space-y-2">
            <label
              htmlFor="product"
              className="
                text-sm
                font-medium
                text-foreground
              "
            >
              Product *
            </label>

            {/* Hidden react-hook-form field */}

            <input
              type="hidden"
              {...register("product", {
                required:
                  "Please select a product",
              })}
            />

            <div className="relative">
              {/* ==================================================
                  DROPDOWN BUTTON
              ================================================== */}

              <button
                type="button"
                id="product"
                disabled={productsLoading}
                onClick={() =>
                  setProductDropdownOpen(
                    (open) => !open,
                  )
                }
                className="
                  glass-input
                  flex
                  h-12
                  w-full
                  items-center
                  justify-between
                  rounded-xl
                  border
                  bg-white/5
                  px-4
                  text-left
                  text-sm
                  text-foreground
                  shadow-none
                  backdrop-blur-md
                  outline-none
                  transition-all
                  duration-300

                  hover:bg-white/[0.07]

                  focus:border-primary/40
                  focus:ring-2
                  focus:ring-primary/10

                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                <span
                  className={
                    selectedProductName
                      ? "text-foreground"
                      : "text-muted-foreground"
                  }
                >
                  {productsLoading
                    ? "Loading products..."
                    : selectedProductName ||
                      "Select a product"}
                </span>

                <ChevronDown
                  className={`
                    h-4
                    w-4
                    shrink-0
                    text-muted-foreground
                    transition-transform
                    duration-300
                    ${
                      productDropdownOpen
                        ? "rotate-180 text-primary"
                        : ""
                    }
                  `}
                />
              </button>

              {/* ==================================================
                  THEME-AWARE PRODUCT DROPDOWN
              ================================================== */}

              {productDropdownOpen &&
                !productsLoading && (
                  <div
                    className="
                      absolute
                      left-0
                      right-0
                      top-[calc(100%+0.5rem)]
                      z-50
                      overflow-hidden
                      rounded-xl
                      border
                      border-border
                      bg-background/95
                      text-foreground
                      shadow-[0_20px_50px_rgba(0,0,0,0.20)]
                      backdrop-blur-xl
                    "
                  >
                    <div
                      className="
                        max-h-72
                        overflow-y-auto
                        p-1.5

                        scrollbar-thin
                        scrollbar-track-transparent
                        scrollbar-thumb-primary/40
                      "
                    >
                      {products.length === 0 ? (
                        <div
                          className="
                            px-4
                            py-3
                            text-sm
                            text-muted-foreground
                          "
                        >
                          No products available
                        </div>
                      ) : (
                        products.map(
                          (product) => {
                            const isSelected =
                              selectedProductName ===
                              product.name;

                            return (
                              <button
                                key={product.id}
                                type="button"
                                onClick={() =>
                                  handleProductSelect(
                                    product.name,
                                  )
                                }
                                className={`
                                  flex
                                  w-full
                                  items-center
                                  rounded-lg
                                  px-3
                                  py-2.5
                                  text-left
                                  text-sm
                                  transition-all
                                  duration-200

                                  ${
                                    isSelected
                                      ? "bg-primary/10 text-primary"
                                      : "text-foreground/80 hover:bg-muted hover:text-foreground"
                                  }
                                `}
                              >
                                <span className="truncate">
                                  {product.name}
                                </span>

                                {isSelected && (
                                  <span
                                    className="
                                      ml-auto
                                      pl-3
                                      text-xs
                                      text-primary
                                    "
                                  >
                                    ✓
                                  </span>
                                )}
                              </button>
                            );
                          },
                        )
                      )}
                    </div>
                  </div>
                )}
            </div>

            {productsError && (
              <p
                className="
                  text-sm
                  text-destructive
                "
              >
                {productsError}
              </p>
            )}

            {errors.product && (
              <p
                className="
                  text-sm
                  text-destructive
                "
              >
                {errors.product.message}
              </p>
            )}
          </div>

          {/* ==================================================
              QUANTITY + OCCASION
          ================================================== */}

          <div
            className="
              grid
              gap-6
              md:grid-cols-2
            "
          >
            {/* Quantity */}

            <div className="space-y-2">
              <label
                htmlFor="quantity"
                className="
                  text-sm
                  font-medium
                  text-foreground
                "
              >
                Approximate Quantity *
              </label>

              <Input
                id="quantity"
                type="number"
                min="1"
                placeholder="100"
                required
                {...register("quantity", {
                  required:
                    "Please enter the quantity",

                  validate: (value) =>
                    Number(value) >= 1 ||
                    "Please enter a valid quantity",
                })}
                className="
                  glass-input
                  h-12
                  rounded-xl
                  border
                  bg-white/5
                  shadow-none
                  backdrop-blur-md
                  transition-all
                  duration-300
                  focus:border-primary/40
                  focus:ring-2
                  focus:ring-primary/10
                "
              />

              {errors.quantity && (
                <p
                  className="
                    text-sm
                    text-destructive
                  "
                >
                  {errors.quantity.message}
                </p>
              )}
            </div>

            {/* Occasion */}

            <div className="space-y-2">
              <label
                htmlFor="occasion"
                className="
                  text-sm
                  font-medium
                  text-foreground
                "
              >
                Occasion *
              </label>

              <Input
                id="occasion"
                placeholder="Wedding, Engagement, etc."
                required
                {...register("occasion", {
                  required:
                    "Please enter the occasion",

                  minLength: {
                    value: 2,
                    message:
                      "Please enter the occasion",
                  },
                })}
                className="
                  glass-input
                  h-12
                  rounded-xl
                  border
                  bg-white/5
                  shadow-none
                  backdrop-blur-md
                  transition-all
                  duration-300
                  focus:border-primary/40
                  focus:ring-2
                  focus:ring-primary/10
                "
              />

              {errors.occasion && (
                <p
                  className="
                    text-sm
                    text-destructive
                  "
                >
                  {errors.occasion.message}
                </p>
              )}
            </div>
          </div>

          {/* ==================================================
              MESSAGE
          ================================================== */}

          <div className="space-y-2">
            <label
              htmlFor="message"
              className="
                text-sm
                font-medium
                text-foreground
              "
            >
              Message *
            </label>

            <Textarea
              id="message"
              placeholder="Tell us about your requirements..."
              required
              minLength={10}
              className="
                glass-input
                min-h-36
                resize-y
                rounded-xl
                border
                bg-white/5
                shadow-none
                backdrop-blur-md
                transition-all
                duration-300
                focus:border-primary/40
                focus:ring-2
                focus:ring-primary/10
              "
              {...register("message", {
                required:
                  "Please provide a little more detail",

                minLength: {
                  value: 10,
                  message:
                    "Please provide a little more detail",
                },
              })}
            />

            {errors.message && (
              <p
                className="
                  text-sm
                  text-destructive
                "
              >
                {errors.message.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* =====================================================
          SUBMIT
      ====================================================== */}

      <Button
        type="submit"
        size="lg"
        disabled={
          isSubmitting ||
          productsLoading ||
          products.length === 0
        }
        className="
          w-full
          rounded-full
          shadow-[0_8px_30px_rgba(122,31,43,0.18)]
          transition-all
          duration-300

          hover:-translate-y-0.5
          hover:shadow-[0_12px_35px_rgba(122,31,43,0.30)]

          md:w-auto
        "
      >
        {isSubmitting
          ? "Sending..."
          : "Send Enquiry"}
      </Button>
    </form>
  );
}
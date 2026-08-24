"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  GripVertical,
  Loader2,
  Crown,
  ExternalLink,
} from "lucide-react";
import {
  adminFetch,
  redirectToAdminLogin,
} from "@/lib/admin-auth";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

type StatusFilter = "all" | "active" | "inactive";
type SortOption =
  | "display_order"
  | "newest"
  | "oldest"
  | "name_asc"
  | "name_desc";

type SlotNumber = 1 | 2 | 3 | 4;

interface Category {
  id: number;
  name: string;
  slug: string;
  collection: number | null;
  collection_name: string | null;
  collection_slug: string | null;
  description: string;
  image: string;
  cloudinary_public_id: string;
  active: boolean;
  product_count: number;
  display_order: number;
  featured_on_home: boolean;
  home_display_order: number | null;
  created_at: string;
  updated_at: string;
}

const SLOT_LABELS: Record<SlotNumber, string> = {
  1: "First",
  2: "Second",
  3: "Third",
  4: "Fourth",
};

function isPremiumCategory(category: Category) {
  return category.collection_slug === "premium-collection";
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message
    ? error.message
    : fallback;
}

function isAuthError(error: unknown) {
  return (
    error instanceof Error &&
    (error.message === "ADMIN_AUTH_REQUIRED" ||
      error.message === "ADMIN_AUTH_EXPIRED")
  );
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>("all");
  const [sortOption, setSortOption] =
    useState<SortOption>("display_order");

  const [deletingId, setDeletingId] =
    useState<number | null>(null);

  /*
   * ------------------------------------------------------------------
   * NORMAL CATEGORY LIST DRAGGING
   *
   * This implementation intentionally does NOT use HTML5 drag/drop.
   * The old implementation depended on dragover/drop events and the
   * browser could start the drag but refuse the drop.
   *
   * Instead we use Pointer Events:
   *   pointer down on the drag handle
   *   pointer move over another row
   *   pointer up = commit the reorder
   *
   * This makes the interaction deterministic and also works with
   * mouse/touch/pen input.
   * ------------------------------------------------------------------
   */
  const [draggedCategoryId, setDraggedCategoryId] =
    useState<number | null>(null);
  const draggedCategoryIdRef = useRef<number | null>(null);
  const pointerDraggingRef = useRef(false);
  const pointerMovedRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragStartYRef = useRef(0);
  const currentTargetIdRef = useRef<number | null>(null);
  const [dropTargetId, setDropTargetId] =
    useState<number | null>(null);

  const [savingOrder, setSavingOrder] =
    useState(false);

  /*
   * ------------------------------------------------------------------
   * PREMIUM 4-SLOT DRAGGING
   * ------------------------------------------------------------------
   */
  const [premiumDraggingId, setPremiumDraggingId] =
    useState<number | null>(null);
  const premiumDraggingIdRef =
    useRef<number | null>(null);
  const premiumPointerDraggingRef =
    useRef(false);
  const premiumMovedRef = useRef(false);
  const premiumStartXRef = useRef(0);
  const premiumStartYRef = useRef(0);
  const premiumDropSlotRef =
    useRef<SlotNumber | null>(null);
  const [premiumDropSlot, setPremiumDropSlot] =
    useState<SlotNumber | null>(null);
  const [savingPremiumSlots, setSavingPremiumSlots] =
    useState(false);

  /*
   * ------------------------------------------------------------------
   * SCROLL WHILE DRAGGING
   *
   * Dragging must not trap the page at the position where the drag
   * started. We therefore scroll the actual scrollable container under
   * the page, not just window. This also keeps working if the admin
   * layout later gets an overflow-y container.
   *
   * Behaviour:
   * - Move the pointer near the top/bottom edge -> automatic scrolling.
   * - Keep moving the pointer while the page scrolls -> the drag target
   *   continues to update.
   * - Mouse wheel / trackpad scrolling is NOT blocked while dragging.
   * ------------------------------------------------------------------
   */
  const autoScrollFrameRef = useRef<number | null>(null);
  const pointerPositionRef = useRef({ x: 0, y: 0 });
  const dragScrollContainerRef = useRef<HTMLElement | null>(null);

  function isScrollableElement(element: HTMLElement) {
    const style = window.getComputedStyle(element);
    const overflowY = style.overflowY;
    return (
      /(auto|scroll|overlay)/.test(overflowY) &&
      element.scrollHeight > element.clientHeight + 1
    );
  }

  function findScrollContainer(
    sourceElement: HTMLElement | null,
  ): HTMLElement | null {
    const documentScroller =
      document.scrollingElement as HTMLElement | null;

    if (
      documentScroller &&
      documentScroller.scrollHeight >
        documentScroller.clientHeight + 1
    ) {
      return documentScroller;
    }

    let current = sourceElement;

    while (current) {
      if (isScrollableElement(current)) {
        return current;
      }
      current = current.parentElement;
    }

    return null;
  }

  function scrollByAmount(amount: number) {
    const container = dragScrollContainerRef.current;

    if (container) {
      const maxScroll = Math.max(
        0,
        container.scrollHeight - container.clientHeight,
      );
      const before = container.scrollTop;
      container.scrollTop = Math.max(
        0,
        Math.min(maxScroll, before + amount),
      );
      return container.scrollTop !== before;
    }

    const before =
      window.scrollY ||
      document.documentElement.scrollTop ||
      document.body.scrollTop ||
      0;

    window.scrollBy({
      top: amount,
      left: 0,
      behavior: "auto",
    });

    return (
      window.scrollY ||
      document.documentElement.scrollTop ||
      document.body.scrollTop ||
      0
    ) !== before;
  }

  function stopAutoScroll() {
    if (autoScrollFrameRef.current !== null) {
      window.cancelAnimationFrame(autoScrollFrameRef.current);
      autoScrollFrameRef.current = null;
    }

    pointerPositionRef.current = { x: 0, y: 0 };
    dragScrollContainerRef.current = null;
  }

  function runAutoScroll() {
    const dragging =
      pointerDraggingRef.current ||
      premiumPointerDraggingRef.current;

    if (!dragging) {
      autoScrollFrameRef.current = null;
      return;
    }

    const { x, y } = pointerPositionRef.current;
    const viewportHeight = window.innerHeight;
    const edge = 180;
    const maxSpeed = 30;

    let amount = 0;

    if (y <= edge) {
      const intensity = Math.min(1, (edge - y) / edge);
      amount = -Math.max(
        2,
        Math.round(maxSpeed * intensity * intensity),
      );
    } else if (y >= viewportHeight - edge) {
      const intensity = Math.min(
        1,
        (y - (viewportHeight - edge)) / edge,
      );
      amount = Math.max(
        2,
        Math.round(maxSpeed * intensity * intensity),
      );
    }

    if (amount !== 0) {
      scrollByAmount(amount);

      // The list moved underneath the pointer. Recalculate the drop
      // target on every animation frame, even when the mouse is held
      // perfectly still at the edge.
      if (pointerDraggingRef.current) {
        updateNormalDragTarget(x, y);
      }

      if (premiumPointerDraggingRef.current) {
        updatePremiumDragTarget(x, y);
      }
    }

    autoScrollFrameRef.current =
      window.requestAnimationFrame(runAutoScroll);
  }

  function startAutoScroll(
    clientX: number,
    clientY: number,
    sourceElement: HTMLElement,
  ) {
    pointerPositionRef.current = {
      x: clientX,
      y: clientY,
    };

    dragScrollContainerRef.current =
      findScrollContainer(sourceElement);

    if (autoScrollFrameRef.current === null) {
      autoScrollFrameRef.current =
        window.requestAnimationFrame(runAutoScroll);
    }
  }

  /*
   * ------------------------------------------------------------------
   * FETCH
   * ------------------------------------------------------------------
   */
  async function fetchCategories() {
    try {
      setLoading(true);
      setError("");

      const response = await adminFetch(
        `${API_URL}/api/products/categories/`,
        {
          headers: {
            "Content-Type": "application/json",
          },
          cache: "no-store",
        },
      );

      if (!response.ok) {
        throw new Error(
          `Failed to load categories (${response.status})`,
        );
      }

      const data = await response.json();

      const list: Category[] = Array.isArray(data)
        ? data
        : Array.isArray(data?.results)
          ? data.results
          : [];

      setCategories(list);
    } catch (err) {
      console.error("Failed to load categories:", err);

      if (isAuthError(err)) {
        redirectToAdminLogin();
        return;
      }

      setError(
        getErrorMessage(
          err,
          "Failed to load categories.",
        ),
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void fetchCategories();
  }, []);

  /*
   * ------------------------------------------------------------------
   * SAVE NORMAL CATEGORY ORDER
   * ------------------------------------------------------------------
   */
  async function saveCategoryOrder(
    ordered: Category[],
  ) {
    const response = await adminFetch(
      `${API_URL}/api/products/categories/reorder/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          category_ids: ordered.map(
            (category) => category.id,
          ),
        }),
      },
    );

    if (!response.ok) {
      let message = "Failed to save category order.";

      try {
        const data = await response.json();
        if (data?.detail) {
          message = data.detail;
        }
      } catch {
        // Ignore invalid JSON.
      }

      throw new Error(message);
    }

    const data = await response.json();

    const updated: Category[] = Array.isArray(data)
      ? data
      : Array.isArray(data?.results)
        ? data.results
        : ordered;

    setCategories(updated);
  }

  /*
   * ------------------------------------------------------------------
   * NORMAL CATEGORY POINTER DRAG
   * ------------------------------------------------------------------
   */

  function canReorderNormalList() {
    return (
      !search.trim() &&
      statusFilter === "all" &&
      sortOption === "display_order" &&
      !savingOrder &&
      !savingPremiumSlots
    );
  }

  function beginCategoryPointerDrag(
    event: React.PointerEvent<HTMLButtonElement>,
    categoryId: number,
  ) {
    if (!canReorderNormalList()) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    pointerDraggingRef.current = true;
    pointerMovedRef.current = false;
    draggedCategoryIdRef.current = categoryId;
    currentTargetIdRef.current = null;

    dragStartXRef.current = event.clientX;
    dragStartYRef.current = event.clientY;

    setDraggedCategoryId(categoryId);
    setDropTargetId(null);

    startAutoScroll(
      event.clientX,
      event.clientY,
      event.currentTarget,
    );

    document.body.style.userSelect = "none";
    document.body.style.cursor = "grabbing";
  }

  function updateNormalDragTarget(
    clientX: number,
    clientY: number,
  ) {
    if (!pointerDraggingRef.current) {
      return;
    }

    pointerPositionRef.current = {
      x: clientX,
      y: clientY,
    };

    const dx = clientX - dragStartXRef.current;
    const dy = clientY - dragStartYRef.current;

    if (
      !pointerMovedRef.current &&
      Math.hypot(dx, dy) < 5
    ) {
      return;
    }

    pointerMovedRef.current = true;

    const element = document.elementFromPoint(
      clientX,
      clientY,
    );

    const row = element?.closest(
      "[data-category-row-id]",
    ) as HTMLElement | null;

    if (!row) {
      currentTargetIdRef.current = null;
      setDropTargetId(null);
      return;
    }

    const rawId =
      row.getAttribute("data-category-row-id");

    const targetId = rawId
      ? Number(rawId)
      : NaN;

    if (
      !Number.isFinite(targetId) ||
      targetId === draggedCategoryIdRef.current
    ) {
      currentTargetIdRef.current = null;
      setDropTargetId(null);
      return;
    }

    currentTargetIdRef.current = targetId;
    setDropTargetId(targetId);
  }

  async function finishNormalPointerDrag() {
    const sourceId =
      draggedCategoryIdRef.current;
    const targetId =
      currentTargetIdRef.current;
    const didMove = pointerMovedRef.current;

    pointerDraggingRef.current = false;
    draggedCategoryIdRef.current = null;
    currentTargetIdRef.current = null;

    stopAutoScroll();

    document.body.style.userSelect = "";
    document.body.style.cursor = "";

    setDraggedCategoryId(null);
    setDropTargetId(null);

    if (
      !didMove ||
      sourceId === null ||
      targetId === null ||
      sourceId === targetId
    ) {
      return;
    }

    const sourceIndex = categories.findIndex(
      (category) => category.id === sourceId,
    );
    const targetIndex = categories.findIndex(
      (category) => category.id === targetId,
    );

    if (sourceIndex < 0 || targetIndex < 0) {
      return;
    }

    const previous = [...categories];
    const next = [...categories];

    const [moved] = next.splice(sourceIndex, 1);
    if (!moved) {
      return;
    }

    next.splice(targetIndex, 0, moved);

    setCategories(next);
    setSavingOrder(true);
    setError("");

    try {
      await saveCategoryOrder(next);
    } catch (err) {
      console.error(
        "Failed to save category order:",
        err,
      );

      setCategories(previous);

      if (isAuthError(err)) {
        redirectToAdminLogin();
        return;
      }

      setError(
        getErrorMessage(
          err,
          "Failed to save category order.",
        ),
      );
    } finally {
      setSavingOrder(false);
    }
  }

  /*
   * ------------------------------------------------------------------
   * PREMIUM SLOT HELPERS
   * ------------------------------------------------------------------
   */
  const premiumHomeSlots = useMemo(() => {
    return ([1, 2, 3, 4] as SlotNumber[]).map(
      (slot) => ({
        slot,
        category:
          categories.find(
            (category) =>
              isPremiumCategory(category) &&
              category.active &&
              category.featured_on_home &&
              category.home_display_order === slot,
          ) ?? null,
      }),
    );
  }, [categories]);

  const filledPremiumSlots =
    premiumHomeSlots.filter(
      (item) => item.category !== null,
    ).length;

  function getPremiumSlotFromPoint(
    clientX: number,
    clientY: number,
  ): SlotNumber | null {
    const element = document.elementFromPoint(
      clientX,
      clientY,
    );

    const slotElement =
      element?.closest(
        "[data-premium-slot]",
      ) as HTMLElement | null;

    if (!slotElement) {
      return null;
    }

    const rawSlot =
      slotElement.getAttribute(
        "data-premium-slot",
      );

    const slot = Number(rawSlot);

    if (
      slot !== 1 &&
      slot !== 2 &&
      slot !== 3 &&
      slot !== 4
    ) {
      return null;
    }

    return slot as SlotNumber;
  }

  function beginPremiumPointerDrag(
    event: React.PointerEvent<HTMLButtonElement>,
    categoryId: number,
  ) {
    if (savingPremiumSlots || savingOrder) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    const category = categories.find(
      (item) => item.id === categoryId,
    );

    if (
      !category ||
      !isPremiumCategory(category) ||
      !category.featured_on_home ||
      !category.home_display_order
    ) {
      return;
    }

    premiumPointerDraggingRef.current = true;
    premiumMovedRef.current = false;
    premiumDraggingIdRef.current = categoryId;
    premiumDropSlotRef.current = null;

    premiumStartXRef.current = event.clientX;
    premiumStartYRef.current = event.clientY;

    setPremiumDraggingId(categoryId);
    setPremiumDropSlot(null);

    startAutoScroll(
      event.clientX,
      event.clientY,
      event.currentTarget,
    );

    document.body.style.userSelect = "none";
    document.body.style.cursor = "grabbing";
  }

  function updatePremiumDragTarget(
    clientX: number,
    clientY: number,
  ) {
    if (!premiumPointerDraggingRef.current) {
      return;
    }

    pointerPositionRef.current = {
      x: clientX,
      y: clientY,
    };

    const dx =
      clientX - premiumStartXRef.current;
    const dy =
      clientY - premiumStartYRef.current;

    if (
      !premiumMovedRef.current &&
      Math.hypot(dx, dy) < 5
    ) {
      return;
    }

    premiumMovedRef.current = true;

    const slot = getPremiumSlotFromPoint(
      clientX,
      clientY,
    );

    premiumDropSlotRef.current = slot;
    setPremiumDropSlot(slot);
  }

  /*
   * Clear a Premium category first.
   * The backend validates that a category which is not featured has
   * home_display_order = 0, so we use 0 while temporarily clearing it.
   */
  async function updateCategory(
    slug: string,
    payload: {
      featured_on_home: boolean;
      home_display_order: number;
    },
  ) {
    const response = await adminFetch(
      `${API_URL}/api/products/categories/${encodeURIComponent(
        slug,
      )}/`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      },
    );

    if (!response.ok) {
      let message = "Failed to update category.";

      try {
        const data = await response.json();
        if (data?.detail) {
          message = data.detail;
        } else if (data) {
          const firstError = Object.values(data)[0];
          if (Array.isArray(firstError)) {
            message = String(firstError[0]);
          }
        }
      } catch {
        // Ignore invalid JSON.
      }

      throw new Error(message);
    }

    return response.json();
  }

  async function savePremiumSlotMove(
    sourceId: number,
    targetSlot: SlotNumber,
  ) {
    const source = categories.find(
      (category) => category.id === sourceId,
    );

    if (
      !source ||
      !isPremiumCategory(source) ||
      !source.featured_on_home ||
      !source.home_display_order
    ) {
      return;
    }

    const sourceSlot =
      source.home_display_order as SlotNumber;

    if (sourceSlot === targetSlot) {
      return;
    }

    const target =
      premiumHomeSlots.find(
        (item) => item.slot === targetSlot,
      )?.category ?? null;

    const previous = [...categories];

    /*
     * Optimistic UI first.
     */
    let optimistic = [...categories];

    optimistic = optimistic.map((category) => {
      if (category.id === source.id) {
        return {
          ...category,
          featured_on_home: true,
          home_display_order: targetSlot,
        };
      }

      if (target && category.id === target.id) {
        return {
          ...category,
          featured_on_home: true,
          home_display_order: sourceSlot,
        };
      }

      return category;
    });

    setCategories(optimistic);
    setSavingPremiumSlots(true);
    setError("");

    try {
      /*
       * If another category is occupying the target slot:
       *
       * 1. Clear source
       * 2. Clear target
       * 3. Put source in target
       * 4. Put target in source
       *
       * This avoids duplicate home_display_order values.
       */
      await updateCategory(source.slug, {
        featured_on_home: false,
        home_display_order: 0,
      });

      if (target) {
        await updateCategory(target.slug, {
          featured_on_home: false,
          home_display_order: 0,
        });
      }

      await updateCategory(source.slug, {
        featured_on_home: true,
        home_display_order: targetSlot,
      });

      if (target) {
        await updateCategory(target.slug, {
          featured_on_home: true,
          home_display_order: sourceSlot,
        });
      }

      await fetchCategories();
    } catch (err) {
      console.error(
        "Failed to save Premium Collection slots:",
        err,
      );

      setCategories(previous);

      if (isAuthError(err)) {
        redirectToAdminLogin();
        return;
      }

      setError(
        getErrorMessage(
          err,
          "Failed to save Premium Collection slot order.",
        ),
      );
    } finally {
      setSavingPremiumSlots(false);
    }
  }

  async function finishPremiumPointerDrag() {
    const sourceId =
      premiumDraggingIdRef.current;
    const targetSlot =
      premiumDropSlotRef.current;
    const didMove =
      premiumMovedRef.current;

    premiumPointerDraggingRef.current = false;
    premiumDraggingIdRef.current = null;
    premiumDropSlotRef.current = null;

    stopAutoScroll();

    document.body.style.userSelect = "";
    document.body.style.cursor = "";

    setPremiumDraggingId(null);
    setPremiumDropSlot(null);

    if (
      !didMove ||
      sourceId === null ||
      targetSlot === null
    ) {
      return;
    }

    await savePremiumSlotMove(
      sourceId,
      targetSlot,
    );
  }

  /*
   * ------------------------------------------------------------------
   * GLOBAL POINTER LISTENERS
   * ------------------------------------------------------------------
   *
   * These are attached once to document, so releasing the pointer
   * outside the original row/card still completes the drag.
   */
  useEffect(() => {
    function onPointerMove(event: PointerEvent) {
      pointerPositionRef.current = {
        x: event.clientX,
        y: event.clientY,
      };

      if (pointerDraggingRef.current) {
        updateNormalDragTarget(
          event.clientX,
          event.clientY,
        );
      }

      if (premiumPointerDraggingRef.current) {
        updatePremiumDragTarget(
          event.clientX,
          event.clientY,
        );
      }
    }

    function onPointerUp() {
      if (pointerDraggingRef.current) {
        void finishNormalPointerDrag();
        return;
      }

      if (premiumPointerDraggingRef.current) {
        void finishPremiumPointerDrag();
      }
    }

    function onPointerCancel() {
      pointerDraggingRef.current = false;
      premiumPointerDraggingRef.current = false;

      draggedCategoryIdRef.current = null;
      premiumDraggingIdRef.current = null;
      currentTargetIdRef.current = null;
      premiumDropSlotRef.current = null;

      stopAutoScroll();

      document.body.style.userSelect = "";
      document.body.style.cursor = "";

      setDraggedCategoryId(null);
      setDropTargetId(null);
      setPremiumDraggingId(null);
      setPremiumDropSlot(null);
    }

    document.addEventListener(
      "pointermove",
      onPointerMove,
    );
    document.addEventListener(
      "pointerup",
      onPointerUp,
    );
    document.addEventListener(
      "pointercancel",
      onPointerCancel,
    );

    return () => {
      document.removeEventListener(
        "pointermove",
        onPointerMove,
      );
      document.removeEventListener(
        "pointerup",
        onPointerUp,
      );
      document.removeEventListener(
        "pointercancel",
        onPointerCancel,
      );

      stopAutoScroll();
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
    };
  });

  /*
   * ------------------------------------------------------------------
   * DELETE
   * ------------------------------------------------------------------
   */
  async function handleDelete(category: Category) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${category.name}"?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(category.id);
      setError("");

      const response = await adminFetch(
        `${API_URL}/api/products/categories/${encodeURIComponent(
          category.slug,
        )}/`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        let message = "Failed to delete category.";

        try {
          const data = await response.json();
          if (data?.detail) {
            message = data.detail;
          }
        } catch {
          // Ignore invalid JSON.
        }

        throw new Error(message);
      }

      await fetchCategories();
    } catch (err) {
      console.error(
        "Failed to delete category:",
        err,
      );

      if (isAuthError(err)) {
        redirectToAdminLogin();
        return;
      }

      setError(
        getErrorMessage(
          err,
          "Failed to delete category.",
        ),
      );
    } finally {
      setDeletingId(null);
    }
  }

  /*
   * ------------------------------------------------------------------
   * FILTERED LIST
   * ------------------------------------------------------------------
   */
  const filteredCategories = useMemo(() => {
    const query = search.trim().toLowerCase();

    const result = categories.filter((category) => {
      if (
        statusFilter === "active" &&
        !category.active
      ) {
        return false;
      }

      if (
        statusFilter === "inactive" &&
        category.active
      ) {
        return false;
      }

      if (!query) {
        return true;
      }

      return [
        category.name,
        category.slug,
        category.description,
        category.collection_name,
        category.collection_slug,
      ]
        .filter(Boolean)
        .some((value) =>
          String(value)
            .toLowerCase()
            .includes(query),
        );
    });

    return [...result].sort((a, b) => {
      switch (sortOption) {
        case "newest":
          return (
            new Date(b.created_at).getTime() -
            new Date(a.created_at).getTime()
          );

        case "oldest":
          return (
            new Date(a.created_at).getTime() -
            new Date(b.created_at).getTime()
          );

        case "name_asc":
          return a.name.localeCompare(b.name);

        case "name_desc":
          return b.name.localeCompare(a.name);

        case "display_order":
        default:
          return (
            (a.display_order ?? 0) -
            (b.display_order ?? 0)
          );
      }
    });
  }, [
    categories,
    search,
    statusFilter,
    sortOption,
  ]);

  const totalCategories = categories.length;
  const activeCategories = categories.filter(
    (category) => category.active,
  ).length;
  const productsInCategories = categories.reduce(
    (total, category) =>
      total + (category.product_count || 0),
    0,
  );

  const normalDragEnabled =
    canReorderNormalList();

  /*
   * ------------------------------------------------------------------
   * RENDER
   * ------------------------------------------------------------------
   */
  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-4xl text-primary">
            Categories
          </h1>
          <p className="mt-2 text-base text-muted-foreground">
            Manage product categories used throughout
            the Meenakshi Screen catalogue.
          </p>
        </div>

        <Link
          href="/admin/categories/new"
          className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Add Category
        </Link>
      </div>

      {error && (
        <div className="mt-6 rounded-lg border border-red-500/30 bg-red-500/10 px-5 py-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* ============================================================
          PREMIUM COLLECTION — 4 HOME PAGE SLOTS
          ============================================================ */}
      <section className="mt-8 overflow-hidden rounded-2xl border border-primary/20 bg-card shadow-sm">
        <div className="flex flex-col gap-4 border-b border-border/70 bg-primary/[0.04] px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Crown className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Premium Collection — Home Page
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Drag the cards below to rearrange the
                4 Premium Collection slots.
              </p>
            </div>
          </div>

          <div className="inline-flex w-fit items-center rounded-full bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground">
            {filledPremiumSlots}/4 slots filled
          </div>
        </div>

        <div className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-4">
          {premiumHomeSlots.map(
            ({ slot, category }) => {
              const isDropTarget =
                premiumDropSlot === slot &&
                premiumDraggingId !== null;

              const isDragged =
                category?.id ===
                premiumDraggingId;

              return (
                <div
                  key={slot}
                  data-premium-slot={slot}
                  className={`
                    min-h-[170px]
                    rounded-xl
                    border
                    p-4
                    transition-all
                    ${
                      isDropTarget
                        ? "scale-[1.02] border-primary bg-primary/10 ring-2 ring-primary/30"
                        : category
                          ? "border-primary/20 bg-background"
                          : "border-dashed border-border bg-muted/20"
                    }
                    ${
                      isDragged
                        ? "opacity-40"
                        : "opacity-100"
                    }
                  `}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">
                      Slot {slot}
                    </span>

                    <span className="text-[11px] text-muted-foreground">
                      {SLOT_LABELS[slot]}
                    </span>
                  </div>

                  {category ? (
                    <div className="mt-4">
                      <div className="flex items-start gap-3">
                        <button
                          type="button"
                          aria-label={`Drag ${category.name}`}
                          onPointerDown={(event) =>
                            beginPremiumPointerDrag(
                              event,
                              category.id,
                            )
                          }
                          className="mt-0.5 shrink-0 select-none touch-none cursor-grab rounded-md p-1 text-muted-foreground transition hover:bg-muted hover:text-foreground active:cursor-grabbing"
                        >
                          <GripVertical className="h-5 w-5" />
                        </button>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-foreground">
                                {category.name}
                              </p>
                              <p className="mt-1 truncate font-mono text-[11px] text-muted-foreground">
                                {category.slug}
                              </p>
                            </div>

                            <span className="shrink-0 rounded-full bg-green-500/10 px-2 py-1 text-[10px] font-medium text-green-700">
                              Active
                            </span>
                          </div>

                          <Link
                            href={`/admin/categories/${encodeURIComponent(
                              category.slug,
                            )}`}
                            className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-primary transition hover:underline"
                          >
                            Edit category
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-5 flex min-h-[90px] items-center justify-center rounded-lg border border-dashed border-border/70 bg-muted/10 text-center">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          {isDropTarget
                            ? "Drop category here"
                            : "Empty slot"}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {isDropTarget
                            ? `Move to position ${slot}`
                            : `Position ${slot}`}
                        </p>
                      </div>
                    </div>
                  )}

                  {isDropTarget && (
                    <p className="mt-3 text-center text-[11px] font-medium text-primary">
                      Release to place here
                    </p>
                  )}
                </div>
              );
            },
          )}
        </div>

        <div className="border-t border-border/70 px-5 py-3 text-xs text-muted-foreground">
          <span className="font-medium text-foreground">
            Drag handle → drop on another slot.
          </span>{" "}
          If the target is occupied, the two categories
          swap positions. If it is empty, the category
          moves into that slot.
          {savingPremiumSlots && (
            <span className="ml-3 inline-flex items-center gap-2 text-primary">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Saving slot order...
            </span>
          )}
        </div>
      </section>

      {/* ============================================================
          NORMAL CATEGORY ORDER
          ============================================================ */}
      <div className="mt-6 flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-muted-foreground">
        <GripVertical className="h-5 w-5 shrink-0 text-primary" />
        <span>
          <span className="font-medium text-foreground">
            Drag the handle
          </span>{" "}
          on a category row to change the normal
          Categories section order on the Home page.
        </span>

        {savingOrder && (
          <span className="ml-auto inline-flex items-center gap-2 text-xs text-primary">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Saving...
          </span>
        )}
      </div>

      {!normalDragEnabled && (
        <p className="mt-3 text-xs text-muted-foreground">
          Clear the search and filters and select
          Display Order to enable category dragging.
        </p>
      )}

      {/* ============================================================
          STATISTICS
          ============================================================ */}
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border bg-background p-6">
          <p className="text-sm text-muted-foreground">
            Total Categories
          </p>
          <p className="mt-2 text-4xl font-semibold text-foreground">
            {loading ? "—" : totalCategories}
          </p>
        </div>

        <div className="rounded-2xl border bg-background p-6">
          <p className="text-sm text-muted-foreground">
            Active Categories
          </p>
          <p className="mt-2 text-4xl font-semibold text-foreground">
            {loading ? "—" : activeCategories}
          </p>
        </div>

        <div className="rounded-2xl border bg-background p-6">
          <p className="text-sm text-muted-foreground">
            Products in Categories
          </p>
          <p className="mt-2 text-4xl font-semibold text-foreground">
            {loading ? "—" : productsInCategories}
          </p>
        </div>
      </div>

      {/* ============================================================
          SEARCH / FILTERS
          ============================================================ */}
      <div className="mt-8 grid gap-3 lg:grid-cols-[1fr_200px_220px]">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search categories..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            className="h-12 w-full rounded-xl border bg-background pl-12 pr-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(
              event.target.value as StatusFilter,
            )
          }
          className="h-12 rounded-xl border bg-background px-4 text-sm outline-none transition focus:border-primary"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>

        <select
          value={sortOption}
          onChange={(event) =>
            setSortOption(
              event.target.value as SortOption,
            )
          }
          className="h-12 rounded-xl border bg-background px-4 text-sm outline-none transition focus:border-primary"
        >
          <option value="display_order">
            Display Order
          </option>
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="name_asc">Name A–Z</option>
          <option value="name_desc">Name Z–A</option>
        </select>
      </div>

      {/* ============================================================
          CATEGORY TABLE
          ============================================================ */}
      {loading ? (
        <div className="mt-6 rounded-2xl border bg-card p-10 text-center">
          <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
          <p className="mt-3 text-sm text-muted-foreground">
            Loading categories...
          </p>
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="mt-6 rounded-2xl border bg-card p-10 text-center">
          <h3 className="text-lg font-semibold">
            {categories.length === 0
              ? "No categories yet"
              : "No matching categories"}
          </h3>

          <p className="mt-2 text-sm text-muted-foreground">
            {categories.length === 0
              ? "Create your first category to get started."
              : "Try changing your search or filters."}
          </p>

          {categories.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setStatusFilter("all");
                setSortOption("display_order");
              }}
              className="mt-4 rounded-lg border px-4 py-2 text-sm font-medium transition hover:bg-muted"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-2xl border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-muted/40">
                <tr className="text-left text-sm">
                  <th className="w-20 px-6 py-4 font-medium">
                    Order
                  </th>
                  <th className="px-6 py-4 font-medium">
                    Category
                  </th>
                  <th className="px-6 py-4 font-medium">
                    Slug
                  </th>
                  <th className="px-6 py-4 font-medium">
                    Collection
                  </th>
                  <th className="px-6 py-4 font-medium">
                    Products
                  </th>
                  <th className="px-6 py-4 font-medium">
                    Status
                  </th>
                  <th className="px-6 py-4 text-right font-medium">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredCategories.map(
                  (category) => {
                    const canDrag =
                      normalDragEnabled;
                    const isDragging =
                      draggedCategoryId ===
                      category.id;
                    const isDropTarget =
                      dropTargetId ===
                      category.id;

                    const premium =
                      isPremiumCategory(
                        category,
                      );

                    return (
                      <tr
                        key={category.id}
                        data-category-row-id={
                          category.id
                        }
                        className={`
                          border-b
                          transition-all
                          last:border-0
                          ${
                            isDragging
                              ? "bg-primary/10 opacity-50"
                              : isDropTarget
                                ? "bg-primary/10 ring-2 ring-inset ring-primary"
                                : "hover:bg-muted/30"
                          }
                        `}
                      >
                        <td className="px-6 py-6">
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              aria-label={`Drag ${category.name}`}
                              disabled={!canDrag}
                              onPointerDown={(
                                event,
                              ) =>
                                beginCategoryPointerDrag(
                                  event,
                                  category.id,
                                )
                              }
                              className={`
                                select-none
                                touch-none
                                rounded-md
                                p-1
                                transition
                                ${
                                  canDrag
                                    ? "cursor-grab text-muted-foreground hover:bg-muted hover:text-foreground active:cursor-grabbing"
                                    : "cursor-not-allowed text-muted-foreground/30"
                                }
                              `}
                            >
                              <GripVertical className="h-5 w-5" />
                            </button>

                            <span className="text-sm font-medium">
                              {category.display_order}
                            </span>
                          </div>
                        </td>

                        <td className="px-6 py-6">
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">
                                {category.name}
                              </p>

                              {premium &&
                                category.featured_on_home && (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-[10px] font-semibold text-primary">
                                    <Crown className="h-3 w-3" />
                                    Slot{" "}
                                    {
                                      category.home_display_order
                                    }
                                  </span>
                                )}
                            </div>

                            {category.description && (
                              <p className="mt-1 max-w-md text-sm text-muted-foreground">
                                {category.description}
                              </p>
                            )}
                          </div>
                        </td>

                        <td className="px-6 py-6">
                          <span className="inline-flex rounded-full bg-muted px-3 py-1 font-mono text-xs text-muted-foreground">
                            {category.slug}
                          </span>
                        </td>

                        <td className="px-6 py-6">
                          {category.collection_name ? (
                            <div>
                              <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
                                {category.collection_name}
                              </span>

                              {category.collection_slug && (
                                <p className="mt-1 font-mono text-[11px] text-muted-foreground">
                                  {category.collection_slug}
                                </p>
                              )}
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">
                              —
                            </span>
                          )}
                        </td>

                        <td className="px-6 py-6 text-sm">
                          {category.product_count ?? 0}
                        </td>

                        <td className="px-6 py-6">
                          {category.active ? (
                            <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                              Inactive
                            </span>
                          )}
                        </td>

                        <td className="px-6 py-6">
                          <div className="flex items-center justify-end gap-4">
                            <Link
                              href={`/admin/categories/${encodeURIComponent(
                                category.slug,
                              )}`}
                              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                            >
                              <Edit className="h-4 w-4" />
                              Edit
                            </Link>

                            <button
                              type="button"
                              disabled={
                                deletingId ===
                                category.id
                              }
                              onClick={() =>
                                void handleDelete(
                                  category,
                                )
                              }
                              className="inline-flex items-center gap-1.5 text-sm font-medium text-destructive hover:underline disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {deletingId ===
                              category.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  },
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
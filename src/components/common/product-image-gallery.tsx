"use client";

import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minus,
  Plus,
  RotateCcw,
  X,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

interface ProductImage {
  id: number;
  image: string;
  cloudinary_public_id?: string;
  is_primary: boolean;
  display_order: number;
}

interface ProductImageGalleryProps {
  productName: string;
  primaryImage?: string | null;
  images?: ProductImage[];
}

const MIN_ZOOM = 1;
const DOUBLE_TAP_ZOOM = 2;
const MAX_ZOOM = 4;
const ZOOM_STEP = 0.25;

const SWIPE_THRESHOLD = 60;

export function ProductImageGallery({
  productName,
  primaryImage,
  images = [],
}: ProductImageGalleryProps) {
  /* ==========================================================
     PREPARE GALLERY IMAGES
  ========================================================== */

  const galleryImages = useMemo(() => {
    const validImages = images
      .filter(
        (item) =>
          item.image &&
          typeof item.image === "string",
      )
      .sort(
        (a, b) =>
          a.display_order -
          b.display_order,
      );

    if (validImages.length > 0) {
      return validImages;
    }

    if (primaryImage) {
      return [
        {
          id: 0,
          image: primaryImage,
          is_primary: true,
          display_order: 0,
        },
      ];
    }

    return [];
  }, [images, primaryImage]);

  /* ==========================================================
     STATES
  ========================================================== */

  const initialIndex = Math.max(
    0,
    galleryImages.findIndex(
      (item) => item.is_primary,
    ),
  );

  const [selectedIndex, setSelectedIndex] =
    useState(initialIndex);

  const [isModalOpen, setIsModalOpen] =
    useState(false);

  const [zoom, setZoom] =
    useState(MIN_ZOOM);

  const [position, setPosition] =
    useState({
      x: 0,
      y: 0,
    });

  const [isDragging, setIsDragging] =
    useState(false);

  const dragStart = useRef({
    x: 0,
    y: 0,
  });

  const imagePositionStart = useRef({
    x: 0,
    y: 0,
  });

  const swipeStart = useRef({
    x: 0,
    y: 0,
  });

  const lastTap = useRef(0);

  /* ==========================================================
     CURRENT IMAGE
  ========================================================== */

  const selectedImage =
    galleryImages[selectedIndex]?.image ||
    primaryImage ||
    null;

  /* ==========================================================
     RESET ZOOM
  ========================================================== */

  function resetZoom() {
    setZoom(MIN_ZOOM);

    setPosition({
      x: 0,
      y: 0,
    });
  }

  /* ==========================================================
     DOUBLE TAP / DOUBLE CLICK ZOOM
  ========================================================== */

  function toggleDoubleTapZoom() {
    setZoom((currentZoom) => {
      if (currentZoom > MIN_ZOOM) {
        setPosition({
          x: 0,
          y: 0,
        });

        return MIN_ZOOM;
      }

      return DOUBLE_TAP_ZOOM;
    });
  }

  /* ==========================================================
     OPEN MODAL
  ========================================================== */

  function openModal(index: number) {
    setSelectedIndex(index);

    resetZoom();

    setIsModalOpen(true);
  }

  /* ==========================================================
     CLOSE MODAL
  ========================================================== */

  function closeModal() {
    setIsModalOpen(false);

    resetZoom();
  }

  /* ==========================================================
     SELECT IMAGE
  ========================================================== */

  function selectImage(index: number) {
    setSelectedIndex(index);

    resetZoom();
  }

  /* ==========================================================
     NEXT IMAGE
  ========================================================== */

  function nextImage() {
    if (galleryImages.length <= 1) {
      return;
    }

    setSelectedIndex((current) => {
      if (
        current ===
        galleryImages.length - 1
      ) {
        return 0;
      }

      return current + 1;
    });

    resetZoom();
  }

  /* ==========================================================
     PREVIOUS IMAGE
  ========================================================== */

  function previousImage() {
    if (galleryImages.length <= 1) {
      return;
    }

    setSelectedIndex((current) => {
      if (current === 0) {
        return galleryImages.length - 1;
      }

      return current - 1;
    });

    resetZoom();
  }

  /* ==========================================================
     ZOOM IN
  ========================================================== */

  function zoomIn() {
    setZoom((current) =>
      Math.min(
        MAX_ZOOM,
        Number(
          (
            current +
            ZOOM_STEP
          ).toFixed(2),
        ),
      ),
    );
  }

  /* ==========================================================
     ZOOM OUT
  ========================================================== */

  function zoomOut() {
    setZoom((current) => {
      const newZoom = Math.max(
        MIN_ZOOM,
        Number(
          (
            current -
            ZOOM_STEP
          ).toFixed(2),
        ),
      );

      if (newZoom === MIN_ZOOM) {
        setPosition({
          x: 0,
          y: 0,
        });
      }

      return newZoom;
    });
  }

  /* ==========================================================
     MOUSE WHEEL ZOOM
  ========================================================== */

  function handleWheel(
    event: React.WheelEvent<HTMLDivElement>,
  ) {
    event.preventDefault();

    if (event.deltaY < 0) {
      zoomIn();
    } else {
      zoomOut();
    }
  }

  /* ==========================================================
     POINTER DOWN
  ========================================================== */

  function handlePointerDown(
    event: React.PointerEvent<HTMLDivElement>,
  ) {
    swipeStart.current = {
      x: event.clientX,
      y: event.clientY,
    };

    if (zoom <= MIN_ZOOM) {
      return;
    }

    event.currentTarget.setPointerCapture(
      event.pointerId,
    );

    setIsDragging(true);

    dragStart.current = {
      x: event.clientX,
      y: event.clientY,
    };

    imagePositionStart.current = {
      x: position.x,
      y: position.y,
    };
  }

  /* ==========================================================
     DRAG IMAGE WHEN ZOOMED
  ========================================================== */

  function handlePointerMove(
    event: React.PointerEvent<HTMLDivElement>,
  ) {
    if (
      !isDragging ||
      zoom <= MIN_ZOOM
    ) {
      return;
    }

    const deltaX =
      event.clientX -
      dragStart.current.x;

    const deltaY =
      event.clientY -
      dragStart.current.y;

    setPosition({
      x:
        imagePositionStart.current.x +
        deltaX,
      y:
        imagePositionStart.current.y +
        deltaY,
    });
  }

  /* ==========================================================
     POINTER UP
     
     SWIPE WHEN NOT ZOOMED
     DOUBLE TAP ZOOM
  ========================================================== */

  function handlePointerUp(
    event: React.PointerEvent<HTMLDivElement>,
  ) {
    const deltaX =
      event.clientX -
      swipeStart.current.x;

    const deltaY =
      event.clientY -
      swipeStart.current.y;

    setIsDragging(false);

    /* ================================================
       DRAGGED IMAGE WHILE ZOOMED
    ================================================= */

    if (zoom > MIN_ZOOM) {
      return;
    }

    /* ================================================
       SWIPE LEFT / RIGHT
    ================================================= */

    const horizontalSwipe =
      Math.abs(deltaX) >
      Math.abs(deltaY);

    if (
      horizontalSwipe &&
      Math.abs(deltaX) >=
        SWIPE_THRESHOLD
    ) {
      if (deltaX < 0) {
        nextImage();
      } else {
        previousImage();
      }

      lastTap.current = 0;

      return;
    }

    /* ================================================
       DOUBLE TAP
    ================================================= */

    const now = Date.now();

    const difference =
      now - lastTap.current;

    if (
      difference > 0 &&
      difference < 300
    ) {
      event.preventDefault();

      toggleDoubleTapZoom();

      lastTap.current = 0;
    } else {
      lastTap.current = now;
    }
  }

  /* ==========================================================
     KEYBOARD CONTROLS
  ========================================================== */

  useEffect(() => {
    function handleKeyDown(
      event: KeyboardEvent,
    ) {
      if (!isModalOpen) {
        return;
      }

      if (event.key === "Escape") {
        closeModal();
      }

      if (event.key === "ArrowRight") {
        nextImage();
      }

      if (event.key === "ArrowLeft") {
        previousImage();
      }

      if (event.key === "+") {
        zoomIn();
      }

      if (event.key === "-") {
        zoomOut();
      }
    }

    window.addEventListener(
      "keydown",
      handleKeyDown,
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown,
      );
    };
  }, [
    isModalOpen,
    selectedIndex,
    galleryImages.length,
  ]);

  /* ==========================================================
     NO IMAGE
  ========================================================== */

  if (!selectedImage) {
    return (
      <div
        className="
          flex
          aspect-[4/5]
          w-full
          items-center
          justify-center
          rounded-3xl
          border
          bg-muted/20
          text-sm
          text-muted-foreground
        "
      >
        No image available
      </div>
    );
  }

  return (
    <>
      {/* ======================================================
          NORMAL PRODUCT GALLERY
      ======================================================= */}

      <div className="w-full">
        <div
          className="
            flex
            flex-col-reverse
            gap-4
            sm:flex-row
          "
        >
          {/* ==================================================
              LEFT SIDE THUMBNAILS
          =================================================== */}

          {galleryImages.length > 1 && (
            <div
              className="
                flex
                shrink-0
                flex-row
                gap-3
                overflow-x-auto
                pb-2
                sm:max-h-[620px]
                sm:w-20
                sm:flex-col
                sm:overflow-y-auto
                sm:overflow-x-hidden
                sm:pb-0
              "
            >
              {galleryImages.map(
                (item, index) => {
                  const isSelected =
                    selectedIndex === index;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() =>
                        selectImage(index)
                      }
                      onDoubleClick={() =>
                        openModal(index)
                      }
                      className={`
                        relative
                        h-16
                        w-16
                        shrink-0
                        overflow-hidden
                        rounded-xl
                        border-2
                        bg-muted/20
                        transition-all
                        duration-300
                        hover:scale-105
                        ${
                          isSelected
                            ? "border-primary ring-2 ring-primary/30"
                            : "border-border hover:border-primary/50"
                        }
                      `}
                      aria-label={`View image ${
                        index + 1
                      }`}
                    >
                      <Image
                        src={item.image}
                        alt={`${productName} ${
                          index + 1
                        }`}
                        fill
                        sizes="100px"
                        className="object-cover"
                      />

                      {item.is_primary && (
                        <span
                          className="
                            absolute
                            bottom-1
                            left-1
                            rounded-full
                            bg-primary
                            px-1.5
                            py-0.5
                            text-[8px]
                            font-semibold
                            text-primary-foreground
                          "
                        >
                          Main
                        </span>
                      )}
                    </button>
                  );
                },
              )}
            </div>
          )}

          {/* ==================================================
              MAIN IMAGE
          =================================================== */}

          <button
            type="button"
            onClick={() =>
              openModal(selectedIndex)
            }
            className="
              group
              relative
              min-w-0
              flex-1
              overflow-hidden
              rounded-3xl
              border
              bg-muted/20
              text-left
            "
            aria-label={`View ${productName} image`}
          >
            <div
              className="
                relative
                aspect-[4/5]
                w-full
              "
            >
              <Image
                src={selectedImage}
                alt={productName}
                fill
                sizes="
                  (max-width: 640px) 100vw,
                  50vw
                "
                className="
                  object-cover
                  transition-transform
                  duration-500
                  group-hover:scale-[1.02]
                "
                priority
              />
            </div>

            {/* VIEW FULL IMAGE */}

            <div
              className="
                absolute
                inset-0
                flex
                items-center
                justify-center
                bg-black/0
                opacity-0
                transition-all
                duration-300
                group-hover:bg-black/20
                group-hover:opacity-100
              "
            >
              <div
                className="
                  flex
                  items-center
                  gap-2
                  rounded-full
                  bg-black/70
                  px-4
                  py-2
                  text-sm
                  font-medium
                  text-white
                  backdrop-blur-md
                "
              >
                <Maximize2 className="h-4 w-4" />

                View Full Image
              </div>
            </div>
          </button>
        </div>

        {/* IMAGE COUNT */}

        {galleryImages.length > 1 && (
          <p
            className="
              mt-4
              text-center
              text-xs
              text-muted-foreground
            "
          >
            {galleryImages.length} product images
          </p>
        )}
      </div>

      {/* ======================================================
          FULL SCREEN IMAGE VIEWER
      ======================================================= */}

      {isModalOpen && selectedImage && (
        <div
          className="
            fixed
            inset-0
            z-[100]
            bg-black/95
          "
          role="dialog"
          aria-modal="true"
        >
          {/* ==================================================
              CLOSE BUTTON
          =================================================== */}

          <button
            type="button"
            onClick={closeModal}
            className="
              absolute
              right-5
              top-5
              z-[120]
              flex
              h-12
              w-12
              items-center
              justify-center
              rounded-full
              bg-white/10
              text-white
              transition
              hover:bg-white/20
            "
            aria-label="Close"
          >
            <X className="h-6 w-6" />
          </button>

          {/* ==================================================
              ZOOM CONTROLS
          =================================================== */}

          <div
            className="
              absolute
              right-5
              top-20
              z-[120]
              flex
              flex-col
              gap-2
              rounded-2xl
              bg-black/60
              p-2
              text-white
              backdrop-blur-xl
            "
          >
            <button
              type="button"
              onClick={zoomIn}
              disabled={
                zoom >= MAX_ZOOM
              }
              className="
                flex
                h-11
                w-11
                items-center
                justify-center
                rounded-xl
                transition
                hover:bg-white/10
                disabled:opacity-40
              "
              aria-label="Zoom in"
            >
              <Plus className="h-5 w-5" />
            </button>

            <div
              className="
                py-1
                text-center
                text-xs
                font-medium
              "
            >
              {Math.round(zoom * 100)}%
            </div>

            <button
              type="button"
              onClick={zoomOut}
              disabled={
                zoom <= MIN_ZOOM
              }
              className="
                flex
                h-11
                w-11
                items-center
                justify-center
                rounded-xl
                transition
                hover:bg-white/10
                disabled:opacity-40
              "
              aria-label="Zoom out"
            >
              <Minus className="h-5 w-5" />
            </button>

            <button
              type="button"
              onClick={resetZoom}
              className="
                flex
                h-11
                w-11
                items-center
                justify-center
                rounded-xl
                transition
                hover:bg-white/10
              "
              aria-label="Reset zoom"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>

          {/* ==================================================
              MAIN VIEWER LAYOUT
          =================================================== */}

          <div
            className="
              flex
              h-full
              w-full
              items-center
              gap-4
              p-4
              pr-20
              sm:gap-6
              sm:p-8
              sm:pr-24
            "
          >
            {/* ================================================
                LEFT SIDE THUMBNAILS
            ================================================= */}

            {galleryImages.length > 1 && (
              <div
                className="
                  flex
                  h-[75vh]
                  w-16
                  shrink-0
                  flex-col
                  gap-3
                  overflow-y-auto
                  rounded-2xl
                  bg-white/5
                  p-2
                  backdrop-blur-md
                  sm:w-20
                "
              >
                {galleryImages.map(
                  (item, index) => {
                    const isSelected =
                      selectedIndex === index;

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() =>
                          selectImage(index)
                        }
                        className={`
                          relative
                          aspect-square
                          w-full
                          shrink-0
                          overflow-hidden
                          rounded-lg
                          border-2
                          transition
                          ${
                            isSelected
                              ? "border-white"
                              : "border-transparent opacity-60 hover:opacity-100"
                          }
                        `}
                        aria-label={`Select image ${
                          index + 1
                        }`}
                      >
                        <Image
                          src={item.image}
                          alt={`${productName} ${
                            index + 1
                          }`}
                          fill
                          sizes="100px"
                          className="object-cover"
                        />
                      </button>
                    );
                  },
                )}
              </div>
            )}

            {/* ================================================
                MAIN IMAGE VIEWER

                IMAGE + PREVIOUS/NEXT BUTTONS
                ARE IN THE SAME CONTAINER
            ================================================= */}

            <div
              className="
                relative
                flex
                h-[75vh]
                min-w-0
                flex-1
                items-center
                justify-center
              "
            >
              {/* ============================================
                  LARGE ZOOMABLE IMAGE
              ============================================= */}

              <div
                className={`
                  relative
                  flex
                  h-full
                  w-full
                  items-center
                  justify-center
                  overflow-hidden
                  touch-none
                  rounded-2xl
                  ${
                    zoom > MIN_ZOOM
                      ? isDragging
                        ? "cursor-grabbing"
                        : "cursor-grab"
                      : "cursor-zoom-in"
                  }
                `}
                onWheel={handleWheel}
                onDoubleClick={
                  toggleDoubleTapZoom
                }
                onPointerDown={
                  handlePointerDown
                }
                onPointerMove={
                  handlePointerMove
                }
                onPointerUp={
                  handlePointerUp
                }
                onPointerCancel={() =>
                  setIsDragging(false)
                }
              >
                <div
                  className="
                    relative
                    h-full
                    w-full
                    select-none
                  "
                  style={{
                    transform: `
                      translate(
                        ${position.x}px,
                        ${position.y}px
                      )
                      scale(${zoom})
                    `,
                    transition: isDragging
                      ? "none"
                      : "transform 150ms ease-out",
                  }}
                >
                  <Image
                    src={selectedImage}
                    alt={productName}
                    fill
                    sizes="80vw"
                    priority
                    draggable={false}
                    className="
                      pointer-events-none
                      object-contain
                    "
                  />
                </div>
              </div>

              {/* ============================================
                  PREVIOUS BUTTON

                  VERTICALLY CENTERED WITH IMAGE
              ============================================= */}

              {galleryImages.length > 1 && (
                <button
                  type="button"
                  onClick={previousImage}
                  className="
                    absolute
                    left-3
                    top-1/2
                    z-[120]

                    flex
                    h-12
                    w-12

                    -translate-y-1/2

                    items-center
                    justify-center

                    rounded-full
                    bg-black/60
                    text-white

                    backdrop-blur-md

                    transition-all
                    duration-300

                    hover:scale-110
                    hover:bg-black/80

                    sm:left-5
                    sm:h-14
                    sm:w-14
                  "
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-7 w-7" />
                </button>
              )}

              {/* ============================================
                  NEXT BUTTON

                  VERTICALLY CENTERED WITH IMAGE
              ============================================= */}

              {galleryImages.length > 1 && (
                <button
                  type="button"
                  onClick={nextImage}
                  className="
                    absolute
                    right-3
                    top-1/2
                    z-[120]

                    flex
                    h-12
                    w-12

                    -translate-y-1/2

                    items-center
                    justify-center

                    rounded-full
                    bg-black/60
                    text-white

                    backdrop-blur-md

                    transition-all
                    duration-300

                    hover:scale-110
                    hover:bg-black/80

                    sm:right-5
                    sm:h-14
                    sm:w-14
                  "
                  aria-label="Next image"
                >
                  <ChevronRight className="h-7 w-7" />
                </button>
              )}
            </div>
          </div>

          {/* ==================================================
              IMAGE COUNT
          =================================================== */}

          <div
            className="
              absolute
              bottom-5
              right-5
              z-[120]
              rounded-full
              bg-black/60
              px-4
              py-2
              text-sm
              text-white
              backdrop-blur-md
            "
          >
            Image {selectedIndex + 1} of{" "}
            {galleryImages.length}
          </div>

          {/* ==================================================
              HELP TEXT
          =================================================== */}

          <div
            className="
              absolute
              bottom-5
              left-5
              z-[120]
              hidden
              text-xs
              text-white/60
              lg:block
            "
          >
            Double click to zoom • Swipe to change image •
            Scroll to zoom • Drag to move
          </div>
        </div>
      )}
    </>
  );
}
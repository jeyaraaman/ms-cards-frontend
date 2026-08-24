import { Suspense } from "react";

import { CataloguePage } from "@/features/catalogue/catalogue-page";

function CatalogueLoading() {
  return (
    <section className="py-16">
      <div className="mx-auto max-w-7xl px-4">
        <div className="py-20 text-center text-muted-foreground">
          Loading catalogue...
        </div>
      </div>
    </section>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<CatalogueLoading />}>
      <CataloguePage />
    </Suspense>
  );
}
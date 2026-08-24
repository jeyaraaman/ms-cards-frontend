import { Suspense } from "react";

import { EnquiryPage } from "@/features/enquiry/enquiry-page";

function EnquiryLoading() {
  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <p className="text-muted-foreground">
        Loading enquiry form...
      </p>
    </div>
  );
}

export default function EnquiryRoute() {
  return (
    <Suspense fallback={<EnquiryLoading />}>
      <EnquiryPage />
    </Suspense>
  );
}
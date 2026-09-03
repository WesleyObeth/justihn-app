import type { Metadata } from "next";
import { Suspense } from "react";
import { Vista } from "@/components/portal/marco";
import { NuevaPropuesta } from "@/components/portal/nueva-propuesta";

export const metadata: Metadata = { title: "Nueva propuesta de honorarios" };

export default function PaginaNuevaPropuesta() {
  return (
    <Vista titulo="Nueva propuesta de honorarios">
      {/* Suspense: lee `?caso=` y `?tramite=` con useSearchParams. */}
      <Suspense fallback={null}>
        <NuevaPropuesta />
      </Suspense>
    </Vista>
  );
}

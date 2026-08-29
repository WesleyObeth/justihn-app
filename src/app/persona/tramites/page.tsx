import type { Metadata } from "next";
import { TramitesPersona } from "@/components/personas/tramites-persona";

export const metadata: Metadata = { title: "Trámites" };

export default function PaginaTramitesPersona() {
  return <TramitesPersona />;
}

import type { Metadata } from "next";
import { PlanPersona } from "@/components/personas/plan-persona";

export const metadata: Metadata = { title: "Mi plan" };

export default function PaginaPlanPersona() {
  return <PlanPersona />;
}

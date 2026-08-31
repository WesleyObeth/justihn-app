import type { Metadata } from "next";
import { MonitoreoPersona } from "@/components/personas/monitoreo-persona";

export const metadata: Metadata = { title: "Mi nombre" };

export default function PaginaMonitoreoPersona() {
  return <MonitoreoPersona />;
}

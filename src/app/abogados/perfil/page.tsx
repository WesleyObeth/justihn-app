import type { Metadata } from "next";
import { Vista } from "@/components/portal/marco";
import { PantallaPerfil } from "@/components/portal/pantalla-perfil";

export const metadata: Metadata = { title: "Mi perfil" };

export default function PaginaPerfil() {
  return (
    <Vista titulo="Mi perfil" ancho="max-w-[1280px]">
      <PantallaPerfil />
    </Vista>
  );
}

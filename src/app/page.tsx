import { redirect } from "next/navigation";

/** La raíz entra al portal. TODO(auth): con sesión cableada, a `/entrar` si no hay sesión. */
export default function Home() {
  redirect("/abogados");
}

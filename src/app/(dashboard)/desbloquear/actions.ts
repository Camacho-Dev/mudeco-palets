"use server";

import { redirect } from "next/navigation";
import { requireSession } from "@/lib/session";

/** Compat: el bloqueo por clave ya no existe; el acceso es por rol. */
export async function unlockSensitiveArea() {
  const session = await requireSession();
  redirect(session.user.role === "ADMIN" ? "/panel" : "/vender?error=sin-permiso");
}

export async function lockSensitiveArea() {
  await requireSession();
  redirect("/vender");
}

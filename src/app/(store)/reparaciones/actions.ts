"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  createWebServiceRequest,
  type ServiceRequestKind,
} from "@/lib/web-checkout";

export async function submitServiceRequest(fd: FormData) {
  const name = String(fd.get("name") || "").trim();
  const email = String(fd.get("email") || "").trim();
  const phone = String(fd.get("phone") || "").trim();
  const kindRaw = String(fd.get("kind") || "repair");
  const kind: ServiceRequestKind =
    kindRaw === "quote"
      ? "quote"
      : kindRaw === "contact"
        ? "contact"
        : "repair";
  const piece = String(fd.get("piece") || "").trim();
  const description = String(fd.get("description") || "").trim();
  const photoNote = String(fd.get("photoNote") || "").trim() || undefined;

  if (!name) throw new Error("Nombre requerido");
  if (!email || !email.includes("@")) throw new Error("Email válido requerido");
  if (!phone) throw new Error("Teléfono requerido");
  if (!description) throw new Error("Describe lo que necesitas");

  const { order } = await createWebServiceRequest(
    {
      name,
      email,
      phone,
      address: String(fd.get("address") || "").trim() || undefined,
      notes: String(fd.get("notes") || "").trim() || undefined,
    },
    kind,
    { piece, description, photoNote },
  );

  revalidatePath("/pedidos-web");
  revalidatePath("/cotizaciones");
  revalidatePath("/clientes");
  revalidatePath("/panel");
  const ok =
    kind === "repair"
      ? "reparacion"
      : kind === "contact"
        ? "consulta"
        : "cotizacion";
  redirect(`/pedido/${order.id}?ok=${ok}`);
}

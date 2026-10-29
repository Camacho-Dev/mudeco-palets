"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  createWebServiceRequest,
  type ServiceRequestKind,
} from "@/lib/web-checkout";
import { checkRateLimit } from "@/lib/rate-limit";

export async function submitContactRequest(fd: FormData) {
  const name = String(fd.get("name") || "").trim();
  const email = String(fd.get("email") || "").trim();
  const phone = String(fd.get("phone") || "").trim();
  const kindRaw = String(fd.get("kind") || "contact");
  const kind: ServiceRequestKind = kindRaw === "quote" ? "quote" : "contact";
  const piece = String(fd.get("piece") || "Consulta web").trim();
  const description = String(fd.get("description") || "").trim();
  const photoNote = String(fd.get("photoNote") || "").trim() || undefined;

  if (!name) throw new Error("Nombre requerido");
  if (!email || !email.includes("@")) throw new Error("Email válido requerido");
  if (!phone) throw new Error("Teléfono requerido");
  if (!description) throw new Error("Describe lo que necesitas");

  // Rate limiting por correo para mitigar flooding de solicitudes públicas
  const rl = checkRateLimit(`service-req:${email.toLowerCase()}`, 6, 15 * 60 * 1000);
  if (!rl.ok) {
    throw new Error(
      "Has enviado varias solicitudes recientemente. Por favor espera unos minutos antes de intentar de nuevo.",
    );
  }

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
  const ok = kind === "contact" ? "consulta" : "cotizacion";
  redirect(`/pedido/${order.id}?ok=${ok}`);
}

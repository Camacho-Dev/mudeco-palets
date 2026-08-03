import { redirect } from "next/navigation";
import { requireSession } from "@/lib/session";
import { isAdmin } from "@/lib/rbac";

/** Página obsoleta: el acceso privado ahora es por rol ADMIN */
export default async function DesbloquearPage() {
  const session = await requireSession();
  redirect(isAdmin(session.user.role) ? "/panel" : "/vender");
}

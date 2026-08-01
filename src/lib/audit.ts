import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function writeAudit(input: {
  action: string;
  entity: string;
  entityId?: string | null;
  summary: string;
  details?: Record<string, unknown> | null;
  userId?: string | null;
  userEmail?: string | null;
  userName?: string | null;
}) {
  let userId = input.userId ?? null;
  let userEmail = input.userEmail ?? null;
  let userName = input.userName ?? null;

  if (!userId) {
    try {
      const session = await auth();
      userId = session?.user?.id ?? null;
      userEmail = session?.user?.email ?? null;
      userName = session?.user?.name ?? null;
    } catch {
      // ignore
    }
  }

  await prisma.auditLog.create({
    data: {
      userId,
      userEmail,
      userName,
      action: input.action,
      entity: input.entity,
      entityId: input.entityId || null,
      summary: input.summary,
      details: input.details ? JSON.stringify(input.details) : null,
    },
  });
}

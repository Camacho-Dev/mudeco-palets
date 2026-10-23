"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { writeAudit } from "@/lib/audit";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const employeeSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Correo electrónico inválido"),
  password: z.string().min(6, "La clave debe tener al menos 6 caracteres").optional(),
  role: z.enum(["ADMIN", "VENDEDOR"]).default("VENDEDOR"),
  idCard: z.string().optional(),
  phone: z.string().optional(),
  position: z.string().optional(),
  department: z.enum(["TALLER", "VENTAS", "ADMINISTRACION", "LOGISTICA"]).default("TALLER"),
  salary: z.coerce.number().min(0).default(0),
  commissionRate: z.coerce.number().min(0).max(100).default(0),
  hireDate: z.string().optional(),
  emergencyContact: z.string().optional(),
  address: z.string().optional(),
  bankName: z.string().optional(),
  bankAccount: z.string().optional(),
  notes: z.string().optional(),
});

export async function createEmployee(fd: FormData) {
  const session = await requireAdmin();

  const rawPassword = String(fd.get("password") || "").trim();
  if (rawPassword.length < 6) {
    throw new Error("La contraseña inicial debe tener al menos 6 caracteres");
  }

  const parsed = employeeSchema.parse({
    name: String(fd.get("name") || "").trim(),
    email: String(fd.get("email") || "").toLowerCase().trim(),
    password: rawPassword,
    role: String(fd.get("role") || "VENDEDOR"),
    idCard: String(fd.get("idCard") || "").trim() || undefined,
    phone: String(fd.get("phone") || "").trim() || undefined,
    position: String(fd.get("position") || "").trim() || undefined,
    department: String(fd.get("department") || "TALLER"),
    salary: fd.get("salary") || 0,
    commissionRate: fd.get("commissionRate") || 0,
    hireDate: String(fd.get("hireDate") || "") || undefined,
    emergencyContact: String(fd.get("emergencyContact") || "").trim() || undefined,
    address: String(fd.get("address") || "").trim() || undefined,
    bankName: String(fd.get("bankName") || "").trim() || undefined,
    bankAccount: String(fd.get("bankAccount") || "").trim() || undefined,
    notes: String(fd.get("notes") || "").trim() || undefined,
  });

  const existing = await prisma.user.findUnique({
    where: { email: parsed.email },
  });
  if (existing) {
    throw new Error(`Ya existe un usuario o empleado registrado con el correo ${parsed.email}`);
  }

  const hireDateObj = parsed.hireDate ? new Date(parsed.hireDate) : null;

  const employee = await prisma.user.create({
    data: {
      name: parsed.name,
      email: parsed.email,
      passwordHash: await bcrypt.hash(parsed.password!, 10),
      role: parsed.role,
      active: true,
      idCard: parsed.idCard || null,
      phone: parsed.phone || null,
      position: parsed.position || null,
      department: parsed.department,
      salary: parsed.salary,
      commissionRate: parsed.commissionRate ? parsed.commissionRate / 100 : 0,
      hireDate: hireDateObj,
      emergencyContact: parsed.emergencyContact || null,
      address: parsed.address || null,
      bankName: parsed.bankName || null,
      bankAccount: parsed.bankAccount || null,
      notes: parsed.notes || null,
    },
  });

  await writeAudit({
    action: "CREATE",
    entity: "Employee",
    entityId: employee.id,
    summary: `Empleado registrado: ${employee.name} · ${employee.position || employee.role} (${employee.department})`,
    userId: session.user.id,
    userEmail: session.user.email,
    userName: session.user.name,
  });

  revalidatePath("/empleados");
  revalidatePath("/usuarios");
  revalidatePath("/panel");
  redirect(`/empleados/${employee.id}`);
}

export async function updateEmployee(id: string, fd: FormData) {
  const session = await requireAdmin();

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new Error("Empleado no encontrado");

  const name = String(fd.get("name") || "").trim();
  const email = String(fd.get("email") || "").toLowerCase().trim();
  const idCard = String(fd.get("idCard") || "").trim() || null;
  const phone = String(fd.get("phone") || "").trim() || null;
  const position = String(fd.get("position") || "").trim() || null;
  const department = String(fd.get("department") || "TALLER");
  const role = String(fd.get("role") || user.role);
  const salary = Number(fd.get("salary") || 0);
  const commissionRateRaw = Number(fd.get("commissionRate") || 0);
  const commissionRate = commissionRateRaw > 1 ? commissionRateRaw / 100 : commissionRateRaw;
  const hireDateRaw = String(fd.get("hireDate") || "").trim();
  const hireDate = hireDateRaw ? new Date(hireDateRaw) : null;
  const emergencyContact = String(fd.get("emergencyContact") || "").trim() || null;
  const address = String(fd.get("address") || "").trim() || null;
  const bankName = String(fd.get("bankName") || "").trim() || null;
  const bankAccount = String(fd.get("bankAccount") || "").trim() || null;
  const notes = String(fd.get("notes") || "").trim() || null;

  if (!name) throw new Error("El nombre es requerido");
  if (!email || !email.includes("@")) throw new Error("Email válido requerido");

  // Check email conflict with other users
  if (email !== user.email) {
    const conflict = await prisma.user.findUnique({ where: { email } });
    if (conflict) throw new Error("El correo ingresado ya pertenece a otro usuario");
  }

  const updated = await prisma.user.update({
    where: { id },
    data: {
      name,
      email,
      idCard,
      phone,
      position,
      department,
      role,
      salary,
      commissionRate,
      hireDate,
      emergencyContact,
      address,
      bankName,
      bankAccount,
      notes,
    },
  });

  await writeAudit({
    action: "UPDATE",
    entity: "Employee",
    entityId: id,
    summary: `Datos de empleado actualizados: ${updated.name} (${updated.position || updated.department})`,
    userId: session.user.id,
    userEmail: session.user.email,
    userName: session.user.name,
  });

  revalidatePath("/empleados");
  revalidatePath(`/empleados/${id}`);
  revalidatePath("/usuarios");
  revalidatePath("/panel");
}

export async function toggleEmployeeActive(id: string) {
  const session = await requireAdmin();
  if (session.user.id === id) {
    throw new Error("No puedes desactivar tu propia cuenta activa de administrador");
  }

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new Error("Empleado no encontrado");

  if (user.active && user.role === "ADMIN") {
    const remainingAdmins = await prisma.user.count({
      where: { role: "ADMIN", active: true, NOT: { id } },
    });
    if (remainingAdmins === 0) {
      throw new Error("No puedes desactivar al único administrador activo del sistema");
    }
  }

  const updated = await prisma.user.update({
    where: { id },
    data: { active: !user.active },
  });

  await writeAudit({
    action: "UPDATE",
    entity: "Employee",
    entityId: id,
    summary: `Empleado ${updated.active ? "activado" : "desactivado"}: ${updated.name}`,
    userId: session.user.id,
  });

  revalidatePath("/empleados");
  revalidatePath(`/empleados/${id}`);
  revalidatePath("/usuarios");
}

export async function setEmployeePassword(id: string, fd: FormData) {
  const session = await requireAdmin();
  const password = String(fd.get("password") || "").trim();
  if (password.length < 6) {
    throw new Error("La nueva contraseña debe tener al menos 6 caracteres");
  }

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new Error("Empleado no encontrado");

  await prisma.user.update({
    where: { id },
    data: { passwordHash: await bcrypt.hash(password, 10) },
  });

  await writeAudit({
    action: "UPDATE",
    entity: "Employee",
    entityId: id,
    summary: `Clave de acceso restablecida para el empleado ${user.name} (${user.email})`,
    userId: session.user.id,
  });

  revalidatePath(`/empleados/${id}`);
  revalidatePath("/empleados");
  revalidatePath("/usuarios");
}

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isStaff } from "@/lib/rbac";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user || !isStaff(session.user.role)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No se proporcionó ningún archivo" }, { status: 400 });
    }

    const mime = file.type.toLowerCase();
    const allowedMimes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedMimes.includes(mime)) {
      return NextResponse.json(
        { error: "Solo se permiten imágenes seguras (JPG, PNG, WebP)" },
        { status: 400 },
      );
    }

    // Límite de 10 MB
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "La imagen no debe superar los 10 MB" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // En entornos serverless de solo lectura (ej. Vercel), usar Data URL persistente en BD
    if (process.env.VERCEL === "1") {
      const dataUrl = `data:${mime};base64,${buffer.toString("base64")}`;
      return NextResponse.json({
        success: true,
        url: dataUrl,
      });
    }

    try {
      // Asegurar directorio uploads en servidor local / VPS
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      await mkdir(uploadDir, { recursive: true });

      // Extensión segura (sin SVG para prevenir Stored XSS)
      const originalExt = path.extname(file.name).toLowerCase() || ".jpg";
      const safeExt = [".jpg", ".jpeg", ".png", ".webp"].includes(originalExt)
        ? originalExt
        : ".jpg";

      const fileName = `media_${Date.now()}_${Math.random().toString(36).substring(2, 7)}${safeExt}`;
      const filePath = path.join(uploadDir, fileName);

      await writeFile(filePath, buffer);

      return NextResponse.json({
        success: true,
        url: `/uploads/${fileName}`,
      });
    } catch {
      // Respaldo automático en Base de Datos (Data URL) si el sistema de archivos es de solo lectura
      const dataUrl = `data:${mime};base64,${buffer.toString("base64")}`;
      return NextResponse.json({
        success: true,
        url: dataUrl,
      });
    }
  } catch (error) {
    console.error("Error al subir archivo:", error);
    return NextResponse.json({ error: "Error al guardar la imagen en el servidor" }, { status: 500 });
  }
}

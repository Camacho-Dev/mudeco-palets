import { NextResponse } from "next/server";
import { getVerifiedApiSession } from "@/lib/session";
import { isStaff } from "@/lib/rbac";
import { checkRateLimit } from "@/lib/rate-limit";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import sharp from "sharp";

function detectImageMime(buf: Buffer): "image/jpeg" | "image/png" | "image/webp" | null {
  if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) {
    return "image/jpeg";
  }
  if (
    buf.length >= 8 &&
    buf[0] === 0x89 &&
    buf[1] === 0x50 &&
    buf[2] === 0x4e &&
    buf[3] === 0x47 &&
    buf[4] === 0x0d &&
    buf[5] === 0x0a &&
    buf[6] === 0x1a &&
    buf[7] === 0x0a
  ) {
    return "image/png";
  }
  if (
    buf.length >= 12 &&
    buf.toString("ascii", 0, 4) === "RIFF" &&
    buf.toString("ascii", 8, 12) === "WEBP"
  ) {
    return "image/webp";
  }
  return null;
}

export async function POST(req: Request) {
  try {
    const session = await getVerifiedApiSession();
    if (!session?.user?.id || !isStaff(session.user.role)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const rl = checkRateLimit(`staff-upload:${session.user.id}`, 30, 15 * 60 * 1000);
    if (!rl.ok) {
      return NextResponse.json(
        { error: "Demasiadas subidas en poco tiempo. Espera unos minutos." },
        { status: 429 },
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No se proporcionó ningún archivo" }, { status: 400 });
    }

    // Límite de 8 MB
    if (file.size <= 0 || file.size > 8 * 1024 * 1024) {
      return NextResponse.json({ error: "La imagen no debe superar los 8 MB" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Validar firma binaria real (magic bytes) para impedir archivos falsificados o SVG con XSS
    const realMime = detectImageMime(buffer);
    if (!realMime) {
      return NextResponse.json(
        { error: "Archivo inválido. Solo se permiten imágenes reales JPG, PNG o WebP." },
        { status: 400 },
      );
    }

    // Optimizar imagen, redimensionar a máx 1600px y eliminar metadatos EXIF
    const optimizedBuffer = await sharp(buffer)
      .rotate()
      .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer();

    const safeExt = ".webp";
    const outputMime = "image/webp";

    // En entornos serverless de solo lectura (ej. Vercel), usar Data URL persistente en BD
    if (process.env.VERCEL === "1") {
      const dataUrl = `data:${outputMime};base64,${optimizedBuffer.toString("base64")}`;
      return NextResponse.json({
        success: true,
        url: dataUrl,
      });
    }

    try {
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      await mkdir(uploadDir, { recursive: true });

      const fileName = `media_${Date.now()}_${Math.random().toString(36).substring(2, 7)}${safeExt}`;
      const filePath = path.join(uploadDir, fileName);

      await writeFile(filePath, optimizedBuffer);

      return NextResponse.json({
        success: true,
        url: `/uploads/${fileName}`,
      });
    } catch {
      const dataUrl = `data:${realMime};base64,${buffer.toString("base64")}`;
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

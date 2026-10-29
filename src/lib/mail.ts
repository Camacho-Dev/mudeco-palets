import nodemailer from "nodemailer";
import { prisma } from "@/lib/prisma";
import { buildInvoicePdf } from "@/lib/pdf/invoice-pdf";
import { WEB_STATUS_LABEL, webOrderTypeLabel } from "@/lib/web-order-labels";
import { siteUrl } from "@/lib/store-info";

function escapeHtml(raw: string | null | undefined): string {
  if (!raw) return "";
  return String(raw)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function cleanHeader(raw: string | null | undefined): string {
  if (!raw) return "";
  return String(raw).replace(/[\r\n]+/g, " ").trim();
}

function smtpConfigured() {
  return !!(
    process.env.SMTP_HOST &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS
  );
}

export function isEmailConfigured() {
  return smtpConfigured();
}

async function transporter() {
  if (!smtpConfigured()) {
    throw new Error(
      "Correo no configurado. Define SMTP_HOST, SMTP_USER, SMTP_PASS (y opcional SMTP_PORT, SMTP_FROM).",
    );
  }
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

/** Avisa al equipo (email empresa) de un pedido/solicitud web nueva */
export async function notifyStaffNewWebOrder(webOrderId: string) {
  if (!smtpConfigured()) return;

  const order = await prisma.webOrder.findUnique({
    where: { id: webOrderId },
  });
  if (!order) return;

  const company = await prisma.companySettings.findUnique({
    where: { id: "default" },
  });
  const to =
    company?.email ||
    process.env.STAFF_NOTIFY_EMAIL ||
    process.env.SMTP_USER;
  if (!to) return;

  const from =
    process.env.SMTP_FROM ||
    company?.email ||
    process.env.SMTP_USER ||
    "noreply@mudecopalets.com";
  const typeLabel = webOrderTypeLabel(order);
  const panelUrl = `${siteUrl()}/pedidos-web/${encodeURIComponent(order.id)}`;
  const notesPreview = (order.notes || "")
    .replace(/\[COMPROBANTE_PAGO:\s*\{[\s\S]*?\}\]/g, "[Comprobante adjunto]")
    .slice(0, 800);

  try {
    const tx = await transporter();
    const info = await tx.sendMail({
      from: `"${cleanHeader(company?.name || "Mudeco Palets")}" <${cleanHeader(from)}>`,
      to,
      subject: cleanHeader(`[Web] ${typeLabel} ${order.number} — ${order.customerName}`),
      text: `Nuevo ${typeLabel} desde la tienda web.

Pedido: ${order.number}
Cliente: ${order.customerName}
Email: ${order.customerEmail}
Teléfono: ${order.customerPhone || "—"}
Total: RD$ ${order.total.toFixed(2)}

Notas:
${notesPreview || "(sin notas)"}

Abrir en el panel:
${panelUrl}
`,
      html: `<p>Nuevo <strong>${escapeHtml(typeLabel)}</strong> desde la tienda web.</p>
        <ul>
          <li><strong>Pedido:</strong> ${escapeHtml(order.number)}</li>
          <li><strong>Cliente:</strong> ${escapeHtml(order.customerName)}</li>
          <li><strong>Email:</strong> ${escapeHtml(order.customerEmail)}</li>
          <li><strong>Teléfono:</strong> ${escapeHtml(order.customerPhone || "—")}</li>
          <li><strong>Total:</strong> RD$ ${order.total.toFixed(2)}</li>
        </ul>
        <p><strong>Notas</strong></p>
        <pre style="white-space:pre-wrap;font-family:inherit">${escapeHtml(notesPreview || "(sin notas)")}</pre>
        <p><a href="${escapeHtml(panelUrl)}">Abrir en el panel</a></p>`,
    });
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.info(`[SMTP Preview - Pedido ${order.number}]: ${previewUrl}`);
    }
  } catch {
    /* SMTP opcional: no romper el pedido */
  }

  await notifyCustomerWebOrderCreated(webOrderId).catch(() => undefined);
}

/** Envía confirmación por correo al cliente cuando registra un pedido o cotización web */
export async function notifyCustomerWebOrderCreated(webOrderId: string) {
  if (!smtpConfigured()) return;

  const order = await prisma.webOrder.findUnique({
    where: { id: webOrderId },
    include: { items: true },
  });
  if (!order || !order.customerEmail) return;

  const company = await prisma.companySettings.findUnique({
    where: { id: "default" },
  });
  const companyName = company?.name || "Mudeco Palets";
  const from =
    process.env.SMTP_FROM ||
    company?.email ||
    process.env.SMTP_USER ||
    "noreply@mudecopalets.com";

  const typeLabel = webOrderTypeLabel(order);
  const trackingUrl = `${siteUrl()}/pedido/${encodeURIComponent(order.id)}`;
  const itemsHtml =
    order.items.length > 0
      ? `<ul style="margin:12px 0;padding-left:18px;font-size:14px;color:#3d2a1f">${order.items
          .map(
            (i) =>
              `<li><strong>${escapeHtml(i.description)}</strong> × ${i.quantity}${
                i.lineTotal > 0 ? ` — RD$ ${i.lineTotal.toFixed(2)}` : ""
              }</li>`,
          )
          .join("")}</ul>`
      : "";

  try {
    const tx = await transporter();
    await tx.sendMail({
      from: `"${cleanHeader(companyName)}" <${cleanHeader(from)}>`,
      to: cleanHeader(order.customerEmail),
      subject: cleanHeader(
        `Confirmación de ${typeLabel} ${order.number} — ${companyName}`,
      ),
      text: `Hola ${order.customerName},

Hemos recibido tu ${typeLabel.toLowerCase()} (${order.number}) en ${companyName}.
${order.total > 0 ? `\nTotal estimado: RD$ ${order.total.toFixed(2)}\n` : ""}
Puedes consultar el estado en tiempo real o subir tu comprobante bancario aquí:
${trackingUrl}

Gracias por confiar en nuestro taller artesanal.`,
      html: `<div style="font-family:sans-serif;max-width:540px;margin:0 auto;padding:28px;border:1px solid #e5d8c8;border-radius:14px;background:#faf7f2;color:#1b1511">
        <p style="font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#b0894f;font-weight:bold;margin:0 0 8px">${escapeHtml(companyName)}</p>
        <h2 style="margin:0 0 12px;font-size:22px;color:#14100d">${escapeHtml(typeLabel)} recibida (${escapeHtml(order.number)})</h2>
        <p style="font-size:14px;line-height:1.6;color:#4a3b31">Hola <strong>${escapeHtml(order.customerName)}</strong>, hemos registrado tu solicitud en nuestro taller y nuestro equipo ya la está revisando.</p>
        ${itemsHtml}
        ${
          order.total > 0
            ? `<p style="font-size:15px;font-weight:bold;color:#14100d;margin:14px 0">Total: RD$ ${order.total.toFixed(2)}</p>`
            : ""
        }
        <div style="margin:22px 0">
          <a href="${escapeHtml(trackingUrl)}" style="display:inline-block;padding:12px 22px;background:#14100d;color:#c9a15a;text-decoration:none;font-size:12px;font-weight:bold;letter-spacing:0.14em;text-transform:uppercase;border-radius:8px">Ver estado de mi solicitud</a>
        </div>
        <p style="font-size:12px;color:#6e5a4f;margin-top:20px">Si elegiste pago por transferencia bancaria, puedes adjuntar tu comprobante directamente desde el enlace anterior.</p>
      </div>`,
    });
  } catch {
    /* No interrumpir flujo si falla el correo */
  }
}

/** Notifica al cliente cuando el taller actualiza el estado de su pedido web */
export async function notifyCustomerWebOrderStatus(
  webOrderId: string,
  statusOverride?: string,
) {
  if (!smtpConfigured()) return;

  const order = await prisma.webOrder.findUnique({
    where: { id: webOrderId },
  });
  if (!order || !order.customerEmail) return;

  const company = await prisma.companySettings.findUnique({
    where: { id: "default" },
  });
  const companyName = company?.name || "Mudeco Palets";
  const from =
    process.env.SMTP_FROM ||
    company?.email ||
    process.env.SMTP_USER ||
    "noreply@mudecopalets.com";

  const statusKey = statusOverride || order.status;
  const statusLabel = WEB_STATUS_LABEL[statusKey] || statusKey;
  const trackingUrl = `${siteUrl()}/pedido/${encodeURIComponent(order.id)}`;

  try {
    const tx = await transporter();
    await tx.sendMail({
      from: `"${cleanHeader(companyName)}" <${cleanHeader(from)}>`,
      to: cleanHeader(order.customerEmail),
      subject: cleanHeader(
        `Actualización de tu pedido ${order.number}: ${statusLabel} — ${companyName}`,
      ),
      text: `Hola ${order.customerName},

El estado de tu solicitud ${order.number} en ${companyName} ha sido actualizado a: ${statusLabel}.

Consulta los detalles y el progreso en tiempo real aquí:
${trackingUrl}

Saludos cordiales,
Equipo ${companyName}`,
      html: `<div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:28px;border:1px solid #e5d8c8;border-radius:14px;background:#faf7f2;color:#1b1511">
        <p style="font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#b0894f;font-weight:bold;margin:0 0 8px">${escapeHtml(companyName)}</p>
        <h2 style="margin:0 0 12px;font-size:20px;color:#14100d">Actualización del pedido ${escapeHtml(order.number)}</h2>
        <p style="font-size:14px;line-height:1.6;color:#4a3b31">Hola <strong>${escapeHtml(order.customerName)}</strong>, te informamos que el estado de tu solicitud ha cambiado a:</p>
        <div style="margin:16px 0;padding:14px 18px;background:#14100d;color:#c9a15a;font-size:15px;font-weight:bold;border-radius:10px;display:inline-block">
          ${escapeHtml(statusLabel)}
        </div>
        <div style="margin:20px 0">
          <a href="${escapeHtml(trackingUrl)}" style="display:inline-block;padding:12px 22px;border:1px solid #14100d;color:#14100d;text-decoration:none;font-size:12px;font-weight:bold;letter-spacing:0.12em;text-transform:uppercase;border-radius:8px">Ver seguimiento del pedido</a>
        </div>
      </div>`,
    });
  } catch {
    /* No bloquear la operación del panel si SMTP falla */
  }
}

export async function sendInvoiceEmail(invoiceId: string) {
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: { customer: true, items: true },
  });
  if (!invoice) throw new Error("Factura no encontrada");
  const to = invoice.customer.email;
  if (!to) throw new Error("El cliente no tiene email");

  const company = (await prisma.companySettings.findUnique({
    where: { id: "default" },
  })) ?? {
    id: "default",
    name: "Mudeco Palets",
    slogan: "Muebles a la medida",
    taxId: null,
    address: null,
    phone: null,
    email: null,
    heroImage: null,
    heroBadge: null,
    heroTitle: null,
    heroSubtitle: null,
    workshopImage: null,
    craftImage: null,
    promoMesaImage: null,
    promoTvImage: null,
    galleryImages: null,
    beforeAfterJson: null,
  };

  const pdf = await buildInvoicePdf(invoice, company);
  const from =
    process.env.SMTP_FROM ||
    company.email ||
    process.env.SMTP_USER ||
    "noreply@mudecopalets.com";

  const tx = await transporter();
  const info = await tx.sendMail({
    from: `"${cleanHeader(company.name)}" <${cleanHeader(from)}>`,
    to,
    subject: cleanHeader(`Factura ${invoice.number} — ${company.name}`),
    text: `Hola ${invoice.customer.name},\n\nGracias por tu compra en ${company.name}.\nAdjuntamos la factura ${invoice.number} por un total de RD$ ${invoice.total.toFixed(2)}.\n\nSaludos.`,
    html: `<p>Hola <strong>${escapeHtml(invoice.customer.name)}</strong>,</p>
      <p>Gracias por tu compra en <strong>${escapeHtml(company.name)}</strong>.</p>
      <p>Adjuntamos la factura <strong>${escapeHtml(invoice.number)}</strong> por un total de <strong>RD$ ${invoice.total.toFixed(2)}</strong>.</p>
      <p>Saludos.</p>`,
    attachments: [
      {
        filename: `${invoice.number}.pdf`,
        content: Buffer.from(pdf),
        contentType: "application/pdf",
      },
    ],
  });
  const previewUrl = nodemailer.getTestMessageUrl(info);
  if (previewUrl) {
    console.info(`[SMTP Preview - Factura ${invoice.number}]: ${previewUrl}`);
  }
  return { previewUrl: previewUrl || null };
}

export async function sendPasswordResetEmail(
  toEmail: string,
  userName: string,
  code: string,
) {
  const company = await prisma.companySettings.findUnique({
    where: { id: "default" },
  });
  const companyName = company?.name || "Mudeco Palets";
  const from =
    process.env.SMTP_FROM ||
    company?.email ||
    process.env.SMTP_USER ||
    "noreply@mudecopalets.com";

  const tx = await transporter();
  const info = await tx.sendMail({
    from: `"${cleanHeader(companyName)}" <${cleanHeader(from)}>`,
    to: toEmail,
    subject: cleanHeader(`Código de recuperación de contraseña — ${companyName}`),
    text: `Hola ${userName},\n\nTu código de seguridad para restablecer tu contraseña en ${companyName} es:\n\n${code}\n\nEste código es válido por 15 minutos.\nSi no solicitaste este cambio, puedes ignorar este mensaje.`,
    html: `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;border:1px solid #e5d8c8;border-radius:12px;background:#faf7f2;color:#1b1511">
      <p style="font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:#b0894f;font-weight:bold;margin:0 0 8px">${escapeHtml(companyName)}</p>
      <h2 style="margin:0 0 12px;font-size:20px">Recuperación de contraseña</h2>
      <p style="font-size:14px;line-height:1.5">Hola <strong>${escapeHtml(userName)}</strong>, usa el siguiente código de 6 dígitos para crear una nueva contraseña:</p>
      <div style="margin:20px 0;padding:16px;text-align:center;background:#16120e;color:#d4af37;font-size:28px;font-weight:bold;letter-spacing:0.25em;border-radius:10px">
        ${escapeHtml(code)}
      </div>
      <p style="font-size:12px;color:#6e5a4f">Este código vence en 15 minutos. Si no solicitaste este cambio, ignora este correo.</p>
    </div>`,
  });

  const previewUrl = nodemailer.getTestMessageUrl(info);
  if (previewUrl) {
    console.info(`[SMTP Preview - Recuperación ${toEmail}]: ${previewUrl}`);
  }
  return { previewUrl: previewUrl || null };
}

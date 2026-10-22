import nodemailer from "nodemailer";
import { prisma } from "@/lib/prisma";
import { buildInvoicePdf } from "@/lib/pdf/invoice-pdf";
import { webOrderTypeLabel } from "@/lib/web-order-labels";
import { siteUrl } from "@/lib/store-info";

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
  const panelUrl = `${siteUrl()}/pedidos-web/${order.id}`;
  const notesPreview = (order.notes || "").slice(0, 800);

  try {
    const tx = await transporter();
    await tx.sendMail({
      from: `"${company?.name || "Mudeco Palets"}" <${from}>`,
      to,
      subject: `[Web] ${typeLabel} ${order.number} — ${order.customerName}`,
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
      html: `<p>Nuevo <strong>${typeLabel}</strong> desde la tienda web.</p>
        <ul>
          <li><strong>Pedido:</strong> ${order.number}</li>
          <li><strong>Cliente:</strong> ${order.customerName}</li>
          <li><strong>Email:</strong> ${order.customerEmail}</li>
          <li><strong>Teléfono:</strong> ${order.customerPhone || "—"}</li>
          <li><strong>Total:</strong> RD$ ${order.total.toFixed(2)}</li>
        </ul>
        <p><strong>Notas</strong></p>
        <pre style="white-space:pre-wrap;font-family:inherit">${notesPreview || "(sin notas)"}</pre>
        <p><a href="${panelUrl}">Abrir en el panel</a></p>`,
    });
  } catch {
    /* SMTP opcional: no romper el pedido */
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

  let company = await prisma.companySettings.findUnique({
    where: { id: "default" },
  });
  if (!company) {
    company = {
      id: "default",
      name: "Mudeco Palets",
      slogan: "Muebles a la medida",
      taxId: null,
      address: null,
      phone: null,
      email: null,
    };
  }

  const pdf = await buildInvoicePdf(invoice, company);
  const from =
    process.env.SMTP_FROM ||
    company.email ||
    process.env.SMTP_USER ||
    "noreply@mudecopalets.com";

  const tx = await transporter();
  await tx.sendMail({
    from: `"${company.name}" <${from}>`,
    to,
    subject: `Factura ${invoice.number} — ${company.name}`,
    text: `Hola ${invoice.customer.name},\n\nGracias por tu compra en ${company.name}.\nAdjuntamos la factura ${invoice.number} por un total de RD$ ${invoice.total.toFixed(2)}.\n\nSaludos.`,
    html: `<p>Hola <strong>${invoice.customer.name}</strong>,</p>
      <p>Gracias por tu compra en <strong>${company.name}</strong>.</p>
      <p>Adjuntamos la factura <strong>${invoice.number}</strong> por un total de <strong>RD$ ${invoice.total.toFixed(2)}</strong>.</p>
      <p>Saludos.</p>`,
    attachments: [
      {
        filename: `${invoice.number}.pdf`,
        content: Buffer.from(pdf),
        contentType: "application/pdf",
      },
    ],
  });
}

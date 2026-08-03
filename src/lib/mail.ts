import nodemailer from "nodemailer";
import { prisma } from "@/lib/prisma";
import { buildInvoicePdf } from "@/lib/pdf/invoice-pdf";

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

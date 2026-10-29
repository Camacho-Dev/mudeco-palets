import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Svg,
  Rect,
  renderToBuffer,
} from "@react-pdf/renderer";
import { formatCurrency, formatDate } from "@/lib/format";

type PdfInvoice = {
  number: string;
  ncf: string | null;
  issueDate: Date;
  dueDate: Date | null;
  notes: string | null;
  delivery?: boolean;
  deliveryFee?: number;
  applyTax?: boolean;
  subtotal: number;
  tax: number;
  total: number;
  customer: {
    name: string;
    taxId: string | null;
    address: string | null;
    email: string | null;
    phone: string | null;
  };
  items: {
    description: string;
    quantity: number;
    unitPrice: number;
    taxRate: number;
    lineTotal: number;
  }[];
};

type Company = {
  name: string;
  slogan?: string | null;
  taxId: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
};

const BRAND = "#3d2a1f";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: BRAND,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 28,
    paddingBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: BRAND,
  },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  brand: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    color: BRAND,
    letterSpacing: 1,
  },
  brandSub: {
    fontSize: 11,
    fontFamily: "Helvetica",
    color: BRAND,
    letterSpacing: 3,
    marginTop: 2,
  },
  muted: { color: "#7a6a5c", marginTop: 2 },
  title: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    textAlign: "right",
    color: BRAND,
  },
  section: { marginBottom: 20 },
  label: {
    fontSize: 8,
    textTransform: "uppercase",
    color: "#7a6a5c",
    marginBottom: 4,
    letterSpacing: 0.6,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f3ebe3",
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#e4d8cb",
  },
  row: {
    flexDirection: "row",
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#f0e6db",
  },
  colDesc: { width: "40%" },
  colQty: { width: "12%", textAlign: "right" },
  colPrice: { width: "18%", textAlign: "right" },
  colTax: { width: "12%", textAlign: "right" },
  colTotal: { width: "18%", textAlign: "right" },
  totals: { marginTop: 16, alignItems: "flex-end" },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: 180,
    marginBottom: 4,
  },
  totalStrong: { fontFamily: "Helvetica-Bold", fontSize: 12 },
});

function BrandMark() {
  return (
    <Svg width={36} height={36} viewBox="0 0 64 64">
      <Rect x="6" y="6" width="52" height="8" rx="1.5" fill={BRAND} />
      <Rect x="6" y="18" width="14" height="12" rx="1.5" fill={BRAND} />
      <Rect x="27" y="18" width="10" height="12" rx="1.5" fill={BRAND} />
      <Rect x="44" y="18" width="14" height="12" rx="1.5" fill={BRAND} />
      <Rect x="6" y="34" width="52" height="8" rx="1.5" fill={BRAND} />
      <Rect x="6" y="46" width="14" height="12" rx="1.5" fill={BRAND} />
      <Rect x="27" y="46" width="10" height="12" rx="1.5" fill={BRAND} />
      <Rect x="44" y="46" width="14" height="12" rx="1.5" fill={BRAND} />
    </Svg>
  );
}

function InvoiceDocument({
  invoice,
  company,
}: {
  invoice: PdfInvoice;
  company: Company;
}) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <View style={styles.brandRow}>
              <BrandMark />
              <View>
                <Text style={styles.brand}>MUDECO</Text>
                <Text style={styles.brandSub}>PALETS</Text>
              </View>
            </View>
            {company.slogan ? (
              <Text style={[styles.muted, { marginTop: 8 }]}>
                {company.slogan}
              </Text>
            ) : null}
            {company.taxId ? (
              <Text style={styles.muted}>RNC: {company.taxId}</Text>
            ) : null}
            {company.address ? (
              <Text style={styles.muted}>{company.address}</Text>
            ) : null}
            {company.phone ? (
              <Text style={styles.muted}>{company.phone}</Text>
            ) : null}
            {company.email ? (
              <Text style={styles.muted}>{company.email}</Text>
            ) : null}
          </View>
          <View>
            <Text style={styles.title}>FACTURA</Text>
            <Text style={styles.muted}>{invoice.number}</Text>
            {invoice.ncf && !invoice.ncf.startsWith("PENDING:") ? (
              <Text style={styles.muted}>NCF: {invoice.ncf}</Text>
            ) : null}
            <Text style={styles.muted}>
              Fecha: {formatDate(invoice.issueDate)}
            </Text>
            {invoice.dueDate ? (
              <Text style={styles.muted}>
                Vence: {formatDate(invoice.dueDate)}
              </Text>
            ) : null}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Facturar a</Text>
          <Text style={{ fontFamily: "Helvetica-Bold" }}>
            {invoice.customer.name}
          </Text>
          {invoice.customer.taxId ? (
            <Text style={styles.muted}>RNC: {invoice.customer.taxId}</Text>
          ) : null}
          {invoice.customer.address ? (
            <Text style={styles.muted}>{invoice.customer.address}</Text>
          ) : null}
          {invoice.customer.email ? (
            <Text style={styles.muted}>{invoice.customer.email}</Text>
          ) : null}
        </View>

        <View style={styles.tableHeader}>
          <Text style={styles.colDesc}>Descripcion</Text>
          <Text style={styles.colQty}>Cant.</Text>
          <Text style={styles.colPrice}>Precio</Text>
          <Text style={styles.colTax}>ITBIS</Text>
          <Text style={styles.colTotal}>Importe</Text>
        </View>
        {invoice.items.map((item, i) => (
          <View key={i} style={styles.row}>
            <Text style={styles.colDesc}>{item.description}</Text>
            <Text style={styles.colQty}>{item.quantity}</Text>
            <Text style={styles.colPrice}>
              {formatCurrency(item.unitPrice)}
            </Text>
            <Text style={styles.colTax}>
              {(item.taxRate * 100).toFixed(0)}%
            </Text>
            <Text style={styles.colTotal}>
              {formatCurrency(item.lineTotal)}
            </Text>
          </View>
        ))}

        <View style={styles.totals}>
          <View style={styles.totalRow}>
            <Text>Subtotal</Text>
            <Text>{formatCurrency(invoice.subtotal)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text>ITBIS</Text>
            <Text>
              {invoice.applyTax === false
                ? "Sin ITBIS"
                : formatCurrency(invoice.tax)}
            </Text>
          </View>
          {invoice.delivery && (invoice.deliveryFee || 0) > 0 ? (
            <View style={styles.totalRow}>
              <Text>Delivery</Text>
              <Text>{formatCurrency(invoice.deliveryFee || 0)}</Text>
            </View>
          ) : null}
          <View style={styles.totalRow}>
            <Text style={styles.totalStrong}>Total</Text>
            <Text style={styles.totalStrong}>
              {formatCurrency(invoice.total)}
            </Text>
          </View>
        </View>

        {invoice.notes ? (
          <View style={{ marginTop: 30 }}>
            <Text style={styles.label}>Notas</Text>
            <Text>
              {invoice.notes
                .replace(/\[COMPROBANTE_PAGO:\s*\{[\s\S]*?\}\]/g, "")
                .replace(/\[COMPROBANTE:[^\]]+\]/g, "")
                .trim()}
            </Text>
          </View>
        ) : null}
      </Page>
    </Document>
  );
}

export async function buildInvoicePdf(
  invoice: PdfInvoice,
  company: Company,
): Promise<Buffer> {
  const buffer = await renderToBuffer(
    <InvoiceDocument invoice={invoice} company={company} />,
  );
  return Buffer.from(buffer);
}

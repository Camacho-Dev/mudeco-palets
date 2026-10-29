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

type PdfQuote = {
  number: string;
  issueDate: Date;
  validUntil: Date | null;
  notes: string | null;
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
  colDesc: { width: "45%" },
  colQty: { width: "12%", textAlign: "right" },
  colPrice: { width: "20%", textAlign: "right" },
  colTotal: { width: "23%", textAlign: "right" },
  totals: { marginTop: 16, alignItems: "flex-end" },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: 200,
    marginBottom: 4,
  },
  totalStrong: { fontFamily: "Helvetica-Bold", fontSize: 12, color: BRAND },
  notesBox: {
    marginTop: 20,
    padding: 12,
    backgroundColor: "#faf6f1",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#e4d8cb",
  },
  footer: {
    marginTop: 30,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#e4d8cb",
    textAlign: "center",
    fontSize: 8,
    color: "#7a6a5c",
  },
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

function QuoteDocument({
  quote,
  company,
}: {
  quote: PdfQuote;
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
            <Text style={styles.title}>COTIZACIÓN</Text>
            <Text style={styles.muted}>{quote.number}</Text>
            <Text style={styles.muted}>Fecha: {formatDate(quote.issueDate)}</Text>
            {quote.validUntil ? (
              <Text style={[styles.muted, { color: "#8a652f" }]}>
                Válida hasta: {formatDate(quote.validUntil)}
              </Text>
            ) : null}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Cliente</Text>
          <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 12 }}>
            {quote.customer.name}
          </Text>
          {quote.customer.taxId ? (
            <Text style={styles.muted}>RNC/Cédula: {quote.customer.taxId}</Text>
          ) : null}
          {quote.customer.address ? (
            <Text style={styles.muted}>{quote.customer.address}</Text>
          ) : null}
          {quote.customer.phone ? (
            <Text style={styles.muted}>{quote.customer.phone}</Text>
          ) : null}
          {quote.customer.email ? (
            <Text style={styles.muted}>{quote.customer.email}</Text>
          ) : null}
        </View>

        <View style={styles.tableHeader}>
          <Text style={styles.colDesc}>Descripción de la pieza / servicio</Text>
          <Text style={styles.colQty}>Cant.</Text>
          <Text style={styles.colPrice}>Precio Unit.</Text>
          <Text style={styles.colTotal}>Importe Estimado</Text>
        </View>

        {quote.items.map((item, idx) => (
          <View key={idx} style={styles.row}>
            <Text style={styles.colDesc}>{item.description}</Text>
            <Text style={styles.colQty}>{item.quantity}</Text>
            <Text style={styles.colPrice}>{formatCurrency(item.unitPrice)}</Text>
            <Text style={styles.colTotal}>{formatCurrency(item.lineTotal)}</Text>
          </View>
        ))}

        <View style={styles.totals}>
          <View style={styles.totalRow}>
            <Text>Subtotal:</Text>
            <Text>{formatCurrency(quote.subtotal)}</Text>
          </View>
          {quote.tax > 0 ? (
            <View style={styles.totalRow}>
              <Text>ITBIS (18%):</Text>
              <Text>{formatCurrency(quote.tax)}</Text>
            </View>
          ) : null}
          <View style={[styles.totalRow, { marginTop: 4, paddingTop: 4, borderTopWidth: 1, borderTopColor: "#e4d8cb" }]}>
            <Text style={styles.totalStrong}>Presupuesto Total:</Text>
            <Text style={styles.totalStrong}>{formatCurrency(quote.total)}</Text>
          </View>
        </View>

        {quote.notes ? (
          <View style={styles.notesBox}>
            <Text style={[styles.label, { marginBottom: 2 }]}>Términos y Notas del Proyecto</Text>
            <Text style={{ fontSize: 9, lineHeight: 1.4 }}>{quote.notes}</Text>
          </View>
        ) : null}

        <View style={styles.footer}>
          <Text>
            Mudeco Palets · Muebles artesanales de madera recuperada con alma de taller
          </Text>
          <Text style={{ marginTop: 2 }}>
            Este presupuesto tiene carácter informativo y no constituye una factura fiscal. Para aprobar la orden se requiere confirmar con el taller.
          </Text>
        </View>
      </Page>
    </Document>
  );
}

export async function buildQuotePdf(quote: PdfQuote, company: Company) {
  return renderToBuffer(<QuoteDocument quote={quote} company={company} />);
}

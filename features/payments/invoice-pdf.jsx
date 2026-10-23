import { Document, Page, StyleSheet, Text, View, renderToBuffer } from "@react-pdf/renderer";
import { formatDate, formatPrice } from "@/lib/format";

const ACCENT = "#E8602E";

const styles = StyleSheet.create({
  page: { padding: 48, fontFamily: "Helvetica", fontSize: 11, color: "#1A1A1A" },
  top: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  brand: { fontSize: 20, fontFamily: "Helvetica-Bold", color: ACCENT },
  muted: { color: "#6B6B6B", marginTop: 3 },
  title: { fontSize: 26, fontFamily: "Helvetica-Bold", textAlign: "right" },
  meta: { marginTop: 32, flexDirection: "row", justifyContent: "space-between" },
  label: { fontSize: 8, color: "#8A8A8A", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 },
  table: { marginTop: 32, borderTopWidth: 1, borderColor: "#E4E4E4" },
  row: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 10, borderBottomWidth: 1, borderColor: "#E4E4E4" },
  total: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 12 },
  totalText: { fontSize: 14, fontFamily: "Helvetica-Bold" },
  note: { marginTop: 40, color: "#6B6B6B", fontSize: 9, lineHeight: 1.5 },
  stamp: { position: "absolute", top: 300, left: 150, fontSize: 64, color: "#EF4444", opacity: 0.25, transform: "rotate(-18deg)", fontFamily: "Helvetica-Bold" },
});

const Block = ({ label, lines }) => (
  <View>
    <Text style={styles.label}>{label}</Text>
    {lines.filter(Boolean).map((line) => (
      <Text key={line} style={{ marginTop: 2 }}>
        {line}
      </Text>
    ))}
  </View>
);

const InvoiceDocument = ({ invoice, brand, contact }) => {
  const money = (value) => formatPrice(value, invoice.currency);
  return (
    <Document title={`Invoice ${invoice.number}`} author={brand}>
      <Page size="A4" style={styles.page}>
        <View style={styles.top}>
          <View>
            <Text style={styles.brand}>{brand}</Text>
            {[contact.address, contact.email, contact.phone].filter(Boolean).map((line) => (
              <Text key={line} style={styles.muted}>
                {line}
              </Text>
            ))}
          </View>
          <View>
            <Text style={styles.title}>Invoice</Text>
            <Text style={[styles.muted, { textAlign: "right" }]}>{invoice.number}</Text>
          </View>
        </View>
        <View style={styles.meta}>
          <Block label="Billed to" lines={[invoice.studentName, invoice.studentEmail]} />
          <Block label="Paid on" lines={[formatDate(invoice.paidAt)]} />
          <Block label="Payment" lines={[invoice.method, invoice.reference]} />
        </View>
        <View style={styles.table}>
          <View style={styles.row}>
            <Text>{invoice.courseTitle} (lifetime access)</Text>
            <Text>{money(invoice.subtotal)}</Text>
          </View>
          {invoice.coupon && (
            <View style={styles.row}>
              <Text>Coupon {invoice.coupon.code}</Text>
              <Text>-{money(invoice.coupon.discount)}</Text>
            </View>
          )}
          <View style={styles.total}>
            <Text style={styles.totalText}>Total paid</Text>
            <Text style={styles.totalText}>{money(invoice.amount)}</Text>
          </View>
          {invoice.refundedAt && (
            <View style={styles.row}>
              <Text>Refunded on {formatDate(invoice.refundedAt)}</Text>
              <Text>-{money(invoice.amount)}</Text>
            </View>
          )}
        </View>
        <Text style={styles.note}>Thank you for learning with {brand}. This invoice was generated electronically and is valid without a signature.</Text>
        {invoice.refundedAt && <Text style={styles.stamp}>REFUNDED</Text>}
      </Page>
    </Document>
  );
};

export const renderInvoicePdf = ({ invoice, brand, contact = {} }) => renderToBuffer(<InvoiceDocument invoice={invoice} brand={brand} contact={contact} />);

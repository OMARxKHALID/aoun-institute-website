import { Document, Image, Page, StyleSheet, Text, View, renderToBuffer } from "@react-pdf/renderer";
import QRCode from "qrcode";

const ACCENT = "#E8602E";

const styles = StyleSheet.create({
  page: { backgroundColor: "#0C0C0C", color: "#FFFFFF", padding: 28, fontFamily: "Helvetica" },
  frame: { flex: 1, borderWidth: 2, borderColor: ACCENT, borderRadius: 14, padding: 44, justifyContent: "space-between" },
  brand: { fontSize: 14, letterSpacing: 4, color: ACCENT, fontFamily: "Helvetica-Bold" },
  heading: { fontSize: 36, marginTop: 28, fontFamily: "Helvetica-Bold" },
  sub: { fontSize: 13, color: "#B5B5B5", marginTop: 26 },
  name: { fontSize: 34, marginTop: 10, fontFamily: "Helvetica-Bold" },
  course: { fontSize: 20, marginTop: 10, color: "#FFF3EF" },
  footer: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" },
  label: { fontSize: 9, color: "#8A8A8A", textTransform: "uppercase", letterSpacing: 1 },
  value: { fontSize: 12, marginTop: 4 },
  qr: { width: 92, height: 92, borderRadius: 6 },
  revoked: { position: "absolute", top: 230, left: 160, fontSize: 72, color: "#EF4444", opacity: 0.35, transform: "rotate(-18deg)", fontFamily: "Helvetica-Bold" },
});

const CertificateDocument = ({ certificate, brand, qr, verifyUrl }) => (
  <Document title={`${certificate.courseTitle} certificate`} author={brand}>
    <Page size="A4" orientation="landscape" style={styles.page}>
      <View style={styles.frame}>
        <View>
          <Text style={styles.brand}>{brand.toUpperCase()}</Text>
          <Text style={styles.heading}>Certificate of Completion</Text>
          <Text style={styles.sub}>This certifies that</Text>
          <Text style={styles.name}>{certificate.studentName}</Text>
          <Text style={styles.sub}>has successfully completed the course</Text>
          <Text style={styles.course}>{certificate.courseTitle}</Text>
        </View>
        <View style={styles.footer}>
          <View>
            <Text style={styles.label}>Issued on</Text>
            <Text style={styles.value}>{new Date(certificate.issuedAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</Text>
            <Text style={[styles.label, { marginTop: 14 }]}>Certificate ID</Text>
            <Text style={styles.value}>{certificate.code}</Text>
            <Text style={[styles.label, { marginTop: 14 }]}>Verify at</Text>
            <Text style={[styles.value, { color: ACCENT }]}>{verifyUrl}</Text>
          </View>
          <Image src={qr} style={styles.qr} />
        </View>
      </View>
      {certificate.status === "REVOKED" && <Text style={styles.revoked}>REVOKED</Text>}
    </Page>
  </Document>
);

export const renderCertificatePdf = async ({ certificate, brand, verifyUrl }) => {
  const qr = await QRCode.toDataURL(verifyUrl, { margin: 1, width: 300, color: { dark: "#000000", light: "#FFFFFF" } });
  return renderToBuffer(<CertificateDocument certificate={certificate} brand={brand} qr={qr} verifyUrl={verifyUrl} />);
};

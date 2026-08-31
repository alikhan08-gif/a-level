import { NextResponse } from "next/server";
import PDFDocument from "pdfkit";
import { OFFER_TITLE_UZ, OFFER_TITLE_EN, OFFER_SECTIONS_UZ, OFFER_SECTIONS_EN } from "@/lib/offerAgreement";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const locale = searchParams.get("locale") === "en" ? "en" : "uz";
  const title = locale === "en" ? OFFER_TITLE_EN : OFFER_TITLE_UZ;
  const sections = locale === "en" ? OFFER_SECTIONS_EN : OFFER_SECTIONS_UZ;

  const doc = new PDFDocument({ margin: 56 });
  const chunks: Buffer[] = [];
  doc.on("data", (chunk) => chunks.push(chunk));
  const done = new Promise<Buffer>((resolve) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
  });

  doc.font("Helvetica-Bold").fontSize(18).fillColor("#0a2540").text(title);
  doc.moveDown(0.2);
  doc.font("Helvetica").fontSize(10).fillColor("#888").text("Harrington Academy");
  doc.moveDown(1);

  for (const section of sections) {
    doc.font("Helvetica-Bold").fontSize(13).fillColor("#0a2540").text(section.title);
    doc.moveDown(0.3);
    doc.font("Helvetica").fontSize(10.5).fillColor("#333333");
    for (const paragraph of section.body) {
      doc.text(paragraph, { align: "justify" });
      doc.moveDown(0.4);
    }
    doc.moveDown(0.5);
  }

  doc.end();
  const buffer = await done;

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="shartnoma-${locale}.pdf"`,
    },
  });
}

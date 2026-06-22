import { jsPDF } from "jspdf";

const MARGIN = 16;
const LINE = 6;
const sanitize = (s) =>
  (s || "report").replace(/[^a-z0-9]+/gi, "-").toLowerCase();

const TYRE_RGB = {
  SOFT: [214, 40, 40],
  MEDIUM: [240, 200, 8],
  HARD: [205, 205, 210],
  INTERMEDIATE: [60, 170, 75],
  WET: [40, 120, 210],
};
const TYRE_DARK_LETTER = new Set(["MEDIUM", "HARD"]);
const fmtSector = (s) => (s == null ? "–" : s.toFixed(3));

export function downloadLapSummary(report) {
  const doc = new jsPDF();
  const pageHeight = doc.internal.pageSize.getHeight();
  const pageWidth = doc.internal.pageSize.getWidth();
  const maxWidth = pageWidth - MARGIN * 2;
  let y = MARGIN;

  const ensureSpace = (lines = 1) => {
    if (y + LINE * lines > pageHeight - MARGIN) {
      doc.addPage();
      y = MARGIN;
    }
  };
  const write = (text, { size = 11, style = "normal", gap = LINE } = {}) => {
    doc.setFont("helvetica", style);
    doc.setFontSize(size);
    const lines = doc.splitTextToSize(text, maxWidth);
    ensureSpace(lines.length);
    doc.text(lines, MARGIN, y);
    y += LINE * lines.length + (gap - LINE);
  };

  const writeTyreRow = (d) => {
    ensureSpace(1);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    const label = "Tyre: ";
    doc.text(label, MARGIN, y);
    let x = MARGIN + doc.getTextWidth(label);

    const key = d.compoundRaw?.toUpperCase();
    const rgb = key && TYRE_RGB[key];
    if (rgb) {
      const r = 2.2;
      const cx = x + r;
      const cy = y - 1.4;
      doc.setFillColor(rgb[0], rgb[1], rgb[2]);
      doc.circle(cx, cy, r, "F");
      const dark = TYRE_DARK_LETTER.has(key);
      doc.setTextColor(dark ? 40 : 255, dark ? 40 : 255, dark ? 40 : 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7);
      doc.text(key[0], cx, cy + 1, { align: "center" });
      doc.setTextColor(0, 0, 0);
      x = cx + r + 2;
    }
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text(d.compound ?? "Unavailable", x, y);
    y += LINE;
  };

  const titleParts = [
    `${report.year} ${report.gpName}`,
    report.circuitName,
    report.sessionName,
  ].filter(Boolean);
  write(titleParts.join("  •  "), { size: 16, style: "bold", gap: LINE });
  write(`Summary of ${report.lapLabel}`, { size: 12, gap: LINE });
  y += 2;

  report.drivers.forEach((d) => {
    const lap = d.lapNumber != null ? `Lap ${d.lapNumber}` : report.lapLabel;
    write(`Driver #${d.driver_number} ${d.name} — ${lap}`, {
      size: 13,
      style: "bold",
      gap: LINE,
    });
    if (!d.hasData) {
      write("No lap data available for this driver.", { size: 11 });
    } else {
      writeTyreRow(d);
      if (d.tyreAge != null) {
        write(`Tyre Age: ${d.tyreAge} lap${d.tyreAge === 1 ? "" : "s"}`, {
          size: 11,
        });
      }
      if (d.sectors) {
        write(
          `Sector Timings: S1: ${fmtSector(d.sectors.s1)}  S2: ${fmtSector(
            d.sectors.s2,
          )}  S3: ${fmtSector(d.sectors.s3)}`,
          { size: 11 },
        );
      }
    }
    y += 2;
  });

  // Per-channel summaries
  if (report.channels.length) {
    write("Channel summaries", { size: 13, style: "bold" });
    report.channels.forEach((c) => {
      write(`• ${c.label}${c.unit ? ` (${c.unit})` : ""}: ${c.bullet}`, {
        size: 11,
        style: "bold",
      });
      write(c.paragraph, { size: 10, gap: LINE + 2 });
    });
  }

  doc.save(
    `${report.year}-${sanitize(report.gpName)}-${sanitize(report.lapLabel)}.pdf`,
  );
}

const fs = require("fs");
const ExcelJS = require("exceljs");
const {
  Document,
  Packer,
  Paragraph,
  Table,
  TableRow,
  TableCell,
  TextRun,
  WidthType,
  ShadingType,
  VerticalAlign,
  TableLayoutType,
} = require("docx");

function parseSQL(sqlText) {
  const lines = sqlText.split("\n");
  const columns = [];

  const columnRegex = /^\s*([A-Z0-9_]+)\s+([A-Z0-9_()]+(?:\(\d+(?:,\d+)?\))?)/i;

  let insideTable = false;

  for (let rawLine of lines) {
    let line = rawLine.trim();

    // Detect CREATE TABLE start
    if (line.startsWith("CREATE TABLE")) {
      insideTable = true;
      continue;
    }

    // End of columns
    if (insideTable && line.startsWith(");")) {
      insideTable = false;
      break;
    }

    if (!insideTable || line.length === 0) continue;

    // --- Extract comment ---
    let comment = "";
    if (rawLine.includes("--")) {
      comment = rawLine.split("--")[1].trim();
    }

    // --- Extract variable + datatype ---
    const match = line.match(columnRegex);
    if (match) {
      const variable = match[1];
      const datatype = match[2];

      columns.push({ variable, datatype, description: comment });
    }
  }

  return columns;
}

function main() {
  const sqlFile = process.argv[2];

  if (!sqlFile) {
    console.error("❌ Please provide SQL file path");
    console.log("Example: node generateExcel.js schema.sql");
    return;
  }

  const sqlText = fs.readFileSync(sqlFile, "utf8");

  const columns = parseSQL(sqlText);

  createDoc(columns, "table_structure.docx");
}

async function createDoc(columns, outputName = "columns.docx") {
  const colWidth = 33.33; // equal width for 3 columns in percent
  const rowHeight = 400; // row height in twips (approx 0.5 inch)

  const tableRows = [];

  // ---------- HEADER ----------
  const headerRow = new TableRow({
    height: { value: rowHeight },
    children: [
      new TableCell({
        width: { size: colWidth, type: WidthType.PERCENTAGE },
        shading: { fill: "A6A6A6" },
        verticalAlign: VerticalAlign.CENTER,
        children: [
          new Paragraph({
            children: [
              new TextRun({ text: "Variable", bold: true, font: "Arial" }),
            ],
            spacing: { after: 100 },
          }),
        ],
      }),
      new TableCell({
        width: { size: colWidth, type: WidthType.PERCENTAGE },
        shading: { fill: "A6A6A6" },
        verticalAlign: VerticalAlign.CENTER,
        children: [
          new Paragraph({
            children: [
              new TextRun({ text: "Data Type", bold: true, font: "Arial" }),
            ],
            spacing: { after: 100 },
          }),
        ],
      }),
      new TableCell({
        width: { size: colWidth, type: WidthType.PERCENTAGE },
        shading: { fill: "A6A6A6" },
        verticalAlign: VerticalAlign.CENTER,
        children: [
          new Paragraph({
            children: [
              new TextRun({ text: "Description", bold: true, font: "Arial" }),
            ],
            spacing: { after: 100 },
          }),
        ],
      }),
    ],
  });

  tableRows.push(headerRow);

  // ---------- DATA ROWS ----------
  columns.forEach((col, index) => {
    const isGrey = index % 2 === 1;
    const fill = isGrey ? "D9D9D9" : "FFFFFF";

    tableRows.push(
      new TableRow({
        height: { value: rowHeight },
        children: [
          new TableCell({
            width: { size: colWidth, type: WidthType.PERCENTAGE },
            shading: { fill },
            verticalAlign: VerticalAlign.CENTER,
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: (col.variable || "").toUpperCase(),
                    font: "Arial",
                  }),
                ],
              }),
            ],
          }),
          new TableCell({
            width: { size: colWidth, type: WidthType.PERCENTAGE },
            shading: { fill },
            verticalAlign: VerticalAlign.CENTER,
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: (col.datatype || "").toUpperCase(),
                    font: "Arial",
                  }),
                ],
              }),
            ],
          }),
          new TableCell({
            width: { size: colWidth, type: WidthType.PERCENTAGE },
            shading: { fill },
            verticalAlign: VerticalAlign.CENTER,
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: (col.description || "").toUpperCase(),
                    font: "Arial",
                  }),
                ],
              }),
            ],
          }),
        ],
      })
    );
  });

  // ---------- TABLE ----------
  const table = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: tableRows,
    layout: TableLayoutType.FIXED, // ensures equal width
  });

  // ---------- DOCUMENT ----------
  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: "SQL Table Structure",
                bold: true,
                size: 36,
                font: "Arial",
              }),
            ],
            spacing: { after: 300 },
          }),
          table,
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(outputName, buffer);

  console.log(`DOCX generated: ${outputName}`);
}

main();

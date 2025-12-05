const fs = require("fs");
const path = require("path");
const {
  Document,
  Packer,
  Paragraph,
  Table,
  TableRow,
  TableCell,
  TextRun,
  WidthType,
  VerticalAlign,
  TableLayoutType,
} = require("docx");
const {parseHelper} = require("./parsreCreateTable.js");


// ----------------------- PARSE SQL -----------------------
function parseSQL(sqlText) {
    

  let create = "";
  let par = 0;
  const lines = sqlText.split("\n");
  const columns = [];




  parseHelper(sqlText);

  return;


  let insideTable = false;

  console.log(sqlText);
    
  for (let rawLine of lines) {
    let line = rawLine.trim();
    
    if (line.startsWith("CREATE TABLE")) {
      insideTable = true;

      for (let i = 0; i < sqlText.length; i++) {
        const ch = sqlText[i];
        if (ch === "(") {
            par++;
        };
        
        if (ch === ")") {
          par--;
          if (par === 0) {
            break;
          }
        }
        if (par > 0 && (par != 1 || par != 0)) create += ch;
      }
      continue;
    }
    const arr = create.replace(/\n/g , "").split(",");
    for (let index = 0; index < arr.length; index++) {
        let tem = arr[index].replace(/\s+/g, ' ').trim().split(" ");
        columns.push({ variable : tem[0] , datatype : tem[1], description: "" });
        insideTable = false;

    }


    let comment = "";
    if (rawLine.includes("--")) {
      comment = rawLine.split("--")[1].trim();
    }
  }

  return columns;
}

// ----------------------- CREATE ONE DOC FOR ALL FILES -----------------------
async function createDocForFolder(folderPath, outputName = "All_Tables.docx") {
  const docSections = [];

  const sqlFiles = fs
    .readdirSync(folderPath)
    .filter((file) => file.endsWith(".sql"));

  sqlFiles.forEach((fileName) => {
    
    const filePath = path.join(folderPath, fileName);
    const fileContent = fs.readFileSync(filePath, "utf8");


    
    const columns = parseSQL(fileContent);
 
    const tableName = fileName.replace(".sql", "").toUpperCase();

    // Create DOCX table for each SQL file
 //   const table = createTable(columns);

    // Add section heading + table
    docSections.push(
      new Paragraph({
        children: [
          new TextRun({
            text: tableName,
            size: 40,
            bold: true,
            font: "Arial",
          }),
        ],
        spacing: { after: 300 },
      })
    );

   // docSections.push(table);
    docSections.push(new Paragraph("")); // line break
  });

  // Create document
  const doc = new Document({
    sections: [{ children: docSections }],
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(outputName, buffer);

  console.log(`DOCX created successfully: ${outputName}`);
}

// ----------------------- CREATE TABLE (USED FOR EACH SQL) -----------------------
function createTable(columns) {
  const colWidth = 33.33;
  const rowHeight = 400;

  const tableRows = [];

  // HEADER
  tableRows.push(
    new TableRow({
      height: { value: rowHeight },
      children: [
        makeHeaderCell("VARIABLE", colWidth),
        makeHeaderCell("DATA TYPE", colWidth),
        makeHeaderCell("DESCRIPTION", colWidth),
      ],
    })
  );

  // DATA ROWS
  columns.forEach((col, index) => {
    const fill = index % 2 === 1 ? "D9D9D9" : "FFFFFF";

    tableRows.push(
      new TableRow({
        height: { value: rowHeight },
        children: [
          makeDataCell(col.variable, colWidth, fill),
          makeDataCell(col.datatype, colWidth, fill),
          makeDataCell(col.description, colWidth, fill),
        ],
      })
    );
  });

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: tableRows,
    layout: TableLayoutType.FIXED,
  });
}

// ----------------------- CELL HELPERS -----------------------
function makeHeaderCell(text, colWidth) {
  return new TableCell({
    width: { size: colWidth, type: WidthType.PERCENTAGE },
    shading: { fill: "A6A6A6" },
    verticalAlign: VerticalAlign.CENTER,
    children: [
      new Paragraph({
        children: [
          new TextRun({
            text: text.toUpperCase(),
            bold: true,
            font: "Arial",
          }),
        ],
      }),
    ],
  });
}

function makeDataCell(text, colWidth, fill) {
  return new TableCell({
    width: { size: colWidth, type: WidthType.PERCENTAGE },
    shading: { fill },
    verticalAlign: VerticalAlign.CENTER,
    children: [
      new Paragraph({
        children: [
          new TextRun({
            text: (text || "").toUpperCase(),
            font: "Arial",
          }),
        ],
      }),
    ],
  });
}

// ----------------------- EXPORT -----------------------
module.exports = {
  createDocForFolder,
};

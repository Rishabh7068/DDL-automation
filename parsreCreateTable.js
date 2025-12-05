function parseHelper(sqlText) {
  let createTableparsedData = "";
  const line = sqlText.split("\n");

  for (let rawLine of line) {
    rawLine = rawLine.replace(/\s+/g, " ");
    if (rawLine.includes("--")) {
      comment = rawLine.split("--")[0].trim();
      createTableparsedData += comment.trim() + "\n";
    } else {
      createTableparsedData += rawLine.trim() + "\n";
    }
  }
  createTableparsedData = createTableparsedData.split("\n");
  createTableparsedData = createTableparsedData.filter(
    (line) => line.trim() !== ""
  );

  for (let i = 0; i < createTableparsedData.length; i++) {
    let x = createTableparsedData[i];
    console.log(x);
    if (x.endsWith(",")) {
        createTableparsedData[i] = x.slice(0, -1); 
    }
  }

  console.log(createTableparsedData);
  return createTableparsedData;
}

module.exports = {
  parseHelper,
};



// let flag;
//   for (let i = 0; i < createTableUnparsedData.length; i++) {
//     const char = createTableUnparsedData[i];
//     if (char === "(") {
//       flag = i;
//       break;
//     }
//   }
//   for (let i = 0; i < createTableUnparsedData.length; i++) {
//     const char = createTableUnparsedData[i];
//     if (char === "(") {
//       parenthises++;
//     }
//     if (char === ")") {
//       parenthises--;
//       if (parenthises == 0) {
//         break;
//       }
//     }
//     if (parenthises > 0 && i != flag) {
//       createTableparsedData += char;
//     }
//   }

//   const createTablefilteredline = createTableparsedData
//     .replace(/\n/g, "")
//     .split(",");
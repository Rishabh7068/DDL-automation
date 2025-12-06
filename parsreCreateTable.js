function parseHelper(sqlText) {
  let createTableparsedData = "";
  const line = sqlText.split("\n");

  for (let rawLine of line) {
    rawLine = rawLine.replace(/\s+/g, " "); // remove all extra space 
    if (rawLine.includes("--")) {           // remove comment if any 
      comment = rawLine.split("--")[0].trim();
      createTableparsedData += comment.trim() + "\n";
    } else {
      createTableparsedData += rawLine.trim() + "\n";
    }
  }

  createTableparsedData = createTableparsedData.toUpperCase().split("\n");
  createTableparsedData = createTableparsedData.filter(
    (line) => line.trim() !== ""                                // remove all extra line
  );

  let parsedDataForCreateTable = getCreateTable(createTableparsedData);
  return parsedDataForCreateTable;
}

function getCreateTable(createTableparsedData) {
  let parenthises = 0;
  let newData ="";
  let afterCreatestatmentdata ="";
  let breakpoint =false ;
  
  for(let i = 0 ; i < createTableparsedData.length ; i++){
    for(let j = 0 ; j < createTableparsedData[i].length ; j++){
        let char = createTableparsedData[i][j]; 
        
        if(char === "("){
          parenthises++;
        }
        if(char === ")"){
          parenthises--;
          if(parenthises == 0){
            breakpoint = true;
          }
        }
        if (parenthises > 0 && !breakpoint ) {
          newData += char;
        }
        if(breakpoint){
          if(j === 0){
            afterCreatestatmentdata += " ";
          }
          afterCreatestatmentdata += char;
        }

    }
  }
  const splitafterCreatestatmentdata = afterCreatestatmentdata.split(";");
  for (let index = 0; index < splitafterCreatestatmentdata.length; index++) {
    if(splitafterCreatestatmentdata[index][0] === " "){
      splitafterCreatestatmentdata[index] = splitafterCreatestatmentdata[index].slice(1);
    }
  }
  const splitedData = splitOutsideParentheses(newData.slice(1))
  return {splitedData , splitafterCreatestatmentdata };
}


function splitOutsideParentheses(input) {
    const result = [];
    let current = "";
    let depth = 0;

    for (let i = 0; i < input.length; i++) {
        const char = input[i];

        if (char === '(') {
            depth++;
            current += char;
        } else if (char === ')') {
            depth--;
            current += char;
        } else if (char === ',' && depth === 0) {
            
            result.push(current.trim());
            current = "";
        } else {
            current += char;
        }
    }

    if (current.trim() !== "") {
        result.push(current.trim());
    }

    return result;
}

module.exports = {
  parseHelper,
};
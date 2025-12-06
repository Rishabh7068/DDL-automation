let column = [];
let nonuniqueindex = [];
let uniqueindex = [];
let primarykey = [];
let uniquekey = [];

function makeArrayofData(parsedData) {
  const { splitafterCreatestatmentdata, splitedData } = parsedData;

  for (let index = 0; index < splitedData.length; index++) {
    let array = splitedData[index].trim().split(/\s+/);
    let firstWord = array[0].toUpperCase();
    if (
      firstWord === "CONSTRAINT" ||
      firstWord === "KEY" ||
      firstWord === "PRIMARY" ||
      firstWord === "UNIQUE" ||
      firstWord === "FOREIGN"
    ) {
      if (firstWord === "CONSTRAINT") {
        handleCreateConstraint(splitedData[index]);
      } else if (firstWord === "KEY") {
        handleCreate(splitedData[index]);
      } else if (firstWord === "PRIMARY") {
        handlePrimaryKey(splitedData[index]);
      } else if (firstWord === "UNIQUE") {
        handleUniqueKey(splitedData[index]);
      }
    } else {
      column.push({
        variableName: array[0],
        variableDatatype: array[1],
        variableDescription:
          "Column contains value of " +
          firstWord.toLowerCase().replace(/_/g, " "),
      });
    }
  }

  for (let index = 0; index < splitafterCreatestatmentdata.length; index++) {
    let char = splitafterCreatestatmentdata[index][0];
    if (char === "C") {
      handleCreate(splitafterCreatestatmentdata[index]);
    } else if (char === "A") {
      handleAlter(splitafterCreatestatmentdata[index]);
    }
  }
  return {column , nonuniqueindex , uniqueindex , primarykey , uniquekey};
}

function handleCreateConstraint(line) {
    const {preData, postData  } =  helperFunction(line);
    let dividedLine = preData.split(" ");
    let name = dividedLine[1];
    let keyType = dividedLine[2];

    if(keyType === "PRIMARY"){
        primarykey.push({primarykeyName : name , primarykeyColumn : postData});
    }else if(keyType === "UNIQUE"){
        uniquekey.push({primarykeyName : name , primarykeyColumn : postData});
    }


}

function handlePrimaryKey(line) {
    const {preData, postData  } =  helperFunction(line);
    primarykey.push({primarykeyName : "" , primarykeyColumn : postData});
}

function handleUniqueKey(line) {
    const {preData, postData  } =  helperFunction(line);
    uniquekey.push({primarykeyName : "" , primarykeyColumn : postData});
}

function handleAlter(line) {
  let splitPreData = line.trim().split(" ");
  let casetohandle = splitPreData[3]; // ADD MODIFY CHANGE DROP RENAME

  if(splitPreData[4] === "PRIMARY" || splitPreData[4] === "UNIQUE" || splitPreData[4] === "CONSTRAINT" || splitPreData[4] ===  "FOREIGN"){
    // handle key alter 
    return;
  }

  if (casetohandle === "ADD") {
    if (splitPreData[4] === "COLUMN") {
      if (splitPreData.length > 7 && splitPreData[7] === "FIRST") {
        column.unshift({
          variableName: splitPreData[5],
          variableDatatype: splitPreData[6],
          variableDescription:
            "Column contains value of " +
            splitPreData[5].toLowerCase().replace(/_/g, " "),
        });
      } else if (splitPreData.length > 8 && splitPreData[7] === "AFTER") {
        let afterCol = splitPreData[8];
        let newColumn = {
          variableName: splitPreData[5],
          variableDatatype: splitPreData[6],
          variableDescription:
            "Column contains value of " +
            splitPreData[5].toLowerCase().replace(/_/g, " "),
        };
        let index = column.findIndex((c) => c.variableName === afterCol);
        if (index !== -1) {
          column.splice(index + 1, 0, newColumn);
        } else {
          column.push(newColumn);
        }
      } else {
        column.push({
          variableName: splitPreData[5],
          variableDatatype: splitPreData[6],
          variableDescription:
            "Column contains value of " +
            splitPreData[5].toLowerCase().replace(/_/g, " "),
        });
      }
    } else {
      column.push({
        variableName: splitPreData[4],
        variableDatatype: splitPreData[5],
        variableDescription:
          "Column contains value of " +
          splitPreData[4].toLowerCase().replace(/_/g, " "),
      });
    }
    //column.push({variableName : array[0] , variableDatatype : array[1] , variableDescription : "Column contains value of " +  firstWord.toLowerCase().replace(/_/g, " ")})
  } else if (casetohandle === "MODIFY") {
    let varName = splitPreData[4];
    let varDatatype = splitPreData[5];
    let index = column.findIndex(c => c.variableName === varName);
    if (index !== -1) {
        column[index].variableDatatype = varDatatype;
    }
  } else if (casetohandle === "CHANGE") {
    let preVarname = splitPreData[4];
    let newVarname = splitPreData[5];
    let newDatatype = splitPreData[6];
    let index = column.findIndex(c => c.variableName === preVarname);
    if (index !== -1) {
        column[index].variableName = newVarname;
        column[index].variableDatatype = newDatatype;
        column[index].variableDescription ="Column contains value of " + newVarname.toLowerCase().replace(/_/g, " ");
    }
  } else if (casetohandle === "RENAME" && splitPreData[4] === "COLUMN") {
    let varName = splitPreData[5];
    let newvarName = splitPreData[7];
    let index = column.findIndex(c => c.variableName === varName);
    if (index !== -1) {
        column[index].variableName = newvarName;
        column[index].variableDescription ="Column contains value of " + newvarName.toLowerCase().replace(/_/g, " ");
    }
  }
  return;
}

function handleCreate(line) {
  const { preData, postData } = helperFunction(line);
  let splitPreData = preData.trim().split(" ");
  if (splitPreData[0] === "KEY") {
    nonuniqueindex.push({ indexName: splitPreData[1], indexColumn: postData });
  }
  if (splitPreData[1] === "INDEX") {
    nonuniqueindex.push({ indexName: splitPreData[2], indexColumn: postData });
  }
  if (splitPreData[1] === "UNIQUE") {
    uniqueindex.push({ indexName: splitPreData[3], indexColumn: postData });
  }
}

function helperFunction(line) {
  let preData = "";
  let postData = "";
  let flag = false;

  for (let index = 0; index < line.length; index++) {
    let char = line[index];
    if (char === "(") {
      flag = true;
      continue;
    }
    if (char === ")") {
      flag = false;
      break;
    }
    if (flag) {
      postData += char;
    } else {
      preData += char;
    }
  }
  postData = postData.replace(/ /g, "").split(",");
  return { preData, postData };
}

module.exports = {
  makeArrayofData,
};

let xlsx = require('xlsx');
const fs = require('fs');
let wb = xlsx.readFile("./TestData/TestData.xlsx");

let ws = wb.Sheets["Sheet1"];
let data = xlsx.utils.sheet_to_json(ws);

let globalArray = [];
let newRecord = {};
data.forEach(function(record){
    newRecord[record.Test_Name]=record;
    delete record.Test_Name;
});

globalArray.push(newRecord);
console.log(globalArray)

var jsonContent = JSON.stringify(globalArray,null,'\t')

fs.writeFile("./TestData/TestData.json", jsonContent, 'utf8', err => {
    if (err) {
        console.log("An error occured while writing JSON Object to File.");
        return console.log(err);
    }
    console.log("JSON file has been saved.");
});
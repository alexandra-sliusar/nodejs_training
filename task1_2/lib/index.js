const { pipeline } = require('stream');
const csv = require('csvtojson');
const fs = require('fs');

const readStream = fs.createReadStream('./csv/example.csv');
const writeStream = fs.createWriteStream("./txt/output.txt");
const converter = csv({
  headers: ['book','author','amount','price'],
  ignoreColumns: /amount/,
  colParser: {
    "price" : "number"
  }
});

pipeline(
  readStream,
  converter,
  writeStream,
  (error) => {
    if (error) {
      console.error(`Error ${error} occured while executing.`);
    }
  }
);

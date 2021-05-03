const createCsvWriter = require('csv-writer').createObjectCsvWriter;

async function createCSV(pathToFile, header, records) {
    const csvWriter = createCsvWriter({
        path: pathToFile,
        header: header
    });

    return await csvWriter.writeRecords(records);
}

exports.createCSV = createCSV;
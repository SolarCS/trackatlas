const {MongoDBConnect, FsFiles} = require('./lib/mongo_utils');

async function fetchFileStats() {
    let types = {};
    let dates = {};

    const mongo_connection = new MongoDBConnect();
    try {
        await mongo_connection.connect();

        const files = new FsFiles(mongo_connection);
        const file_cursor = await files.fetchFileInformation({'contentType':1, 'uploadDate':1});

        for await (const doc of file_cursor) {
            doc.contentType in types ? types[doc.contentType] += 1 : types[doc.contentType] = 1
            doc.uploadDate.getFullYear() in dates ? dates[doc.uploadDate.getFullYear()] += 1 : dates[doc.uploadDate.getFullYear()] = 1
        }
    } catch (e) {
        console.error(e);
    } finally {
        console.log("Closing the connection");
        mongo_connection.close();
    }

    return {
        'contentTypes': types,
        'filesPerYear': dates
    }
}

fetchFileStats()
.then(data => {
    console.log(data);
})
.catch(e => {
    console.log(e);
})
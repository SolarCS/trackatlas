const {MongoDBConnect} = require('./lib/mongo_utils');
var fs = require('fs');

const FILE_PATH = './reports/collection_list.txt';

async function fetchCollectionList() {
    const mongo_connection = new MongoDBConnect();
    await mongo_connection.connect();

    const collections = await mongo_connection.fetchCollectionList();
    await mongo_connection.close();

    return collections;
}

fetchCollectionList().then(collections => {
    const collectionNames = collections.map(collection => {
        return collection.collectionName;
    });

    collectionNames.sort();

    fs.writeFile(FILE_PATH, collectionNames.join('\n'), err => {
        if (err) {
            console.error(err);
        } else {
            console.log(`collections report can be found in ${FILE_PATH}`);
        }
    });
}).catch(err => {
    console.error(err);
});


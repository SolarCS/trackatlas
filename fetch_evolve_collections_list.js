const {MongoDBConnect} = require('./lib/mongo_utils');
var fs = require('fs');

async function fetchCollectionList() {
    const mongo_connection = new MongoDBConnect();
    await mongo_connection.connect();

    const collections = await mongo_connection.fetchCollectionList();
    await mongo_connection.close();

    return collections;
}

fetchCollectionList().then(collections => {
    console.log("Writing collections out to ./collection_list.txt");
    collections.forEach(collection => {
        fs.appendFile('./collection_list.txt', collection.collectionName+'\n', err => {
            if (err) {
                console.error(err);
            }
        });
    });
}).catch(err => {
    console.error(err);
});


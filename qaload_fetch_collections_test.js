const {MongoDBConnect} = require('./lib/mongo_utils');

var mongo_connection;

async function fetchCollectionStats(collectionName) {
    return await mongo_connection.fetchCollectionStats(collectionName);
}

async function main() {
    mongo_connection = new MongoDBConnect();
    await mongo_connection.connect();

    const collections = await mongo_connection.fetchCollectionList();

    await mongo_connection.close();

    return collections;
}

main().then(collections => {
    console.log(collections);
}).catch(err => {
    console.error(err);
});

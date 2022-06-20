const {MongoDBConnect} = require('./lib/mongo_utils');
var fs = require('fs');

var args = process.argv.slice(2);

async function fetchCollectionList() {
    const mongo_connection = new MongoDBConnect();
    await mongo_connection.connect();

    const collections = await mongo_connection.fetchCollectionList();
    await mongo_connection.close();

    return collections;
}

//--First argument should be the location where to store the list
if (args?.length) {
    // array and array.length are truthy
    // ⇒ probably OK to process array
    fetchCollectionList().then(collections => {
        const collectionNames = collections.map(collection => {
            return collection.collectionName;
        });

        collectionNames.sort();

        fs.writeFile(args[0], collectionNames.join('\n'), err => {
            if (err) {
                console.error(err);
            } else {
                console.log(`collections report can be found in ${FILE_PATH}`);
            }
        });
    }).catch(err => {
        console.error(err);
    });
}

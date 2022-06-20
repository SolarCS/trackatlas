const {MongoDBConnect} = require('./lib/mongo_utils');
const {createCSV} = require('./lib/csv');

var args = process.argv.slice(2);

var mongo_connection;

async function fetchCollectionStats(collectionName) {
    return await mongo_connection.fetchCollectionStats(collectionName);
}

async function main() {
    mongo_connection = new MongoDBConnect();
    await mongo_connection.connect();

    const collections = await mongo_connection.fetchCollectionList();

    const collectionStats = await Promise.all(collections.map(async collection => {
        var stats = await mongo_connection.fetchCollectionStats(collection.collectionName);
        return  {
            namespace: stats.ns.replace('banff.', ''), 
            collectionSize: stats.size, 
            docCount: stats.count, 
            avgObjSize: stats.avgObjSize, 
            storageSize: stats.storageSize, 
            numIndexes: stats.nindexes, 
            totalIndexSize: stats.totalIndexSize
        };
        
    }));
    await mongo_connection.close();

    return collectionStats;
}

if (args?.length) {
    main().then(collections => {
        createCSV(
            args[0],
            [
                {id: 'namespace', title: 'Namespace'},
                {id: 'collectionSize', title: 'Collection Size (bytes)'},
                {id: 'docCount', title: 'Document Count'},
                {id: 'avgObjSize', title: 'Average Object Size (bytes)'},
                {id: 'storageSize', title: 'Storage Size'},
                {id: 'numIndexes', title: 'Number of Indexes'},
                {id: 'totalIndexSize', title: 'Total Index Size (bytes)'}
            ], 
            collections
        );    

    }).catch(err => {
        console.error(err);
    });
} else {
    console.log("Missing Output Path");
    console.log("node banff_collection_stats.js path/to/where/the/output/should/go");
}

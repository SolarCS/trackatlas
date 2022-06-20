const {MongoDBConnect, GenericCollection} = require('./lib/mongo_utils');
const {ObjectId} = require('mongodb');
const {default: PQueue} = require('p-queue');
const EventEmitter = require('events');
const fs = require('fs');
const csv = require('csv-parser');
const {createCSV} = require('./lib/csv');

class MyEmitter extends EventEmitter {}
const myEmitter = new MyEmitter();

const documentCountFetchQ = new PQueue({concurrency: 4});

const results = {};

//--This will be populated from a txt file
var collections;

// var collections = ["encounters", "patients"];

var cancelled_care_provider_ids = [];

var mongo_connection

async function connect() {
    mongo_connection = new MongoDBConnect();
    await mongo_connection.connect();
}

async function fetchCollectionStats(mongo_connection, collection) {
    const genericCollection = new GenericCollection(mongo_connection);
    let results = await genericCollection.fetchDocCountsByProviderId(cancelled_care_provider_ids, collection);
    myEmitter.emit('count',collection, results);
}

async function main() {
    try {
        await connect();
        const stat_functions = collections.map(collection => {
            return async () => {
                return await fetchCollectionStats(mongo_connection, collection);
            }
        });
    
        documentCountFetchQ.addAll(stat_functions);
        await documentCountFetchQ.onIdle();   
        myEmitter.emit('complete');   
    } catch (e) {
        console.error(e);
    } finally {
        console.log("Complete");
        await mongo_connection.close();
    }
}

myEmitter.on('count', (collection, collectionDocumentCounts) => {
    console.log(`${collection}: ${JSON.stringify(collectionDocumentCounts)}`);
    collectionDocumentCounts.forEach(count => {
        const {_id, total} = count;

        if (_id in results) {
            results[_id][collection] = total;
        } else {
            results[_id] = {};
            results[_id][collection] = total;
        }
    })
});

myEmitter.on('complete', () => {
    console.log("Writing Results");
    fs.writeFileSync('./reports/test_demo_cp_usage.json', JSON.stringify(results));
});

myEmitter.on('start', () => {
    collections = fs.readFileSync('./reports/collection_list.txt').toString().split("\n");
    main().catch(error => {
        console.error(error);
    });
})

fs.createReadStream('./reports/test_demo_care_providers.csv')
.pipe(csv())
.on('data', (data) => {
    cancelled_care_provider_ids.push(ObjectId(data.ID));
})
.on('end', () => {
    myEmitter.emit('start');
});

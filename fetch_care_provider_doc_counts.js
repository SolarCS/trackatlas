const {createCSV} = require('./lib/csv');
const csv = require('csv-parser');
const fs = require('fs');
const EventEmitter = require('events');
const {default: PQueue} = require('p-queue');
const {MongoDBConnect, Patients, Encounters} = require('./lib/mongo_utils');
const {ObjectId} = require('mongodb');

const mongo_connection = new MongoDBConnect();

const documentCountFetchQ = new PQueue({concurrency: 10});

class MyEmitter extends EventEmitter {}
const myEmitter = new MyEmitter();

const results = {};

async function fetchDocumentStats() {
    const mongo_connection = new MongoDBConnect();
    try {
        await mongo_connection.connect();
        console.log("Connected to Mongo");
    
        const patients = new Patients(mongo_connection);
        const encounters = new Encounters(mongo_connection);
    
        const keys = Object.keys(results);
    
        funcs = keys.map(key => {
            return async () => {
                let docCount = await patients.countDocuments({care_provider_id: ObjectId(key)});
                console.log(`patient count for ${key} = ${docCount}`);
                myEmitter.emit('count', key, "patientCount", docCount);
            }
        });

        funcs1 = keys.map(key => {
            return async () => {
                let docCount = await encounters.countDocuments({care_provider_id: ObjectId(key)});
                myEmitter.emit('count', key, "encounterCount", docCount);
            }
        });
    
        funcs = funcs.concat(funcs1);

        documentCountFetchQ.addAll(funcs);
        await documentCountFetchQ.onIdle();
        myEmitter.emit('complete');    
    } catch (e) {
        console.error(e);
    } finally {
        console.log("Closing the connection");
        mongo_connection.close();
    }
}

fs.createReadStream('./actual_care_providers_list.csv')
  .pipe(csv())
  .on('data', (data) => {
    results[data.ID] = data;
  })
  .on('end', () => {
    myEmitter.emit('start');
  });

myEmitter.on('start', () => {
    fetchDocumentStats().catch(e => {
        console.log("Shit");
        console.log(e);
    });
});

myEmitter.on('count', (key, field, docCount) => {
    console.log(`id: ${key}: ${docCount}`);
    results[key][field] = docCount;
});

myEmitter.on('complete', () => {
    console.log("I'm done - now write the results");
    console.log(results);
    const keys = Object.keys(results);

    const cp_list = keys.map(key => {
        return results[key];
    });

    createCSV(
        "./actual_care_providers_list2.csv", 
        [
            {id: 'ID', title: 'ID'},
            {id: 'NAME', title: 'NAME'},
            {id: 'CREATED', title: 'CREATED'},
            {id: 'CREATED (MS)', title: 'CREATED (MS)'},
            {id: 'UPDATED', title: 'UPDATED'},
            {id: 'UPDATED (MS)', title: 'UPDATED (MS)'},
            {id: 'TAGS', title: 'TAGS'},
            {id: 'patientCount', title: 'Patient Count'},
            {id: 'encounterCount', title: 'Encounter Count'},
        ], 
        cp_list
    );    
});
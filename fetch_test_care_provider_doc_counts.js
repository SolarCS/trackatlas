const {createCSV} = require('./lib/csv');
const csv = require('csv-parser');
const fs = require('fs');
const EventEmitter = require('events');
const {default: PQueue} = require('p-queue');
const {MongoDBConnect, Patients, Encounters, Interactions, Enrollments, CallAttempts, ArchievedCallAttempts} = require('./lib/mongo_utils');
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
        const interactions = new Interactions(mongo_connection);
        const enrollments = new Enrollments(mongo_connection);
        const call_attempts = new CallAttempts(mongo_connection);
        const archived_call_attempts = new ArchievedCallAttempts(mongo_connection);

    
        const keys = Object.keys(results);
    
        funcs = keys.map(key => {
            const query = {care_provider_id: ObjectId(key)};
            return [
                async () => {
                    let docCount = await patients.countDocuments(query);
                    myEmitter.emit('count', key, "patientCount", docCount);
                },
                async () => {
                    let docCount = await encounters.countDocuments(query);
                    myEmitter.emit('count', key, "encounterCount", docCount);
                },
                async () => {
                    let docCount = await interactions.countDocuments(query);
                    myEmitter.emit('count', key, "interactionCount", docCount);
                },
                async () => {
                    let docCount = await enrollments.countDocuments(query);
                    myEmitter.emit('count', key, "enrollmentsCount", docCount);
                },
                async () => {
                    let docCount = await call_attempts.countDocuments(query);
                    myEmitter.emit('count', key, "callAttemptsCount", docCount);
                },
                async () => {
                    let docCount = await archived_call_attempts.countDocuments(query);
                    myEmitter.emit('count', key, "archievedCallAttemptsCount", docCount);
                }
             ]
        });
    
        funcs = funcs.flat();

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

fs.createReadStream('./test_demo_canceled_care_providers_list.csv')
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
    console.log(`${key}: ${field} = ${docCount}`);
    results[key][field] = docCount;
});

myEmitter.on('complete', () => {
    console.log("Writing Results");
    const keys = Object.keys(results);

    const cp_list = keys.map(key => {
        return results[key];
    });

    createCSV(
        "./test_demo_canceled_care_providers_list2.csv", 
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
            {id: 'interactionCount', title: 'Interaction Count'},
            {id: 'enrollmentsCount', title: 'Enrollment Count'},
            {id: 'callAttemptsCount', title: 'Call Attempts Count'},
            {id: 'archievedCallAttemptsCount', title: 'Archieved Call Attempts Count'}
        ], 
        cp_list
    );    
});
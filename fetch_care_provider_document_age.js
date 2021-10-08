const {createCSV} = require('./lib/csv');
const prompt = require('prompt');
const csv = require('csv-parser');
const fs = require('fs');
const EventEmitter = require('events');
const {default: PQueue} = require('p-queue');
const {
    MongoDBConnect, 
    Patients, 
    Encounters, 
    Interactions, 
    Enrollments, 
    CallAttempts, 
    ArchivedCallAttempts,
    PatientIssues,
    PatientEvents,
    UnitVisits
} = require('./lib/mongo_utils');
const {ObjectId, ObjectID} = require('mongodb');

const mongo_connection = new MongoDBConnect();

const documentCountFetchQ = new PQueue({concurrency: 10});

class MyEmitter extends EventEmitter {}
const myEmitter = new MyEmitter();

const results = {};
var params;

// - TODO This needs to be command line driven

console.log("Fetch Care Provider document count for documents last updated before (YYYY-MM-DD):");
prompt.start();
prompt.get(['inputFile','outputFile','date'], function (err, result) {
    if (err) {
        console.error(err);
        process.exit();
    }
    params = result;

    params.dateObject = new Date(result.date);

    fs.createReadStream(params.inputFile)
    .pipe(csv())
    .on('data', (data) => {
        results[data.ID] = data;
    })
    .on('end', () => {
        myEmitter.emit('start');
    });
});

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
        const archived_call_attempts = new ArchivedCallAttempts(mongo_connection);
        const patient_issues = new PatientIssues(mongo_connection);
        const patient_events = new PatientEvents(mongo_connection);
        const unit_visits = new UnitVisits(mongo_connection);
    
        //--Key is the care_provider_id
        const keys = Object.keys(results);
    
        funcs = keys.map(key => {
            return [
                async () => {
                    let docCount = await patients.lastUpdatedBefore(key, params.dateObject);
                    myEmitter.emit('count', key, "patientCount", docCount);
                },
                async () => {
                    let docCount = await encounters.lastUpdatedBefore(key, params.dateObject);
                    myEmitter.emit('count', key, "encounterCount", docCount);
                },
                async () => {
                    let docCount = await interactions.lastUpdatedBefore(key, params.dateObject);
                    myEmitter.emit('count', key, "interactionCount", docCount);
                },
                async () => {
                    let docCount = await enrollments.lastUpdatedBefore(key, params.dateObject);
                    myEmitter.emit('count', key, "enrollmentsCount", docCount);
                },
                async () => {
                    let docCount = await call_attempts.lastUpdatedBefore(key, params.dateObject);
                    myEmitter.emit('count', key, "callAttemptsCount", docCount);
                },
                async () => {
                    let docCount = await archived_call_attempts.lastUpdatedBefore(key, params.dateObject);
                    myEmitter.emit('count', key, "archivedCallAttemptsCount", docCount);
                },
                async () => {
                    let docCount = await patient_issues.lastUpdatedBefore(key, params.dateObject);
                    myEmitter.emit('count', key, "patientIssues", docCount);
                },
                async () => {
                    let docCount = await patient_events.lastUpdatedBefore(key, params.dateObject);
                    myEmitter.emit('count', key, "patientEvents", docCount);
                },
                async () => {
                    let docCount = await unit_visits.lastUpdatedBefore(key, params.dateObject);
                    myEmitter.emit('count', key, "unitVisits", docCount);
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

myEmitter.on('start', () => {
    fetchDocumentStats().catch(e => {
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
        params.outputFile,
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
            {id: 'archivedCallAttemptsCount', title: 'Archived Call Attempts Count'},
            {id: 'patientIssues', title: 'Patient Issues'},
            {id: 'patientEvents', title: 'Patient Events'},
            {id: 'unitVisits', title: 'Unit Visits'}
        ], 
        cp_list
    );    
});


const fs = require('fs');
const {createCSV} = require('./lib/csv');
const prompt = require('prompt');
const csv = require('csv-parser');
const EventEmitter = require('events');
class MyEmitter extends EventEmitter {}
const myEmitter = new MyEmitter();

const PATIENTS=1359;
const ENCOUNTERS=1473;
const INTERACTIONS=6957;
const ENROLLMENTS=295;
const CALL_ATTEMPTS=2226;
const ARCHIVED_CALL_ATTEMPTS=2407;
const PATIENT_ISSUES=13502;
const PATIENT_EVENTS=312;
const UNIT_VISITS=337;

const results = [];

fs.createReadStream("./reports/actual_care_providers.csv")
.pipe(csv())
.on('data', (data) => {
    data['Patient Count'] = Number(data['Patient Count']) * PATIENTS;
    data['Encounter Count'] = Number(data['Encounter Count']) * ENCOUNTERS;
    data['Interaction Count'] = Number(data['Interaction Count']) * INTERACTIONS;
    data['Enrollment Count'] = Number(data['Enrollment Count']) * ENROLLMENTS;
    data['Call Attempts Count'] = Number(data['Call Attempts Count']) * CALL_ATTEMPTS;
    data['Archived Call Attempts Count'] = Number(data['Archived Call Attempts Count']) * ARCHIVED_CALL_ATTEMPTS;
    data['Patient Issues'] = Number(data['Patient Issues']) * PATIENT_ISSUES;
    data['Patient Events'] = Number(data['Patient Events']) * PATIENT_EVENTS;
    data['Unit Visits'] = Number(data['Unit Visits']) * UNIT_VISITS;

    results.push(data);
})
.on('end', () => {
    createCSV(
        "./reports/actual_care_provider_document_sizing.csv", 
        [
            {id: 'ID', title: 'ID'},
            {id: 'NAME', title: 'NAME'},
            {id: 'Patient Count', title: 'Patients Size'},
            {id: 'Encounter Count', title: 'Encounters Size'},
            {id: 'Interaction Count', title: 'Interactions Size'},
            {id: 'Enrollment Count', title: 'Enrollments Size'},
            {id: 'Call Attempts Count', title: 'Call Attempts Size'},
            {id: 'Archived Call Attempts Count', title: 'Archived Call Attempts Size'},
            {id: 'Patient Issues', title: 'Patient Issues Size'},
            {id: 'Patient Events', title: 'Patient Events Size'},
            {id: 'Unit Visits', title: 'Unit Visits Size'}
        ], 
        results
    );    
});




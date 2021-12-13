//--Get Unique Patient Count for 
//--UC Cincinatti CP ID = 
const {MongoDBConnect, Patients} = require('../lib/mongo_utils');
const {ObjectId} = require("mongodb");
const fs = require('fs');

const UC_CINCIN_CP_ID = "58f6cd49d27cbe42a2fed86f";
const NEW_YEAR_2021 = new Date(Date.UTC(2021,0,1,0,0,0));

async function fetchPatientCount() {
    const mongo_connection = new MongoDBConnect();
    try {
        await mongo_connection.connect();
        console.log("Connected to Mongo");
    
        const patients = new Patients(mongo_connection);

        let total_patient_count = await patients.countDocuments({care_provider_id: ObjectId(UC_CINCIN_CP_ID)});
        let unique_2021_patients = await patients.distinctPatientsCreatedAfter(UC_CINCIN_CP_ID, NEW_YEAR_2021);
        let total_2021_patients = await patients.createdAfter(UC_CINCIN_CP_ID, NEW_YEAR_2021, {mrn:1});

        console.log(`Total Patient Count      : ${total_patient_count}`);
        console.log(`Unique 2021 Patient Count: ${unique_2021_patients.length}`);
        console.log(`2021 Patient Count       : ${total_2021_patients.length}`);

        return {
            unique: unique_2021_patients,
            total: total_2021_patients
        };
    } finally {
        mongo_connection.close();
        console.log("Mongo Connection Closed");
    }
}

fetchPatientCount().then(patients => {
    fs.writeFileSync('./UniCincinnatiMedCen2021/cincin_2021_patients.json', JSON.stringify(patients));
}).catch(error => {
    console.error(error);
});




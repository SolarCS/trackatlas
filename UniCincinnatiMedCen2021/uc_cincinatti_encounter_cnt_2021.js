//--Get Unique Patient Count for 
//--UC Cincinatti CP ID = 
const {MongoDBConnect, Encounters} = require('../lib/mongo_utils');
const {createCSV} = require('../lib/csv');

const UC_CINCIN_CP_ID = "58f6cd49d27cbe42a2fed86f";
const NEW_YEAR_2021 = new Date(Date.UTC(2021,0,1,0,0,0));

async function fetchPatientCount() {
    const mongo_connection = new MongoDBConnect();
    try {
        await mongo_connection.connect();
        console.log("Connected to Mongo");
    
        const encounters = new Encounters(mongo_connection);

        let total_2021_encounters = await encounters.createdAfter(UC_CINCIN_CP_ID, NEW_YEAR_2021, {
            encounter_id: 1,
            patient_id: 1,
            provider_patient_id: 1,  //--mrn
            created_at: 1
        });
        console.log(`2021 Encounter Count: ${total_2021_encounters.length}`);

        return total_2021_encounters;

    } finally {
        mongo_connection.close();
        console.log("Mongo Connection Closed");
    }
}

fetchPatientCount().then(encounters => {
    createCSV(
        "./UniCincinnatiMedCen2021/cincin-2021-encounters.csv",
        [
            {id: '_id', title: 'ID'},
            {id: 'patient_id', title: 'Patient ID'},
            {id: 'provider_patient_id', title: 'MRN'},
            {id: 'encounter_id', title: 'Encounter ID'},
            {id: 'created_at', title: 'Created At'}
        ], 
        encounters
    );    
}).catch(error => {
    console.error(error);
});




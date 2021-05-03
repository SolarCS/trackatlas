const {MongoDBConnect, Patients} = require('./lib/mongo_utils');
const {ObjectId} = require('mongodb');

async function run() {
    const mongo_connection = new MongoDBConnect();
    try {
        await mongo_connection.connect();
        console.log("Connected");

        const patients = new Patients(mongo_connection);
        const count = await patients.countDocuments({care_provider_id: ObjectId("52fe61815241497341ee0000")});

        console.log(`Patient Count: ${count}`);

    } finally {
        mongo_connection.close();
        console.log("Closed");
    }
}

run().catch(console.dir);
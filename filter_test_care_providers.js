const {MongoDBConnect, CareProviders} = require('./lib/mongo_utils');
const {createCSV} = require('./lib/csv');

const FILE_PATH = './reports/';

async function run() {
    const mongo_connection = new MongoDBConnect();
    try {
        await mongo_connection.connect();
        console.log("Connected");

        const care_providers = new CareProviders(mongo_connection);
        const count = await care_providers.getCount();
        console.log(`Care Provider Count: ${count}`);

        //--Extract
        const cp_list = await care_providers.listAll({_id:1, name:1, created_at: 1, updated_at: 1, tags: 1});

        //--Transform
        //--Convert dates to epoch format for easier ordering in excel
        cp_list.forEach(cp => {
            cp['createdAtMS'] = cp.created_at.getTime();
            cp['updatedAtMS'] = cp.updated_at.getTime();
        });

        //--Filter list to only INCLUDE TEST, DEMO, or CANCELED care providers
        const test_filtered_list = cp_list.filter(provider => {
            if (Array.isArray(provider.tags) && ((provider.tags.includes("demo") || provider.tags.includes("cancelled") || provider.tags.includes("test")))) {
                return provider;
            }
        });

        //--Filter list to only EXCLUDE TEST, DEMO, or CANCELED care providers
        const filtered_list = cp_list.filter(provider => {
            if (Array.isArray(provider.tags) && !((provider.tags.includes("demo") || provider.tags.includes("cancelled") || provider.tags.includes("test")))) {
                return provider;
            }
        });
    
        //--Load
        createCSVReport(cp_list, "care_providers_list.csv");
        createCSVReport(test_filtered_list, "test_demo_canceled_care_providers_list.csv");
        createCSVReport(filtered_list, "actual_care_providers_list.csv");
    } finally {
        mongo_connection.close();
        console.log("Closed");
    }

    function createCSVReport(cp_list, filename) {
        createCSV(
            FILE_PATH + filename,
            [
                { id: '_id', title: 'ID' },
                { id: 'name', title: 'NAME' },
                { id: 'created_at', title: 'CREATED' },
                { id: 'createdAtMS', title: 'CREATED (MS)' },
                { id: 'updated_at', title: 'UPDATED' },
                { id: 'updatedAtMS', title: 'UPDATED (MS)' },
                { id: 'tags', title: 'TAGS' }
            ],
            cp_list
        );
    }
}

run().catch(console.error);

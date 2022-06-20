const {
    MongoDBConnect, 
    CallHourInfo,
    CareProviders
} = require('./lib/mongo_utils');
const {ObjectId} = require('mongodb');

//Dates must be entered in YYYY-MM-DD
var [,, start_date, end_date, output_file] = process.argv;

function partial_application(func, ...args) {
    return (...moreArgs) => {
        return func(...args, ...moreArgs);
    }
}

function async_compose(...function_pipeline) {
    return (input) => {
        return function_pipeline.reduceRight((accumulator, current_func) => accumulator.then(current_func), Promise.resolve(input));
    }
}

async function main(start_date, end_date, output_file) {
    console.log(`Start Date: ${start_date}, End Date: ${end_date}, Output File: ${output_file}`);
    // const mongo_connection = new MongoDBConnect();
    try {
        // await mongo_connection.connect();

        const new_chi_fetch = partial_application(fetch_call_hour_information, start_date, end_date);

        await async_compose(
            fetch_care_provider_information, 
            fetch_outreach_program_information, 
            new_chi_fetch
        )().then(result => {
            console.log(result);
        });
    } catch (e) {
        console.error(e);
    } finally {
        console.log("Closing the connection");
        // mongo_connection.close();
    }

    async function fetch_call_hour_information(start_date, end_date) {
        console.log(`Fetch Call Hour Information: Start Date: ${start_date}, End Date: ${end_date}`);
        return {};
    }
    
    async function fetch_outreach_program_information(call_hour_information) {
        console.log('Fetch Outreach Program Information');
        console.log(`call_hour_information: ${call_hour_information}`);
        return call_hour_information;
    }
    
    async function fetch_care_provider_information(call_hour_information) {
        console.log('Fetch Care Provider Information');
        console.log(`call_hour_information: ${call_hour_information}`);
        return call_hour_information;    
    }    
}

main(start_date, end_date, output_file).catch(err => {
    console.error(err);
});
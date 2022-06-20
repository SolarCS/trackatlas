const {
    MongoDBConnect, 
    CallHourInfo,
    CareProviders,
    OutreachProgram
} = require('./lib/mongo_utils');
const {ObjectId} = require('mongodb');
const {createCSV} = require('./lib/csv');

var results = [];

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
    const mongo_connection = new MongoDBConnect();
    try {
        await mongo_connection.connect();

        const new_chi_fetch = partial_application(fetch_call_hour_information, start_date, end_date);

        await async_compose(
            fetch_outreach_program_information, 
            new_chi_fetch
        )().then(result => {
            createCSV(
                output_file,
                [
                    {id: 'care_provider_name', title: 'Care Provider Name'},
                    {id: 'care_provider_id', title: 'Care Provider ID'},
                    {id: 'time_zone', title: 'Time Zone'},
                    {id: 'program_name', title: 'Program Name'},
                    {id: 'outreach_program_id', title: 'Outreach Program ID'},
                    {id: 'outreach_use_case', title: 'Outreach Use Case'},
                    {id: 'category', title: 'Category'},
                    {id: 'outreach_grouping_type', title: 'Outreach Grouping Type'},
                    {id: 'date', title: 'Call Launch Date'},
                    {id: 'hour', title: 'Call Launch Hour'},
                    {id: 'scheduled_count', title: 'Scheduled Count'},
                    {id: 'launched_count', title: 'Launched Count'}
                ], 
                result
            );    
        });
    } catch (e) {
        console.error(e);
    } finally {
        console.log("Closing the connection");
        mongo_connection.close();
    }

    async function fetch_call_hour_information(start_date, end_date) {
        console.log(`Fetch Call Hour Information: Start Date: ${start_date}, End Date: ${end_date}`);

        const call_hour_info = new CallHourInfo(mongo_connection);

        return await call_hour_info.fetchCallHourInformation(new Date(start_date), new Date(end_date), {
            _id: 0,
            scheduled_count: 1,
            launched_count: 1,
            outreach_program_id: 1,
            date: 1,
            hour: 1,
            category: 1
        });
    }
    
    async function fetch_outreach_program_information(call_hour_information) {
        console.log('Fetch Outreach Program Information');

        const outreach_program = new OutreachProgram(mongo_connection);
        const care_provider = new CareProviders(mongo_connection);

        //--Need a more parallel solution than this to speed up large result sets
        for (const call_hour of call_hour_information) {
	        const program = await outreach_program.getById(call_hour.outreach_program_id, {
                _id: 0,
                care_provider_id: 1,
                outreach_use_case: 1,
                name: 1,
                outreach_grouping_type: 1
            });

	        const cp = await care_provider.getById(program[0].care_provider_id, {
                _id: 0,
                time_zone: 1,
                name: 1
            });
            
            results.push({
                ...call_hour,
                care_provider_id: program[0].care_provider_id,
                outreach_use_case: program[0].outreach_use_case,
                program_name: program[0].name,
                outreach_grouping_type: program[0].outreach_grouping_type,
                time_zone: cp[0].time_zone,
                care_provider_name: cp[0].name
            });
        }
        
        return results;
    } 
}

main(start_date, end_date, output_file).catch(err => {
    console.error(err);
});

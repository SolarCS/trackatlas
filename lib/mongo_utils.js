const {MongoClient, ObjectId, ReadPreference} = require("mongodb");
const {protocol, mongodb_url, database_name: db, username, password} = require("config");

class MongoDBConnect {
    constructor() {
        this.url = protocol+"://"+username+":"+password+"@"+mongodb_url+"/"+db;
	console.log(`Mongo connection URL: ${this.url}`);
    }

    async connect() {
        try {
            this.client = new MongoClient(this.url, {useUnifiedTopology: true, readPreference: ReadPreference.SECONDARY}); 
            await this.client.connect();
            this.database = await this.client.db();
        } catch (e) {
            throw e;
        }
    }

    async close() {
        await this.client.close();
    }

    get database() {
        return this.client_database;
    }

    set database(db) {
        this.client_database = db;
    }

    async fetchCollectionList() {
        return await this.database.collections();
    }

    async fetchCollectionStats(nameOfCollection) {
        return await this.database.collection(nameOfCollection).stats();
    }
}

class CareProviders {
    constructor(connection) {
        this.connection = connection;
        this.cp_collection = this.connection.database.collection('care_providers');
    }

    async getCount() {
        return await this.cp_collection.estimatedDocumentCount();
    }

    async listAll(projection = {}) {
        return await this.cp_collection.find({}).project(projection).toArray();
    }
}

let collctionMixin = {
    fetchCollection() {
        this.collection = this.connection.database.collection(this.collectionName);
    },

    fetchCollectionByName(collectionName) {
        this.collection = this.connection.database.collection(collectionName);
    },

    async countDocuments(query = {}) {
        return await this.collection.countDocuments(query);
    },

    async lastUpdatedBefore(care_provider_id, dateObject) {
        return await this.collection.find({care_provider_id: ObjectId(care_provider_id), updated_at: {$lte: dateObject}}).count();
    },

    async createdAfter(care_provider_id, dateObject, projection) {
        return await this.collection.find({
            care_provider_id: ObjectId(care_provider_id), 
            created_at: {$gte: dateObject}
        }).project(projection).toArray();   
    },

    async getById(object_id, projection = {}) {
        return await this.collection.find({_id: ObjectId(object_id)}).project(projection);
    }
}

class Patients {
    constructor(connection) {
        this.connection = connection;
        this.collectionName = 'patients';
        this.fetchCollection();
    }

    async distinctPatientsCreatedAfter(care_provider_id, dateObject) {
        return await this.collection.distinct("mrn", {
            care_provider_id: ObjectId(care_provider_id), 
            created_at: {$gte: dateObject}
        });      
    }
}
Object.assign(Patients.prototype, collctionMixin);

class Encounters {
    constructor(connection) {
        this.connection = connection;
        this.collectionName = 'encounters';
        this.fetchCollection();
    }
}
Object.assign(Encounters.prototype, collctionMixin);

class Interactions {
    constructor(connection) {
        this.connection = connection;
        this.collectionName = 'interactions';
        this.fetchCollection();
    }    
}
Object.assign(Interactions.prototype, collctionMixin);

class Enrollments {
    constructor(connection) {
        this.connection = connection;
        this.collectionName = 'enrollments';
        this.fetchCollection();
    }    
}
Object.assign(Enrollments.prototype, collctionMixin);

class CallAttempts {
    constructor(connection) {
        this.connection = connection;
        this.collectionName = 'call_attempts';
        this.fetchCollection();
    }    
}
Object.assign(CallAttempts.prototype, collctionMixin);

class ArchivedCallAttempts {
    constructor(connection) {
        this.connection = connection;
        this.collectionName = 'archived_call_attempts';
        this.fetchCollection();
    }    
}
Object.assign(ArchivedCallAttempts.prototype, collctionMixin);

class PatientIssues {
    constructor(connection) {
        this.connection = connection;
        this.collectionName = 'issues';
        this.fetchCollection();
    }
}
Object.assign(PatientIssues.prototype, collctionMixin);

class UnitVisits {
    constructor(connection) {
        this.connection = connection;
        this.collectionName = 'unit_visits';
        this.fetchCollection();
    }
}
Object.assign(UnitVisits.prototype, collctionMixin);

class PatientEvents {
    constructor(connection) {
        this.connection = connection;
        this.collectionName = 'patient_events';
        this.fetchCollection();
    }
}
Object.assign(PatientEvents.prototype, collctionMixin);

class FsFiles {
    constructor(connection) {
        this.connection = connection;
        this.collectionName = "fs.files";
        this.fetchCollection();
    }

    async fetchFileInformation(projection) {
        return await this.collection.find().project(projection);
    }
}
Object.assign(FsFiles.prototype, collctionMixin);

class CallHourInfo {
    constructor(connection) {
        this.connection = connection;
        this.collectionName = "call_hour_infos";
        this.fetchCollection();
    }

    //--Fetch Call Hour Information for the date range start_date..end_date
    //--the projection specifies what fields to return in the result
    //--i.e. date, launched_count, scheduled_count, outreach_program_id, hour
    async fetchCallHourInformation(start_date, end_date, projection = {}) {
        return await this.collection.find({date: {$gte:start_date, $lt:end_date}}).project(projection).toArray();
    }
}
Object.assign(CallHourInfo.prototype, collctionMixin);

class OutreachProgram {
    constructor(connection) {
        this.connection = connection;
        this.collectionName = "outreach_programs";
        this.fetchCollection();
    }
}
Object.assign(OutreachProgram.prototype, collctionMixin);

class GenericCollection {
    constructor(connection) {
        this.connection = connection;
    }

    async fetchDocCountsByProviderId(care_provider_ids, collectionName) {
        this.fetchCollectionByName(collectionName);

        return this.collection.aggregate([
            {
                $match: {
                    care_provider_id: {
                        $in: care_provider_ids
                    }
                }
            },
            {
                $group: 
                { 
                    _id: "$care_provider_id", 
                    total: { 
                        $sum: 1
                    }
                }
            }
        ]).toArray();
    }
}
Object.assign(GenericCollection.prototype, collctionMixin);


exports.MongoDBConnect = MongoDBConnect;
exports.CareProviders = CareProviders;
exports.Patients = Patients;
exports.Encounters = Encounters;
exports.Interactions = Interactions;
exports.Enrollments = Enrollments;
exports.CallAttempts = CallAttempts;
exports.ArchivedCallAttempts = ArchivedCallAttempts;
exports.PatientIssues = PatientIssues;
exports.PatientEvents = PatientEvents;
exports.UnitVisits = UnitVisits;
exports.GenericCollection = GenericCollection;
exports.FsFiles = FsFiles;
exports.CallHourInfo = CallHourInfo;

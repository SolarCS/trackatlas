# trackatlas

## Installation
~~~~
npm install
~~~~

## Scripts
### filter_test_care_providers
Reads the Care Providers collection and generates 3 separate CSV files:
- care_providers_list: Summary of all care providers in the database
- test_demo_canceled_care_providers_list: Summary of care providers that have been tagged Demo/Test/Cancelled 
- actual_care_providers_list: Care providers that aren't tagged as Demo/Test/Cancelled

Each of these reports has the following information:
- care provider id
- care provider name
- created at date in human readable format
- created at date in epoch time (for excel sorting)
- last updated at date in human readable format
- last updated at date in epoch time (for excel sorting)
- a list of tags associated with the database

All reports are written to ./reports
### fetch_care_provider_usage_report
Generates a CSV file documenting the number of documents associated with a particular care provider for the following collections:
- Patients
- Encounters
- Interactions
- Enrollments
- CallAttempts
- ArchivedCallAttempts
- PatientIssues
- PatientEvents
- UnitVisits

The report can be generated for either the Demo/Test/Cancelled care providers or the "actual" care providers

### fetch_care_provider_document_age.js
Generates a CSV file documenting the number of documents associated with a particular care provider before a given date
for the following collections:
- Patients
- Encounters
- Interactions
- Enrollments
- CallAttempts
- ArchivedCallAttempts
- PatientIssues
- PatientEvents
- UnitVisits

### fetch_evolve_collections_list.js
Generates a txt file (collections.txt) containing the names of all collections in the banff database
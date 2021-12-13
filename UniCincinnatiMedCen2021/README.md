# University of Cincinnati 2021 Patient Count
https://cipherhealth.atlassian.net/browse/CIP-1190
12/13/2021

## Patients
~~~~
trackatlas cgianelle$ node UniCincinnatiMedCen2021/uc_cincinatti_patient_cnt_2021.js 
Connected to Mongo
Total Patient Count      : 537648
Unique 2021 Patient Count: 102905
2021 Patient Count       : 103162
Mongo Connection Closed
~~~~

- Total Patient Count: Total number of documents in the _patient_ collection
- Unique 2021 Patients: This is a _distinct_ query on the _patients_ collection using the _mrn_ field as to find distinct values from 1/1/2021 0:0:0 UTC.
- 2021 Patient Count: This is the total number of patient documents created after 1/1/2021 0:0:0 UTC

Results are written to cincin_2021_patients.json

## Encounters
~~~~
trackatlas cgianelle$ node UniCincinnatiMedCen2021/uc_cincinatti_encounter_cnt_2021.js 
UniCincinnatiMedCen2021 cgianelle$ node cincin-2021-uniquePatients.js
Unique Patients : 264687
Total Encounters: 1355895
~~~~

- uc_cincinatti_encounter_cnt_2021.js: retrieves UofCin encounters created after 1/1/2021 0:0:0 UTC, stores data as a CSV
- cincin-2021-uniquePatients.js: from the encounters CSV, creates a unique Set by _patient_id_ to determine the number of unique patients seen in 2021.


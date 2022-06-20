from os import write
import pandas as pd
import argparse
import csv
from functools import partial
from enum import Enum
import collections

Row = collections.namedtuple("Row", [
    "ID",
    "NAME",
    "CREATED",
    "CREATED_MS",
    "UPDATED",
    "UPDATED_MS",
    "TAGS",
    "Patient_Count",
    "Encounter_Count",
    "Interaction_Count",
    "Enrollment_Count",
    "Call_Attempts_Count",
    "Archived_Call_Attempts_Count",
    "Patient_Issues",
    "Patient_Events",
    "Unit_Visits"
])

class Index(Enum):
    ID          = 0
    NAME        = 1
    CREATED     = 2
    CREATED_MS  = 3
    UPDATED     = 4
    UPDATED_MS  = 5




def getPastDocumentRowById(previousDoc, id):
    results = previousDoc.loc[previousDoc['ID'] == id]
    if results.values.any():
        return Row._make(results.values[0])
    else:
        return None

def calculateGrowth(new, old):
    return round((((new - old) / old) * 100), 2) if old else None


parser = argparse.ArgumentParser()
parser.add_argument("-c", "--Current", help = "Current Care Provider collection usage report", required=True)
parser.add_argument("-p", "--Previous", help = "Previous Care Provider collection usage report", required=True)
parser.add_argument("-o", "--Output", help = "Where to restore the resulting report", required=True)


args = parser.parse_args()

current_df = pd.read_csv(args.Current, index_col=False)
previous_df = pd.read_csv(args.Previous, index_col=False)

getDocCount = partial(getPastDocumentRowById, previous_df)

growth = []
for _, row in current_df.iterrows():
    current_row = Row._make(list(row.values))
    previous_row = getDocCount(row.ID)
    if not previous_row:
        continue

    growth.append(
        (
            current_row.ID, current_row.NAME,
            current_row.Patient_Count, previous_row.Patient_Count, 
            current_row.Patient_Count - previous_row.Patient_Count, 
            calculateGrowth(current_row.Patient_Count, previous_row.Patient_Count),
            current_row.Encounter_Count, previous_row.Encounter_Count,
            current_row.Encounter_Count - previous_row.Encounter_Count,
            calculateGrowth(current_row.Encounter_Count, previous_row.Encounter_Count),
            current_row.Interaction_Count, previous_row.Interaction_Count,
            current_row.Interaction_Count - previous_row.Interaction_Count,
            calculateGrowth(current_row.Interaction_Count, previous_row.Interaction_Count),
            current_row.Archived_Call_Attempts_Count, previous_row.Archived_Call_Attempts_Count,
            current_row.Archived_Call_Attempts_Count - previous_row.Archived_Call_Attempts_Count,
            calculateGrowth(current_row.Archived_Call_Attempts_Count, previous_row.Archived_Call_Attempts_Count),
            current_row.Patient_Issues, previous_row.Patient_Issues,
            current_row.Patient_Issues - previous_row.Patient_Issues,
            calculateGrowth(current_row.Patient_Issues, previous_row.Patient_Issues),
            current_row.Patient_Events, previous_row.Patient_Events,
            current_row.Patient_Events - previous_row.Patient_Events,
            calculateGrowth(current_row.Patient_Events, previous_row.Patient_Events),
            current_row.Unit_Visits, previous_row.Unit_Visits,
            current_row.Unit_Visits - previous_row.Unit_Visits,
            calculateGrowth(current_row.Unit_Visits, previous_row.Unit_Visits)
        )
    )

with open(args.Output, 'w') as f:
    w = csv.writer(f)
    w.writerow([
        'ID', 'NAME', 
        
        'Current Patient Count', 'Previous Patient Count',
        'Patient Count Difference', 'Patient Growth Percentage',

        'Current Encounter Count', 'Previous Encounter Count',
        'Encounter Count Difference', 'Encounter Growth Percentage',

        'Current Interaction Count', 'Previous Interaction Count',
        'Interaction Count Difference', 'Interaction Growth Percentage',

        'Current Archived Call Attempts Count', 'Previous Archived Call Attempts Count',
        'Archived Call Attempts Count Difference', 'Archived Call Attempts Growth Percentage',

        'Current Patient Issue Count', 'Previous Patient Issue Count',
        'Patient Issue Count Difference', 'Patient Issue Growth Percentage',

        'Current Patient Events Count', 'Previous Patient Events Count',
        'Patient Events Count Difference', 'Patient Events Growth Percentage',

        'Current Unit Visits Count', 'Previous Unit Visits Count',
        'Unit Visits Count Difference', 'Unit Visits Growth Percentage'
    ])
    w.writerows(growth)

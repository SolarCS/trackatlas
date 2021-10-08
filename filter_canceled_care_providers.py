import csv

def wasCancelled(tags):
    return True if 'cancelled' in tags else False

cancelledCareProviders = []
with open('./reports/test_demo_canceled_care_providers_list.csv.csv', newline='') as csvfile:
    reader = csv.DictReader(csvfile)
    for row in reader:
        if wasCancelled(row['TAGS'].split(',')):
            cancelledCareProviders.append(row)

field_names = list(cancelledCareProviders[0].keys())

with open('./reports/cancelled_care_providers.csv', 'w', newline='') as csvfile:
    writer = csv.DictWriter(csvfile, fieldnames=field_names)

    writer.writeheader()
    for cp in cancelledCareProviders:
        writer.writerow(cp)
        

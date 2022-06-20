import csv
import argparse

def wasCancelled(tags):
    return True if 'cancelled' in tags else False

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Filter Canceled/Test Care Providers CSV into just the canceled care providers')
    parser.add_argument('--test_canceled_csv_loc', required=True, help='Location of the CSV file that contains the test/canceled care providers')
    parser.add_argument('--report_output', required=True, help='Where to store the newly created canceled care providers csv')

    args = parser.parse_args()

    cancelledCareProviders = []
    with open(args.test_canceled_csv_loc, newline='') as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            if wasCancelled(row['TAGS'].split(',')):
                cancelledCareProviders.append(row)

    field_names = list(cancelledCareProviders[0].keys())

    with open(args.report_output, 'w', newline='') as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=field_names)

        writer.writeheader()
        for cp in cancelledCareProviders:
            writer.writerow(cp)
        

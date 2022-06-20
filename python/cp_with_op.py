import pandas as pd

source1_df = pd.read_csv('./reports/test_demo_care_providers/test_demo_providers_updated.csv', index_col=False)
source2_df = pd.read_csv('./reports/test_demo_care_providers/test_demo_care_providers.csv', index_col=False)

#in the find the row with "outreach_programs" from the Collection column
row = source1_df.loc[source1_df['Collections'] == "outreach_programs"]
# print(row)

#drop all columns (care providers) that don't have a value in this row
row = row.dropna(axis=1, how='any')
# print(row)

#remove all columns that aren't care_providers
care_providers = list(row.columns)
care_providers.remove("Collections")
care_providers.remove("Collection Total")
care_providers.remove("Byte Total")

#cross this list of care providers with the complete list of test and demo providers and get the name associated
#with the ID
for cp in care_providers:
    print(source2_df.loc[source2_df['ID'] == cp, "NAME"].values[0])

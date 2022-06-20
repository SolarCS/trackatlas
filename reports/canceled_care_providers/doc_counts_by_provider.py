import pandas as pd

def getCareProviderName(df, care_provider_id):
    return df.loc[df['ID'] == care_provider_id, 'NAME'].values[0]


cancelled_cp_df = pd.read_csv('./canceled_providers_updated.csv')
cancelled_providers_list_df = pd.read_csv('./cancelled_care_providers.csv')

columns = list(cancelled_cp_df)

data = []
for column in columns:
    if column not in ['Collections', 'Collection Total', 'Byte Total']:
        name = getCareProviderName(cancelled_providers_list_df, column)
        data.append([column, name, cancelled_cp_df[column][123]])

counts = pd.DataFrame(data, columns=['Care Provider ID', 'Name', 'Document Count'])

counts.to_csv('./canceled_care_provider_doc_counts.csv', index=False)
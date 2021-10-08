import pandas as pd
from functools import partial

def getCollectionObjectSize(collection_stats_df, collection):
    return collection_stats_df.loc[collection_stats_df['Namespace'] == collection, 'Average Object Size (bytes)'].values[0]

def sumColumns(dataframe):
    total_row = {'Collections':'CP Total'}
    for column in cancelled_cp_df.columns:
        if column == 'Collections':
            continue
        docCount = cancelled_cp_df[column].sum()
        total_row[column] = docCount
    return total_row

def createTotalSizeColumn(cancelled_cp_df, collection_stats_df):
    getObjSize = partial(getCollectionObjectSize, collection_stats_df)
    newColumn = []
    for _, row in cancelled_cp_df.iterrows():
        collection = row.values[0]
        if collection == 'CP Total':
            newColumn.append(0)
            continue
        size = getObjSize(collection)
        newColumn.append(row.values[94]*size)
    return newColumn

if __name__ == "__main__":
    cancelled_cp_df = pd.read_csv('./reports/canceled_care_providers/canceled_providers.csv')
    collection_stats_df = pd.read_csv('./reports/collectionStats.csv', index_col=False)

    #Create a new row with the sum of documents for each care provider
    newRow = sumColumns(cancelled_cp_df)
    cancelled_cp_df = cancelled_cp_df.append(newRow, ignore_index = True)

    #Create a sum for each of the rows (collections) and assign the value to a new column, 'Collection Total'
    cancelled_cp_df['Collection Total'] = cancelled_cp_df.sum(axis=1)

    #take the two tables and figure out the total byte size of documents allocated to each collection
    #and assign it back to the data frame
    newColumn = createTotalSizeColumn(cancelled_cp_df, collection_stats_df)
    cancelled_cp_df['Byte Total'] = newColumn
    
    #write the new data frame with the calculations back to file
    cancelled_cp_df.to_csv('./reports/canceled_care_providers/canceled_providers_updated.csv', index=False)

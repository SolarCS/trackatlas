import pandas as pd
import csv

source1_df = pd.read_csv('./reports/test_demo_canceled_care_providers_list.csv', index_col=False)
source2_df = pd.read_csv('./reports/cancelled_care_providers.csv', index_col=False)

#-----------------------------
s1 = set(zip(source1_df.ID, source1_df.NAME))
s2 = set(zip(source2_df.ID,source2_df.NAME))

s_diff = s1 - s2

with open('./reports/test_demo_care_providers.csv', 'w') as f:
    w = csv.writer(f)
    w.writerow(['ID', "NAME"])
    w.writerows(list(s_diff))

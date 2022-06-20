from os import write
import pandas as pd
import argparse
import csv

parser = argparse.ArgumentParser()
parser.add_argument("-s", "--Source1", help = "Source file for comparison", required=True)
parser.add_argument("-d", "--Source2", help = "File for which comparison to source will be made", required=True)
parser.add_argument("-o", "--Output", help="Where the results of the comparison should be stored")

args = parser.parse_args()

print("Comparing {0} to {1}".format(args.Source1, args.Source2))

source1_df = pd.read_csv(args.Source1, index_col=False)
source2_df = pd.read_csv(args.Source2, index_col=False)

#-----------------------------
s1 = set(zip(source1_df.ID, source1_df.NAME))
s2 = set(zip(source2_df.ID,source2_df.NAME))

difference2 = s2.difference(s1)

print(difference2)
id_list = [d[0] for d in list(difference2)]
print(id_list)

may_diff_df = source2_df[source2_df['ID'].isin(id_list)]
may_diff_df.to_csv(args.Output, index=False)

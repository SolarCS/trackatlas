import glob
import os
import pandas as pd
import argparse

parser = argparse.ArgumentParser()
parser.add_argument("-p", "--Path", help = "Path to directory where the split result are located", required=True)
args = parser.parse_args()

#read in all of the split results files and concat them into a single dataframe
df = pd.concat(map(pd.read_csv, glob.glob(os.path.join(args.Path, "*.csv"))))

print(df)

df.to_csv(args.Path + '/full_report.csv', index=False)
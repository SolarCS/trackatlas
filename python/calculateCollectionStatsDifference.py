import pandas as pd
import argparse

parser = argparse.ArgumentParser()
parser.add_argument("-n", "--Newest", help = "Path to the most recent Collection Stats", required=True)
parser.add_argument("-l", "--Oldest", help = "Path to the oldest Collection Stats", required=True)
parser.add_argument("-o", "--Output", help = "Output path to directory where the results are written", required=True)
args = parser.parse_args()

print(args)

source1_df = pd.read_csv(args.Newest, index_col=False)
source2_df = pd.read_csv(args.Oldest, index_col=False)

diff_df = source1_df.set_index('Namespace').subtract(source2_df.set_index("Namespace"), fill_value=0)

# print(diff_df)
diff_df.to_csv(args.Output)


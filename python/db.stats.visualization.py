import matplotlib.pyplot as plt
import pandas as pd

db_stats = pd.read_csv('../data/banff.db.stats.csv', index_col=False)

# Indexes
db_stats["IndexSizeInGB"] = db_stats["IndexSize"] / 2**30
db_stats.plot(x="Sampling Date", y="IndexSizeInGB")
plt.axhline(y=192, color='r', linestyle='-', label='Atlas Cache Limit')
plt.axhline(y=154, color='g', linestyle='-', label='Mongo Safe Limit')

#Compressed Growth
#fsUsedSize
# db_stats["fsUsedSizeInTB"] = db_stats["fsUsedSize"] / 2**40
# db_stats.plot(x="Sampling Date", y="fsUsedSizeInTB")
# plt.axhline(y=2.36, color='r', linestyle='-', label='Storage Allocation')
plt.show()
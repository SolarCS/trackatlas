import pandas as pd
df = pd.read_json('./test_demo_cp_usage.json')
df.to_csv('test_demo_cp_usage.csv')

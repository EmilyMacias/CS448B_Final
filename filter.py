import pandas as pd
import sys

# Read the NFCS data CSV file
input_file = 'NFCS 2024 State Data 250623.csv'
try:
    df = pd.read_csv(input_file)
except FileNotFoundError:
    print(f"Error: '{input_file}' not found.", file=sys.stderr)
    sys.exit(1)

# Columns from population_filtered_by_investment.csv: A50A, A50B, A41, B14A_1, B14A_60, A4A_new_w
# Plus A8 (check if it's A8 or A8_2021)
population_columns = ['A50A', 'A50B', 'A41', 'B14A_1', 'B14A_60', 'A4A_new_w']

# Check for A8 column (could be A8 or A8_2021)
a8_column = None
if 'A8' in df.columns:
    a8_column = 'A8'
elif 'A8_2021' in df.columns:
    a8_column = 'A8_2021'
else:
    print("Warning: Neither 'A8' nor 'A8_2021' found in the CSV.", file=sys.stderr)

# Build list of columns to keep
columns_to_keep = population_columns.copy()
if a8_column:
    columns_to_keep.append(a8_column)

# Check which columns exist in the dataframe
existing_columns = [col for col in columns_to_keep if col in df.columns]
missing_columns = [col for col in columns_to_keep if col not in df.columns]

if missing_columns:
    print(f"Warning: The following columns were not found: {', '.join(missing_columns)}", file=sys.stderr)

# Filter for only the columns we want
df_filtered = df[existing_columns].copy()

# Ensure B14A_1 and B14A_60 are numeric, coercing errors to NaN
df_filtered['B14A_1'] = pd.to_numeric(df_filtered['B14A_1'], errors='coerce')
df_filtered['B14A_60'] = pd.to_numeric(df_filtered['B14A_60'], errors='coerce')

# Filter for rows where B14A_1 == 2 OR B14A_60 == 2
df_filtered = df_filtered[(df_filtered['B14A_1'] == 2) | (df_filtered['B14A_60'] == 2)]

# Drop rows with NaN in the filtered columns if they were introduced by coercion
df_filtered = df_filtered.dropna(subset=['B14A_1', 'B14A_60'])

# Save to a new CSV file
output_filename = 'population_filtered_nfcs.csv'
df_filtered.to_csv(output_filename, index=False)

print(f"Filtered CSV saved as '{output_filename}'")
print(f"Original rows: {len(df)}")
print(f"Filtered rows: {len(df_filtered)}")
print(f"Rows where B14A_1 == 2: {len(df[(pd.to_numeric(df['B14A_1'], errors='coerce') == 2)])}")
print(f"Rows where B14A_60 == 2: {len(df[(pd.to_numeric(df['B14A_60'], errors='coerce') == 2)])}")
print(f"\nColumns kept: {df_filtered.columns.tolist()}")
print("\nSample of filtered data:")
print(df_filtered.head())

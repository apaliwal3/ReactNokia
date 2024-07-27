import pandas as pd
import numpy as np
import glob
import sys

exl_path = sys.argv[1]
out_path = sys.argv[2]
file_name = sys.argv[3]

print(f"exl_path: {exl_path}")
print(f"out_path: {out_path}")
print(f"file_name: {file_name}")


if not exl_path.endswith('/') and not exl_path.endswith('\\'):
    exl_path += '/'

if not out_path.endswith('/') and not out_path.endswith('\\'):
    out_path += '/'

# Input files path
siteDB_path = glob.glob(exl_path + "SiteDB_2G_ZM*")
cbh_path = glob.glob(exl_path + "CBH*")
file = glob.glob(exl_path + "2G_3G_file.xlsx")
trx_path = glob.glob(exl_path + "2G TRX PWR*")

# Output file path
output_file_path = out_path + '/' + file_name + '.xlsx'

# Function to merge and extract
def extract_and_merge(df, data, columns_to_merge, left_on, right_on, how):
    """
    This function receives a dataframe and a list of columns from the dataframe and merges them with our output file.
    - df: The output dataframe to which the columns will be merged.
    - data: The input dataframe from which the columns will be extracted.
    - columns_to_merge: A list of column names to merge.
    - left_on: The name of the key column in the first (left) dataframe.
    - right_on: The name of the key column in the second (right) dataframe.
    - how: The type of merge to be performed.
    """

    # Extract column from data
    t1 = data[columns_to_merge]

    # Merging column to our output file.
    df = pd.merge(df, t1, left_on=left_on, right_on=right_on, how=how)
    return df

# Function

def extract_last_characters(Cell):
    if len(Cell) >= 3:
        return Cell[-1:]
    else:
        return None


def determine_sector(row):
    """
    This function receives a row from a dataframe and returns the Band based on the last characters of the cell name.
    """
    if row['last_character'] in ['A', 'D', 'G', 'J', '1', '4', '7']:
        return '1'
    elif row['last_character'] in ['B', 'E', 'H', 'K', '2', '5', '8']:
        return '2'
    elif row['last_character'] in ['C', 'F', 'I', 'L', '3', '6', '9']:
        return '3'
    else:
        return None


def main():
    # Reading input files
    df2 = pd.read_csv(siteDB_path[0], usecols=['SITE_ID', 'HQ_TOWN', 'MO', 'Vendor'])
    df3 = pd.read_csv(cbh_path[0], skiprows=3, low_memory=False,
                      usecols=['Cell Name', 'TOTAL DEFINED TRX UL', 'TOTAL DEFINED TRX OL'])
    trx_dump = pd.read_excel(trx_path[0],
                             usecols=['frequencyBand', 'configuredMaxTxPower', 'GsmSectorId', 'BtsFunctionId',
                                      'NodeId'])
    df4 = pd.read_excel(file[0])

    df2 = df2.rename(columns={'MO': 'Cell'})
    df3 = df3.rename(columns={'Cell Name': 'Cell'})

    merged_df = df2[df2['Vendor'] == 'Ericsson']
    merged_df = extract_and_merge(merged_df, trx_dump, ['BtsFunctionId', 'NodeId'], 'SITE_ID', 'BtsFunctionId', 'left')
    merged_df = merged_df.drop(['Vendor', 'BtsFunctionId'], axis=1)
    merged_df = merged_df.rename(columns={'NodeId': 'BB_ID'})

    merged_df['last_character'] = merged_df['Cell'].apply(extract_last_characters)

    merged_df['Site'] = merged_df.apply(determine_sector, axis=1)
    merged_df['Site_sector'] = pd.concat([merged_df['SITE_ID'], merged_df['Site'].astype(str)], axis=1).apply('_'.join, axis=1)

    merged_df = merged_df.drop(['last_character'], axis = 1)
    merged_df = merged_df.drop_duplicates()

    # merged1_df
    merged1_df = pd.merge(merged_df, df3, on='Cell')

    # Rename the column
    merged1_df = merged1_df.rename(columns={'TOTAL DEFINED TRX UL': '900 TRX '})
    merged1_df = merged1_df.rename(columns={'TOTAL DEFINED TRX OL': '1800 TRX'})
    merged1_df = merged1_df.drop_duplicates()

    columns_to_drop = ['BB ID', 'Cell', 'SITE_ID']
    df4 = df4.drop(columns=columns_to_drop)
    df4 = df4.rename(columns={'Site Sector': 'Site_sector'})

    merged_final = pd.merge(merged1_df, df4, on='Site_sector')

    trx_dump['last_character'] = trx_dump['GsmSectorId'].apply(extract_last_characters)
   # Apply the function to create a new column 'sector'
    trx_dump['sector'] = trx_dump.apply(determine_sector, axis=1)
   # Drop the last character of the 'GsmSectorId' column
    trx_dump['GsmSectorId'] = trx_dump['GsmSectorId'].str.slice(stop=-1)
   # Concatenate two columns using the concat method
    trx_dump['Site_sector'] = pd.concat([trx_dump['GsmSectorId'], trx_dump['sector'].astype(str)], axis=1).apply(
        '_'.join, axis=1)

    # Create initial columns with NaN values
    trx_dump['Per TRX G900/power'] = np.nan
    trx_dump['Per TRX G1800/power'] = np.nan

    # Allocate 'configuredMaxTxPower' based on 'freq' condition
    trx_dump.loc[trx_dump['frequencyBand'] == 3, 'Per TRX G1800/power'] = trx_dump['configuredMaxTxPower']
    trx_dump.loc[trx_dump['frequencyBand'] == 8, 'Per TRX G900/power'] = trx_dump['configuredMaxTxPower']

    # If a 'site_sector' has both 'freq' values, fill both columns
    trx_dump['Per TRX G900/power'] = trx_dump.groupby('Site_sector')['Per TRX G900/power'].transform('first')
    trx_dump['Per TRX G1800/power'] = trx_dump.groupby('Site_sector')['Per TRX G1800/power'].transform('first')
    trx_dump = trx_dump.drop_duplicates()

    merged_final1 = pd.merge(merged_final, trx_dump, on='Site_sector')
    columns_drop = ['GsmSectorId', 'configuredMaxTxPower', 'frequencyBand', 'sector', 'last_character', 'NodeId',
                    'Site', 'BtsFunctionId']
    merged_final1 = merged_final1.drop(columns=columns_drop)

    merged_final1['G900 TRX Power'] = (merged_final1['Per TRX G900/power'] * merged_final1['900 TRX ']) / 1000
    merged_final1['G1800 TRX Power'] = (merged_final1['Per TRX G1800/power'] * merged_final1['1800 TRX']) / 1000

    merged_final1['Total 900 consumed'] = merged_final1['G900 TRX Power'] + merged_final1['U900 Power']
    merged_final1['Total 1800 consumed'] = merged_final1['G1800 TRX Power'] + merged_final1['L1800 Power']

    merged_final1['Remaining 1800 Power'] = merged_final1['Total RRU Power (1800) '] - merged_final1[
        'Total 1800 consumed']
    merged_final1['Remaining 900 Power'] = merged_final1['Total RRU Power  (U900) W'] - merged_final1[
        'Total 900 consumed']

    merged_final1 = merged_final1.drop_duplicates(subset = ['Cell', 'SITE_ID', 'Site_sector'])
    print(merged_final1)

#     Save dataframe in excel file
    with pd.ExcelWriter(output_file_path) as writer:

        merged_final1.to_excel(writer, index=False)
        print("Code executed successfully.")


if __name__ == "__main__":
    main()

sys.exit(0)


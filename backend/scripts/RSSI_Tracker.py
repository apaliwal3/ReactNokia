import os
import pandas as pd
from datetime import datetime, timedelta
import warnings
import sys


def tracker(file, folder, combine_df):
    for f in file:
        if 'Eric4G' in f:
            file_path = os.path.join(folder, f)
            # print(file_path)
            rssi_df = pd.read_csv(file_path, skiprows=3, index_col=False)
            #droping na
            rssi_df = rssi_df.dropna()
            # Convert the 'date_column' to datetime
            rssi_df['Date'] = pd.to_datetime(rssi_df['Date'], errors='coerce')
            # If you want to convert them to a specific format, you can use the `dt.strftime` method
            rssi_df['Date'] = rssi_df['Date'].dt.strftime('%d-%m-%Y')
            # Convert the 'Date' column to datetime
            rssi_df['Date'] = pd.to_datetime(rssi_df['Date'], errors='coerce')
            # Find the maximum date in the 'Date' column
            max_date = rssi_df['Date'].max()
            # Calculate the cutoff date (maximum date minus 7 days)
            cutoff_date = max_date - timedelta(days=7)
            # # Filter the DataFrame to retain only rows from the last 7 days
            filtered_df = rssi_df[rssi_df['Date'] > cutoff_date]
            # print(filtered_df['Date'].head(5))
            erc_df = combine_df[combine_df['Vendor'] == 'ERIC']
            # Convert the 'date_column' to datetime
            erc_df['DATE_ID'] = pd.to_datetime(erc_df['DATE_ID'], errors='coerce')
            # If you want to convert them to a specific format, you can use the `dt.strftime` method
            erc_df['DATE_ID'] = erc_df['DATE_ID'].dt.strftime('%d-%m-%Y')
            # Convert the 'Date' column to datetime
            erc_df['DATE_ID'] = pd.to_datetime(erc_df['DATE_ID'], errors='coerce')
            # print(combine_df['DATE_ID'].head(5))
            filtered_df['Date_cellid'] = filtered_df['Date'].astype(str) + ':' + filtered_df['EUtranCell Id'].astype(str)
            erc_df['Date_cellid'] = erc_df['DATE_ID'].astype(str) + ':' + erc_df['EUtranCellFDD'].astype(
                str)
            filtered_df = filtered_df[['Date_cellid', 'UL RSSI']]
            # #  Calculating (96_RRC_denom - 96_RRC_nom) and  Calculate (115_inital_erab_denom - 115_inital_erab_nom)
            erc_df['RRC_Fail'] = erc_df['96_RRC_setup_Success_ratio_denom'] - erc_df[
                '96_RRC_setup_Success_ratio_nom']
            erc_df['ERAB_Fail'] = erc_df['115_Initial_ERAB_Setup_Success_Rate_denom'] - erc_df[
                '115_Initial_ERAB_Setup_Success_Rate_nom']
            erc_df.rename(columns={'ERAB Drop Rate% (eNB + MME)_Nom_122': 'Drops'}, inplace=True)
            erc_df = erc_df[['Date_cellid', 'ERAB_Fail', 'RRC_Fail', 'Drops']]
            merg_df = pd.merge(erc_df, filtered_df, on='Date_cellid', how='inner')
            merg_df[['Date', 'EUtranCell_Id']] = merg_df['Date_cellid'].str.split(':', expand=True)
            merg_pvt = merg_df.pivot_table(index='EUtranCell_Id', columns='Date', values=['ERAB_Fail', 'RRC_Fail', 'Drops', 'UL RSSI'], aggfunc='sum')
            # Add a new column 'Count_Last7' with the count of values greater than -100 in the last 7 columns starting from row 3
            # merg_pvt['Count_Last7'] = (merg_pvt.iloc[:, -7:] > -100).sum(axis=1)
            # Assuming the names of the last 7 columns are 'Col1', 'Col2', ..., 'Col7'
            column_names_last_7 = ['UL RSSI']
            # Create a boolean DataFrame where True corresponds to values > -100
            greater_than_minus_100 = merg_pvt[column_names_last_7] > -100
            # Sum along the columns to get the count of values greater than -100 for each row
            merg_pvt['Count_Last7'] = greater_than_minus_100.sum(axis=1)
            merg_pvt = merg_pvt[~merg_pvt['Count_Last7'].isin([0, 1, 2, 3])]
            merg_pvt.drop(columns='Count_Last7', inplace=True)
            # merg_pvt.to_csv(folder+r"\\RSSI_ERC.csv")

            ################################################
            ###for S1 tracker
            s1_df = combine_df[combine_df['Vendor'] == 'ERIC']
            s1_df['Session_SR'] = (s1_df['Session_Success_Rate_Nom'] / s1_df['Session_Success_Rate_Denom']) * 100
            s1_pvt = s1_df.pivot_table(index='EUtranCellFDD', columns='DATE_ID', values=['Session_SR', '175_Number_S1_Setup_Failure'], aggfunc='sum')
            ##condition for Session_SR
            column_names = ['Session_SR']
            # Create a boolean DataFrame where True corresponds to values > -100
            s1_condition = s1_pvt[column_names] < 99
            # Sum along the columns to get the count of values greater than -100 for each row
            s1_pvt['Count_Last7'] = s1_condition.sum(axis=1)
            s1_pvt = s1_pvt[~s1_pvt['Count_Last7'].isin([0, 1, 2, 3])]
            s1_pvt.drop(columns='Count_Last7', inplace=True)
            ##condition for 175_Number_S1_Setup_Failure
            column_names = ['175_Number_S1_Setup_Failure']
            # Create a boolean DataFrame where True corresponds to values > -100
            s1_condition = s1_pvt[column_names] > 50
            # Sum along the columns to get the count of values greater than -100 for each row
            s1_pvt['Count_Last7'] = s1_condition.sum(axis=1)
            s1_pvt = s1_pvt[~s1_pvt['Count_Last7'].isin([0, 1, 2, 3])]
            s1_pvt.drop(columns='Count_Last7', inplace=True)
            with pd.ExcelWriter(processDir + r"/RSSI_S1_Erc.xlsx", engine='xlsxwriter') as writer:
                # Write each DataFrame to a different sheet
                merg_pvt.to_excel(writer, sheet_name='RSSI_Tracker')
                s1_pvt.to_excel(writer, sheet_name='S1_Tracker')

        elif 'RSSI' in f or 'rssi' in f:
            file_path = os.path.join(folder, f)
            rssi_df = pd.read_excel(file_path, sheet_name='RSSI', index_col=False, engine='openpyxl')
            #droping 1st row
            rssi_df = rssi_df.drop(0)
            try:
                rssi_df['Period start time'] = rssi_df['Period start time'].astype(str)
                rssi_df[['Date', 'Hour']] = rssi_df['Period start time'].str.split(' ', expand=True)
            except:
                rssi_df['Date'] = rssi_df['Period start time'].astype(str)
            # droping na
            rssi_df = rssi_df.dropna()
            # Convert the 'date_column' to datetime
            rssi_df['Date'] = pd.to_datetime(rssi_df['Date'], errors='coerce')
            # If you want to convert them to a specific format, you can use the `dt.strftime` method
            rssi_df['Date'] = rssi_df['Date'].dt.strftime('%d-%m-%Y')
            # Convert the 'Date' column to datetime
            rssi_df['Date'] = pd.to_datetime(rssi_df['Date'], errors='coerce')
            # Find the maximum date in the 'Date' column
            max_date = rssi_df['Date'].max()
            # print('max_date', max_date)
            # Calculate the cutoff date (maximum date minus 7 days)
            cutoff_date = max_date - timedelta(days=7)
            # print('current_date', cutoff_date)
            # # Filter the DataFrame to retain only rows from the last 7 days
            filtered_df = rssi_df[rssi_df['Date'] > cutoff_date]
            filtered_df['Date'] = filtered_df['Date'].dt.strftime('%d-%m-%Y')
            # print(filtered_df['Date'].unique())
            nokia_df = combine_df[combine_df['Vendor'] == 'NOKIA']
            # Convert the 'date_column' to datetime
            nokia_df['DATE_ID'] = pd.to_datetime(nokia_df['DATE_ID'], errors='coerce')
            # If you want to convert them to a specific format, you can use the `dt.strftime` method
            nokia_df['DATE_ID'] = nokia_df['DATE_ID'].dt.strftime('%d-%m-%Y')
            # print('max_date', nokia_df['DATE_ID'].max())
            # Convert the 'Date' column to datetime
            nokia_df['DATE_ID'] = pd.to_datetime(nokia_df['DATE_ID'], errors='coerce')
            nokia_df['DATE_ID'] = nokia_df['DATE_ID'].dt.strftime('%d-%m-%Y')
            # print(combine_df['DATE_ID'].head(5))
            filtered_df['Date_cellid'] = filtered_df['Date'].astype(str) + ':' + filtered_df['LNCEL name'].astype(
                str)
            nokia_df['Date_cellid'] = nokia_df['DATE_ID'].astype(str) + ':' + nokia_df['EUtranCellFDD'].astype(
                str)
            filtered_df = filtered_df[['Date_cellid', 'Avg RSSI for PUCCH', 'Avg RSSI for PUSCH']]
            # filtered_df.to_csv(folder + r'\\test1.csv')
            # #  Calculating (96_RRC_denom - 96_RRC_nom) and  Calculate (115_inital_erab_denom - 115_inital_erab_nom)
            nokia_df['RRC_Fail'] = nokia_df['96_RRC_setup_Success_ratio_denom'] - nokia_df[
                '96_RRC_setup_Success_ratio_nom']
            nokia_df['ERAB_Fail'] = nokia_df['115_Initial_ERAB_Setup_Success_Rate_denom'] - combine_df[
                '115_Initial_ERAB_Setup_Success_Rate_nom']
            nokia_df.rename(columns={'ERAB Drop Rate% (eNB + MME)_Nom_122': 'Drops'}, inplace=True)
            nokia_df = nokia_df[['Date_cellid', 'ERAB_Fail', 'RRC_Fail', 'Drops']]
            # nokia_df.to_csv(folder + r'\\test2.csv')
            merg_df = pd.merge(nokia_df, filtered_df, on='Date_cellid', how='inner')
            # merg_df.to_csv(folder + r'\\test3.csv')
            merg_df[['Date', 'EUtranCell_Id']] = merg_df['Date_cellid'].str.split(':', expand=True)
            merg_pvt = merg_df.pivot_table(index='EUtranCell_Id', columns='Date',
                                           values=['ERAB_Fail', 'RRC_Fail', 'Drops', 'Avg RSSI for PUCCH'], aggfunc='sum')
            merg_psh = merg_df.pivot_table(index='EUtranCell_Id', columns='Date',
                                           values=['ERAB_Fail', 'RRC_Fail', 'Drops',
                                                   'Avg RSSI for PUSCH'], aggfunc='sum')
            # Add a new column 'Count_Last7' with the count of values greater than -100 in the last 7 columns starting from row 3
            # merg_pvt['Count_Last7'] = (merg_pvt.iloc[:, -7:] > -100).sum(axis=1)
            # merg_pvt = merg_pvt[~merg_pvt['Count_Last7'].isin([0, 1, 2, 3])]
            # merg_pvt.drop(columns='Count_Last7', inplace=True)
            column_names_last_7 = ['Avg RSSI for PUCCH']
            # Create a boolean DataFrame where True corresponds to values > -100
            greater_than_minus_100 = merg_pvt[column_names_last_7] > -100
            # Sum along the columns to get the count of values greater than -100 for each row
            merg_pvt['Count_Last7'] = greater_than_minus_100.sum(axis=1)
            merg_pvt = merg_pvt[~merg_pvt['Count_Last7'].isin([0, 1, 2, 3])]
            merg_pvt.drop(columns='Count_Last7', inplace=True)
            # merg_pvt.to_csv(folder + r"\\RSSI_PUCCH.csv")
            column_names_last_7 = ['Avg RSSI for PUSCH']
            # Create a boolean DataFrame where True corresponds to values > -100
            greater_than_minus_100 = merg_psh[column_names_last_7] > -100
            # Sum along the columns to get the count of values greater than -100 for each row
            merg_psh['Count_Last7'] = greater_than_minus_100.sum(axis=1)
            merg_psh = merg_psh[~merg_psh['Count_Last7'].isin([0, 1, 2, 3])]
            merg_psh.drop(columns='Count_Last7', inplace=True)
            # merg_psh.to_csv(folder + r"\\RSSI_PUSCH.csv")
            with pd.ExcelWriter(processDir + r"/RSSI_Nokia.xlsx", engine='xlsxwriter') as writer:
                # Write each DataFrame to a different sheet
                merg_pvt.to_excel(writer, sheet_name='PUCCH')
                merg_psh.to_excel(writer, sheet_name='PUSCH')














if __name__ == '__main__':
    # Ignore all warnings
    warnings.filterwarnings("ignore")
    inpt1 = 'lte_mapa_kpis_report'
    files_folder = sys.argv[1]
    print(files_folder)
    files = os.listdir(files_folder)
    print(files)
    processDir = sys.argv[2]
    print(processDir)
    # Filter files containing the identifier
    filtered_files = [file for file in files if inpt1 in file]
    print(filtered_files)
    # Read the filtered files into a DataFrame
    combined_df = pd.DataFrame()
    for file_name in filtered_files:
        df = pd.read_csv(files_folder +'/' + file_name)
        combined_df = pd.concat([combined_df, df], ignore_index=True, sort=False)
    # Save the combined DataFrame to a new Excel file
    # combined_df.to_csv(files_folder+"combined_file.csv", index=False)
    tracker(files, files_folder, combined_df)
    # Reset warnings to default behavior
    warnings.resetwarnings()




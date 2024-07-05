import sys
import pandas as pd
import os

def process_excel(file_path):
    
    # Read the Excel file
    df = pd.read_excel(file_path)
    print("hi")
    # Ensure the DataFrame has at least three rows
    while len(df) < 2:
        #df = pd.concat([df, pd.Series(name=len(df))], ignore_index=True)
        # Modify the second cell of the first column to 2
        #df.iloc[1, 0] = 2
        df.loc[len(df)] = len(df)+4
        # Modify the third cell of the first column to 3
        #df.iloc[2, 0] = 3
        #df.loc[2] = 3
        
    # Save the modified DataFrame to a new Excel file
    os.makedirs('processed', exist_ok=True)
    original_filename = os.path.splitext(os.path.basename(file_path))[0]
    result_file_path = f'processed/{original_filename}_processed'
    result_file_path = result_file_path if result_file_path.endswith('.xlsx') else result_file_path + '.xlsx'
    print(result_file_path)
    df.to_excel(result_file_path, index=False)
    print(f"Processed file saved as {result_file_path}")

if __name__ == "__main__":
    file_path = sys.argv[1]
    process_excel(file_path)
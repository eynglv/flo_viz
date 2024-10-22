import json
import pandas as pd
import csv
import math

# Scripts to download or generate data
filename = "/Users/elvyyang/Documents/flo_viz/olmsted_star/data/external/cartodb-query.csv"

def main():
    pd.options.display.max_rows = 10
    carto_data = pd.read_csv(filename)
    data = pd.DataFrame(carto_data)
    print(data)
    data = data.drop(columns=['cartodb_id', 'frla_plans', 'icon', 'archival_records', 'images'])   
    # filter by nan date_range
    project_types = pd.Series(data['project_type'])
    
    

if __name__ == "__main__":
    main()
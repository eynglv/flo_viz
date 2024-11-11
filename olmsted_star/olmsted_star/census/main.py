import requests
import csv
import re
import pandas as pd

from references import states
from ..config import OUTPUT_PROCESSED_FILENAME
from ..processors.format import Data_Processor
from .reference import superfluous_osm_columns, census_racial_groups

# BASE TRACTS
# https://api.census.gov/data/2020/dec/dp?get=NAME&for=tract:*&in=state:36

# RACE
# https://api.census.gov/data/2020/dec/dhc?get=group(P3)&for=county:005&for=tract:021601&in=state:36

# INCOME BREAKDOWN (Need to add more get params)
# https://api.census.gov/data/2022/acs/acs5/profile?get=DP03_0051PE,DP03_0052E&for=county:005&for=tract:021601&in=state:36


HOST = "https://api.census.gov/data"

def main():
    data = read_csv_data()  
    processor = Data_Processor(data)
    state_num = processor.get_unique_columns('STATEFP')[0]
    processor.drop_columns(superfluous_osm_columns)
    iterate_census_tracts(processor.data ,state_num)
    
    
# API METHODS
def get_all_census_tracts_data(state):
    year = "2020"
    dataset = "dec/dp"
    base_url = "/".join([HOST, year, dataset])
    
    predicates = {}

    state_num = states.state_names[state]
    get_vars = ["GEO_ID"]
    predicates["get"] = ",".join(get_vars)
    predicates["for"] = "tract:*"
    predicates["in"] = f'state:{state_num}'
    try:
        r = requests.get(base_url, params=predicates)
        filepath = OUTPUT_PROCESSED_FILENAME + '/' + state + '/censusTract.csv'
        write_to_csv(filepath, r.json())
    except Exception as e:
        print(e)

def get_census_tract_details(county_num, tract_num, state_num):
    year = "2020"
    dataset = "dec/dhc"
    base_url = "/".join([HOST, year, dataset])
    
    predicates = {}
    get_vars = ["group(P3)", "P4_003N"]
    predicates["get"] = ",".join(get_vars)
    predicates["for"] = f"tract:{tract_num}"
    predicates["in"] = f"state:{state_num} county:{county_num}"
    try:
        r = requests.get(base_url, params=predicates)
        data = r.json()
        return data if len(data) > 0 else None
    except Exception as e:
        print(e)

# DATA ANALYSIS METHODS
def iterate_census_tracts(data, state_num):
    for index, row in data.iterrows():
        tract_num = row['NAME_2']
        county_num = row['COUNTYFP']
        county_num = str(county_num).zfill(3)
        tract_num = format_tract_number(tract_num)
        result_data = get_census_tract_details(county_num, tract_num, state_num)      
        print('currently on... ', index)
        if result_data:
            for key, value in zip(result_data[0], result_data[1]):
                if key in census_racial_groups:
                    data.at[index, census_racial_groups[key]] = value
        else:
            print(f"No data for tract: {tract_num}, county: {county_num}")
    data_as_list = [data.columns.tolist()] + data.values.tolist()
    write_to_csv('/Users/elvyyang/Documents/flo_viz/olmsted_star/data/processed/New York/800_race_data.csv', data_as_list)
    

def format_tract_number(tract):
    tract_str = str(tract)
    
    match = re.match(r"(\d+)(?:\.(\d+))?", tract_str)
    
    if match:
        integer_part = match.group(1).zfill(4)  
        decimal_part = (match.group(2) or '0').ljust(2, '0')  
        
        return integer_part + decimal_part
    else:
        return None


# WRITE/READ METHODS    
def read_csv_data():
    pd.options.display.max_rows = 10
    census_tract_data = pd.read_csv('/Users/elvyyang/Documents/parks-qgis/nyc_census/800_census_tract_join.csv')
    data = pd.DataFrame(census_tract_data)
    return data
        
def write_to_csv(filepath, data):
    with open(filepath, mode="w", newline="") as file:
        writer = csv.writer(file)
        for row in data:
            writer.writerow(row)



if __name__ == "__main__":
    main()

import requests
import csv

from references import states
from config import OUTPUT_PROCESSED_FILENAME

# BASE TRACTS
# https://api.census.gov/data/2020/dec/dp?get=NAME&for=tract:*&in=state:36

# RACE
# https://api.census.gov/data/2020/dec/dhc?get=group(P3)&for=county:005&for=tract:021601&in=state:36

# INCOME BREAKDOWN (Need to add more get params)
# https://api.census.gov/data/2022/acs/acs5/profile?get=DP03_0051PE,DP03_0052E&for=county:005&for=tract:021601&in=state:36


HOST = "https://api.census.gov/data"
year = "2020"
dataset = "dec/dhc"
base_url = "/".join([HOST, year, dataset])

def main():
    get_all_census_tracts("New York")

    # predicates = {}

    # county_num = '005'
    # tract_num = '021601'
    # state_num = '36'

    # get_vars = ["group(P3)"]
    # predicates["get"] = ",".join(get_vars)
    # predicates["for"] = [f'county:{county_num}', f'tract:{tract_num}' ]
    # predicates["in"] = f'state:{state_num}'
    # # print(predicates)
    # try:
    #     r = requests.get(base_url, params=predicates)
    #     print(r.text)
    # except Exception as e:
    #     print(e)
        
def get_all_census_tracts(state):
    year = "2020"
    dataset = "dec/dp"
    base_url = "/".join([HOST, year, dataset])
    
    predicates = {}

    state_num = states.state_names[state]
    get_vars = ["NAME"]
    predicates["get"] = ",".join(get_vars)
    predicates["for"] = "tract:*"
    predicates["in"] = f'state:{state_num}'
    try:
        r = requests.get(base_url, params=predicates)
        filepath = OUTPUT_PROCESSED_FILENAME + '/' + state + '/censusTract.csv'
        write_to_csv(filepath, r.json())
    except Exception as e:
        print(e)
        
def write_to_csv(filepath, data):
    with open(filepath, mode="w", newline="") as file:
        writer = csv.writer(file)
        for row in data:
            writer.writerow(row)



if __name__ == "__main__":
    main()

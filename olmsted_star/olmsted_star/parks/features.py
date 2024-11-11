import overpy
import os
import json
import sys
import pandas as pd
import re

from config import CATEGORIES, OUTPUT_PROCESSED_FILENAME

def main(state, project_type):
    data = read_data(state, project_type)
    # query = form_other_query(data, state)
    query = form_query(data)
    fetch_overpy(query)
    # print(query)
    

def fetch_overpy(query):
    api = overpy.Overpass()
    try:
        result = api.query(query)
        print(len(result.ways))
        return result
    except Exception as e:
        print("An error occurred:", e)


def form_query(data):
    aggregator = ''
    for park in data:
        long_lat = str(park["long_lat"])
        if long_lat is None:
            continue
        base_string = f'way(around:300,{long_lat})["leisure"="park"]["name"="{park["job_name"]}"];'
        aggregator+=base_string
        
    base_query = """[out:json];
({add_query}
)->.a;

(.a;.a >;)->.a;
.a out;

(._;>;);
out body;
(._;>;);
out skel qt;"""
    full_query = base_query.format(add_query=aggregator)
    return full_query

def form_other_query(data, state):
    df = pd.DataFrame(data)
    cities = pd.Series(df['city_county'])
    unique_cities = cities.unique()
    city_query_portion = get_city_aggregator(unique_cities, state)
    aggregator = ''
    for park in data:
        city = park["city_county"]
        name = park["job_name"]
        if city is None or name is None:
            continue
        formatted_city = to_snake_case(city)
        base_string = f'way["leisure"="park"]["name"="{name}"](area.{formatted_city});\nrelation["leisure"="park"]["name"="{name}"](area.{formatted_city});\n'
        aggregator += base_string
  
    base_query = """[out:json];
    {add_city_query}
(
  {add_query}
);
(._;>;);
out body;"""
    full_query = base_query.format(add_city_query=city_query_portion, add_query=aggregator)
    return full_query

def get_city_aggregator(cities, state):
    aggregator = ''
    for city in cities:
        if city is None:
            continue
        formatted_city = to_snake_case(city)
        base_string = f'area["name"="{city}"][admin_level=8]["is_in:state"="{state}"]->.{formatted_city};\n'
        aggregator+=base_string
    return aggregator
    
def to_snake_case(s):
    s = s.lower()
    s = re.sub(r"[ /]+", "_", s)
    s = s.strip("_")
    return s

def read_data(state, project_type):
    file_name = f'{CATEGORIES[project_type]}.json'
    dir_path = os.path.join(OUTPUT_PROCESSED_FILENAME, state, file_name)
    with open(dir_path, 'r') as file:
        try:
            data = json.load(file)
        except json.JSONDecodeError:
            print("bleh")
    return data

if __name__ == "__main__":
    _, state, project = sys.argv
    main(state=state, project_type=project)

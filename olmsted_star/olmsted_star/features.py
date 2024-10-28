import overpy
import os
import json
import sys

from config import CATEGORIES, OUTPUT_PROCESSED_FILENAME

def main(state, project_type):
    data = read_data(state, project_type)
    query = form_query(data)
    print(query)


def fetch_overpy(query):
    api = overpy.Overpass()
    try:
        result = api.query(query)
        return result
    except Exception as e:
        print("An error occurred:", e)


def form_query(data):
    aggregator = ''
    for park in data:
        if long_lat is None:
            continue
        long_lat = str(park["long_lat"])
        base_string = f'way(around:300,{long_lat})["leisure"="park"];'
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

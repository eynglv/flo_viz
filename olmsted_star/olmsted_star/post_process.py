from config import FILENAME, OUTPUT_INTERIM_FILENAME, CATEGORIES, OUTPUT_PROCESSED_FILENAME
import os
import pandas as pd
import sys
from processors.format import Data_Processor
import json
from main import create_state_subdirectory



def main(state, project_type):
    file_path = f'{CATEGORIES[project_type]}.json'
    dir_path = os.path.join(OUTPUT_INTERIM_FILENAME, state, file_path)
    with open(dir_path, 'r') as file:
        try:
            data = json.load(file)
        except json.JSONDecodeError:
            print("bleh")
    data = pd.DataFrame(data)
    scraped_processor = Data_Processor(data)
    scraped_processor.drop_columns(['Type 1', 'Includes Correspondence at Library of Congress?', 'Number of Plans Available'])
    scraped_processor.rename_columns({'Job Number': 'job_number', 'Job Name': 'job_name',
                                   'Alt Names': 'alt_names', 'City-County': 'city_county',
                                   'St-Prov': 'st_prov', 'Alt Loc-H': 'alt_loc_h', 'Correspondence Dates': 'correspondence_dates'})
    scraped_processor.remove_leading_zeros()

    carto_data = pd.read_csv(FILENAME)
    data = pd.DataFrame(carto_data)
    processor = Data_Processor(data)
    processor.drop_columns(['cartodb_id', 'frla_plans', 'icon', 'archival_records', 'images'])
    processor.filter_by('project_type',  project_type)
    processor.filter_by('st_prov', state)
    merged = pd.merge(processor.data, scraped_processor.data, on=["job_number", "job_name", "st_prov", "city_county"] , how="outer")
    
    final = pd.DataFrame(merged)
    final_processor = Data_Processor(final)
    final_data = final_processor.filter_excess_date_range()
    
    write_path = create_state_subdirectory(OUTPUT_PROCESSED_FILENAME, state)
    file_name = f'{CATEGORIES[project_type]}.json'
    file_path = os.path.join(write_path, file_name)
    final_data.to_json(file_path, orient="records", indent=4)

    
if __name__ == "__main__":
    _, state, project = sys.argv
    main(state=state, project_type=project)
     

import pandas as pd
from processors.format import Data_Processor
from processors.scraper import Scraper
import sys
import json
import os
from config import FILENAME, BASE_URL, OUTPUT_INTERIM_FILENAME, CATEGORIES

def main(state, project_type):
    dir_path = create_state_subdirectory(OUTPUT_INTERIM_FILENAME, state)
    file_name = f'{CATEGORIES[project_type]}.json'

    # load csv data
    data = read_csv_data()
    
    # pass csv data to be processed
    processor = Data_Processor(data)
    processor.drop_columns(['cartodb_id', 'frla_plans', 'icon', 'archival_records', 'images'])
    processor.filter_by('project_type',  project_type)
    processor.filter_by('st_prov', state)
    nan_dates = processor.get_nan_date_range(processor.get_data())
    nan_job_nums = processor.get_job_numbers(nan_dates)

    # scrape!
    scraper = Scraper(BASE_URL)
    for job_num in nan_job_nums:
        job_num = processor.zfill_job_num(job_num)
        results = main_scrape(scraper=scraper, job_num=job_num)
        file_path = os.path.join(dir_path, file_name)
        write_to_json_file(results, file_path)
        print('Writing...', job_num)
    scraper.browser.close()

def read_csv_data():
    pd.options.display.max_rows = 10
    carto_data = pd.read_csv(FILENAME)
    data = pd.DataFrame(carto_data)
    return data
        
       
def main_scrape(scraper, job_num):   
    scraper.open_browser()
    scraper.submit_form(job_num)
    results = scraper.parse_result()
    return results

def create_state_subdirectory(base_directory, directory_name):
    dir_path = os.path.join(base_directory, directory_name)
    # make a directory of state name if not exist
    os.makedirs(dir_path, exist_ok=True)
    return dir_path
    

def write_to_json_file(data, filename):
    if os.path.exists(filename):
        with open(filename, 'r') as file:
            try:
                existing_data = json.load(file)
            except json.JSONDecodeError:
                existing_data = []  
    else:
        existing_data = []
    if len(data):
        existing_data.append(data)

    with open(filename, 'w') as file:
        json.dump(existing_data, file, indent=4)


if __name__ == "__main__":
    _, state, project = sys.argv
    main(state=state, project_type=project)

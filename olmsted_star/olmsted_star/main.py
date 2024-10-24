import pandas as pd
from processors.format import Data_Processor
from processors.scraper import Scraper
import sys
import json
import os
from config import FILENAME, BASE_URL, OUTPUT_BASE_FILENAME, CATEGORIES

def main(state, project_type):
    dir_path = os.path.join(OUTPUT_BASE_FILENAME, state)
    # make a directory of state name if not exist
    os.makedirs(dir_path, exist_ok=True)
    file_path = f'{CATEGORIES[project_type]}.json'

    # load csv data
    pd.options.display.max_rows = 10
    carto_data = pd.read_csv(FILENAME)
    data = pd.DataFrame(carto_data)
    
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
        job_num = modify_job_num(job_num)
        results = main_scrape(scraper=scraper, job_num=job_num)
        file_path = os.path.join(dir_path, file_path)
        write_to_json_file(results, file_path)
        print('Writing...', job_num)
        
       
def main_scrape(scraper, job_num):   
    scraper.open_browser()
    scraper.submit_form(job_num)
    results = scraper.parse_result()
    return results
    
def modify_job_num(job_num):
    return job_num.zfill(5)

def write_to_json_file(data, filename):
    if os.path.exists(filename):
        with open(filename, 'r') as file:
            try:
                existing_data = json.load(file)
            except json.JSONDecodeError:
                existing_data = []  
    else:
        existing_data = []

    existing_data.append(data)

    with open(filename, 'w') as file:
        json.dump(existing_data, file, indent=4)

if __name__ == "__main__":
    _, state, project = sys.argv
    main(state=state, project_type=project)

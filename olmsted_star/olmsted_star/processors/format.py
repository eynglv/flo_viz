import pandas as pd
import re

class Data_Processor:
    def __init__(self, external_data):
        self.data = external_data
        self.cut_off_date = 1895
        
    def get_data(self):
        return self.data
        
    def drop_columns(self, columns):
        self.data = self.data.drop(columns=columns)
    
    def rename_columns(self, name_map):
        self.data = self.data.rename(columns=name_map)
        
    def filter_by(self, column_name, column_value):
        """
        filters rows by column_name & column_value

        Args:
            column_name (_type_): string
            column_value (_type_): string

        Returns:
            _type_: filtered data
        """
        self.data = self.data[self.data[column_name] == column_value]
    
    def get_nan_date_range(self, data):
        nan_dates = data[data['date_range'].isna()]
        return nan_dates
    
    def get_job_numbers(self,data):
        return pd.Series(data['job_number'])
    
    def filter_excess_date_range(self):
        return self.data[self.data.apply(
    lambda row: (year := get_start_year(row["date_range"]) or get_start_year(row["correspondence_dates"])) is not None and year < self.cut_off_date,
    axis=1
)]
    
    def zfill_job_num(self, job_num):
        return job_num.zfill(5)

    def remove_leading_zeros(self):
        self.data['job_number'] = self.data['job_number'].apply(lambda x: str(int(x)))
    
def get_start_year(date_range):
    if isinstance(date_range, str):
        if date_range == "N.D":
            return None
        parts = re.split(r'[-;, ]+', date_range)
        for part in parts:
            if part.isdigit(): 
                return int(part)  
    return None 
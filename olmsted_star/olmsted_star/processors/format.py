import pandas as pd

class Data_Processor:
    def __init__(self, external_data):
        self.data = external_data
        self.cut_off_date = '1895'
        
    def get_data(self):
        return self.data
        
    def drop_columns(self, columns):
        self.data = self.data.drop(columns=columns)
        
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
    
    def filter_excess_date_range(self, data):
        # TODO: filter rows with excess date_range values (after 1895)    
        self.data = self.data.sort_values(by=['date_range'])

    
        
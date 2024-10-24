import mechanicalsoup
import re

class Scraper:
    def __init__(self, baseUrl):
        self.browser = mechanicalsoup.StatefulBrowser()
        self.baseUrl = baseUrl

    def open_browser(self):
        self.browser.open(self.baseUrl)
    
    def submit_form(self, job_number):
        # is this legal
        self.browser.select_form('form[action="default.asp?IDCFile=/olmsted/genb.idc"]')
        self.browser["FIELD1"] = job_number
        # add error handling
        try:
            response = self.browser.submit_selected()
        except:
            print(job_number + 'not founded')
    
    def parse_result(self):
        curr_page = self.browser.page
        parent_table = curr_page.select_one("table")
        rows = parent_table.select('tr')
        project_info = {} 
        for row in rows:
            if row.find('i') is None:
                continue
            label = row.find('i').get_text(strip=True)
            label = re.sub(r':$', '', label)
            value = row.find('b').get_text(strip=True)
            project_info[label] = value
        return project_info
    
    def return_home(self):
        self.browser.follow_link(self.browser.select_one(""))
        


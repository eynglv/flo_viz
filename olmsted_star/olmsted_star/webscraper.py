import mechanicalsoup
from selenium import webdriver


BASE_URL = "http://ww3.rediscov.com/Olmsted/default.asp?include=master.htm"

class Scraper:
    def __init__(self, baseUrl):
        self.browser = mechanicalsoup.StatefulBrowser()
        self.baseUrl = baseUrl
        
    def get_browser(self):
        return self.browser 

    def load_browser(self):
        browser = self.get_browser()
        browser.open(self.baseUrl)
    
    def submitForm(self, job_number):
        browser = self.get_browser()
        # is this legal
        browser.select_form('form[action="default.asp?IDCFile=/olmsted/genb.idc"]')
        browser["FIELD1"] = job_number
        # add error handling
        response = browser.submit_selected()
        self.parse_result(response.text)
    
    def parse_result(self, response):
        curr_page = self.browser.page
        parent_table = curr_page.select_one("table")
        rows = parent_table.select('tr')
        for row in rows:
            if row.find('i') is None:
                continue
            label = row.find('i').get_text(strip=True)
            value = row.find('b').get_text(strip=True)
            print(label,value)
        

scraper = Scraper(BASE_URL)
scraper.load_browser()
scraper.submitForm("00516")

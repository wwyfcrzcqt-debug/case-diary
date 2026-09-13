import pdfplumber
import json
import os
import re
from datetime import datetime, timedelta, timezone
from playwright.sync_api import sync_playwright

CHAMBER_ADVOCATES = ["GAURAV MOHUNTA", "AKSHAY BHAN", "ASHISH KAPOOR"]
TARGET_PDF = "daily_causelist.pdf"
ROSTER_MAP = {} 

def get_target_date():
    ist = timezone(timedelta(hours=5, minutes=30))
    now = datetime.now(ist)
    
    if now.weekday() == 4:
        days_to_add = 3
    elif now.weekday() == 5:
        days_to_add = 2
    else:
        days_to_add = 1
        
    return now + timedelta(days=days_to_add)

def fetch_docket_and_roster():
    print("Initializing browser automation...")
    
    if os.path.exists(TARGET_PDF):
        os.remove(TARGET_PDF)
        
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True) 
        # Spoof a real Windows machine to bypass basic anti-bot filters
        context = browser.new_context(
            accept_downloads=True,
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        )
        page = context.new_page()
        
        try:
            print("Scraping live roster mapping...")
            # wait_until="domcontentloaded" forces it to stop waiting for broken background images
            page.goto("https://highcourtchd.gov.in/?mod=chief", wait_until="domcontentloaded", timeout=60000)
            
            rows = page.locator("tr").all()
            for row in rows:
                tds = row.locator("td").all()
                if len(tds) >= 3:
                    judge_text = tds[1].inner_text().strip().upper()
                    cr_text = tds[2].inner_text().strip()
                    
                    cr_match = re.search(r'(\d+)', cr_text)
                    if cr_match:
                        cr_num = cr_match.group(1)
                        ROSTER_MAP[cr_num] = judge_text

            print("Fetching target docket...")
            page.goto("https://highcourtchd.gov.in/?mod=causelist", wait_until="domcontentloaded", timeout=60000) 
            
            target_date_str = get_target_date().strftime('%d/%m/%Y')
            print(f"Targeting exact date: {target_date_str}")
            
            page.locator("input[type='text']").first.fill(target_date_str)
            page.locator("select").first.select_option(label="Complete List")
            page.get_by_role("button", name="View CL").click()
            page.wait_for_timeout(2000)
            
            print("Intercepting PDF download...")
            with page.expect_download(timeout=15000) as download_info:
                page.locator(f"a:has-text('{target_date_str}')").first.click()
            download_info.value.save_as(TARGET_PDF)
            
        except Exception as e:
            print(f"CRITICAL ERROR - Automation failed to find target date: {e}")
            raise e 
        finally:
            browser.close()

def parse_and_filter_docket():
    if not os.path.exists(TARGET_PDF):
        return

    extracted_matters = []
    current_court_num = ""
    current_vc_link = ""
    active_item = ""
    active_case = ""
    active_advocates_found = set()
    
    court_pattern = re.compile(r'(?:C\.?R\.?\s*NO\.?|COURT\s*NO\.?|COURT\s*ROOM\s*NO\.?)\s*(\d+)')
    vc_pattern = re.compile(r'(https?://[^\s]*(?:zoom|webex|meet|highcourt)[^\s]*)', re.IGNORECASE)
    item_start_pattern = re.compile(r'^\s*(\d+[\*]*)\s+')
    case_no_pattern = re.compile(r'([A-Za-z]+-\d+-\d{4})')

    with pdfplumber.open(TARGET_PDF) as pdf:
        for page in pdf.pages:
            text = page.extract_text(layout=True)
            if not text:
                continue
            
            for line in text.split('\n'):
                upper_line = line.upper()
                
                court_match = court_pattern.search(upper_line)
                if court_match:
                    current_court_num = court_match.group(1).strip()
                    
                vc_match = vc_pattern.search(line)
                if vc_match:
                    current_vc_link = vc_match.group(1).strip()
                    
                item_match = item_start_pattern.search(line)
                case_match = case_no_pattern.search(line)
                
                if item_match and case_match:
                    active_item = item_match.group(1).replace('*', '')
                    active_case = case_match.group(1)
                    active_advocates_found = set()
                    
                if active_case:
                    for adv in CHAMBER_ADVOCATES:
                        if adv not in active_advocates_found and re.search(r'\b' + re.escape(adv) + r'\b', upper_line):
                            active_advocates_found.add(adv)
                            
                            verified_judge = ROSTER_MAP.get(current_court_num, "Judge TBD (Awaiting Roster)")
                            court_display = f"CR NO {current_court_num}" if current_court_num else "Court Details Pending"
                            
                            extracted_matters.append({
                                "advocate_matched": adv.title(),
                                "item_no": active_item,
                                "case_no": active_case,
                                "judge": f"{court_display} - {verified_judge}",
                                "vc_link": current_vc_link,
                                "status": "Pending Assignment",
                                "date": get_target_date().strftime('%Y-%m-%d')
                            })
                                
    output_path = "app/dashboard/chamber_matters.json"
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, "w") as outfile:
        json.dump(extracted_matters, outfile, indent=4)

if __name__ == "__main__":
    fetch_docket_and_roster()
    parse_and_filter_docket()
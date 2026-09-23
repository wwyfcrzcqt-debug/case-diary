import pdfplumber
import json
import os
import re
import time
from datetime import datetime, timedelta, timezone
from playwright.sync_api import sync_playwright, TimeoutError as PlaywrightTimeoutError

CHAMBER_ADVOCATES = ["GAURAV MOHUNTA", "AKSHAY BHAN", "ASHISH KAPOOR"]
TARGET_PDF = "daily_causelist.pdf"
ROSTER_MAP = {} 

def get_target_date():
    ist = timezone(timedelta(hours=5, minutes=30))
    now = datetime.now(ist)
    
    # If it is before 7:30 PM (19:30), fetch TODAY's list
    if now.hour < 19 or (now.hour == 19 and now.minute < 30):
        return now
        
    # If it is 7:30 PM or later, calculate the NEXT working day
    if now.weekday() == 4:  # Friday evening targets Monday
        days_to_add = 3
    elif now.weekday() == 5:  # Saturday evening targets Monday
        days_to_add = 2
    else:
        days_to_add = 1
        
    return now + timedelta(days=days_to_add)

def fetch_docket_and_roster():
    print("Initializing browser automation...")
    
    if os.path.exists(TARGET_PDF):
        os.remove(TARGET_PDF)
        
    with sync_playwright() as p:
        # STEP 3: headless=False forces the browser to open visibly on your Mac screen
        browser = p.chromium.launch(headless=False) 
        
        # STEP 1: Aggressive User-Agent and Header spoofing to bypass bot detection
        context = browser.new_context(
            accept_downloads=True,
            user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            viewport={"width": 1920, "height": 1080},
            extra_http_headers={
                "Accept-Language": "en-US,en;q=0.9",
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8"
            }
        )
        page = context.new_page()
        
        try:
            print("Scraping live roster mapping...")
            
            # STEP 2: Retry loop for the Roster Page
            for attempt in range(3):
                try:
                    page.goto("https://highcourtchd.gov.in/?mod=chief", wait_until="domcontentloaded", timeout=45000)
                    break
                except PlaywrightTimeoutError:
                    print(f"Roster load timeout. Retrying {attempt + 1}/3...")
                    time.sleep(5)
            else:
                print("Skipping roster update due to persistent timeout.")

            rows = page.locator("tr").all()
            for row in rows:
                tds = row.locator("td").all()
                if len(tds) >= 3:
                    judge_text = tds[1].inner_text().strip().upper()
                    cr_text = tds[2].inner_text().strip()
                    cr_match = re.search(r'(\d+)', cr_text)
                    if cr_match:
                        ROSTER_MAP[cr_match.group(1)] = judge_text

            print("Fetching target docket...")
            
            # STEP 2: Retry loop for the Cause List Page
            for attempt in range(3):
                try:
                    page.goto("https://highcourtchd.gov.in/?mod=causelist", wait_until="domcontentloaded", timeout=45000)
                    break
                except PlaywrightTimeoutError:
                    print(f"Cause list load timeout. Retrying {attempt + 1}/3...")
                    time.sleep(5)
            else:
                raise Exception("Failed to load High Court website after 3 attempts.")
            
            target_date_str = get_target_date().strftime('%d/%m/%Y')
            print(f"Targeting exact date: {target_date_str}")
            
           # Type the date, then immediately hit Escape to close the blocking calendar
            page.locator("input[type='text']").first.fill(target_date_str)
            page.keyboard.press("Escape")
            
            page.locator("select").first.select_option(label="Complete List")
            
            # Wait a brief moment for the calendar animation to disappear, then click
            page.wait_for_timeout(500) 
            page.get_by_role("button", name="View CL").click(force=True)
            
            # STEP 2: Explicitly wait for the link to exist in the DOM before attempting to click it
            locator_string = f"a:has-text('{target_date_str}')"
            try:
                print("Waiting for registry to return search results...")
                page.wait_for_selector(locator_string, state="visible", timeout=30000)
                
                print("Intercepting PDF download...")
                with page.expect_download(timeout=15000) as download_info:
                    page.locator(locator_string).first.click()
                download_info.value.save_as(TARGET_PDF)
                print("PDF successfully saved.")
                
            except PlaywrightTimeoutError:
                # Fallback: Take a picture of what the bot is actually seeing
                screenshot_path = "debug_timeout.png"
                page.screenshot(path=screenshot_path)
                print(f"\nCRITICAL ERROR: The date '{target_date_str}' did not appear on the screen.")
                print(f"Saved a screenshot of the browser to {screenshot_path}.")
                print("Check the image: If you see a CAPTCHA, you are blocked. If it says 'No Records Found', the registry hasn't published the docket yet.")
                raise Exception("Target date link not found.")
            
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
                    current_vc_link = vc_match.group(1).strip().rstrip('.,;)"\']')
                    
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
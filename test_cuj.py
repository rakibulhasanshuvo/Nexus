from playwright.sync_api import sync_playwright

def run_cuj(page):
    # Navigate to syllabus vault
    page.goto("http://localhost:3000/resources")
    page.wait_for_timeout(1000)

    # Select the first course
    page.locator('select').nth(1).select_option(index=1)
    page.wait_for_timeout(1000)

    # Click on the first unit to target it
    page.get_by_role("button", name="Target Unit").first.click()
    page.wait_for_timeout(1000)

    # Take screenshot at the key moment
    page.screenshot(path="/home/jules/verification/screenshots/verification.png")
    page.wait_for_timeout(1000)

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            record_video_dir="/home/jules/verification/videos"
        )
        page = context.new_page()
        try:
            run_cuj(page)
        finally:
            context.close()
            browser.close()

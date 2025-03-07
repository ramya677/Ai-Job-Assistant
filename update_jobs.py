import pandas as pd
import requests

CSV_FILE = "masterlist.csv"  
API_URL = "http://localhost:5000/api/jobs"  # Replace with a broader job API

INDIAN_CITIES = ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Kolkata", "Pune", "Ahmedabad", "Jaipur", "Lucknow"]  # Add more as needed

def fetch_jobs():
    try:
        response = requests.get(API_URL)
        response.raise_for_status()  
        jobs = response.json()

        # 🚀 Print jobs to debug
        print(f"Fetched {len(jobs)} jobs")
        return jobs  # 🚨 Remove location filter for testing
    except requests.RequestException as e:
        print(f"Error fetching jobs: {e}")
        return []


def update_csv():
    new_jobs = fetch_jobs()
    if not new_jobs:
        print("No new jobs found. Exiting.")
        return

    try:
        df_new = pd.DataFrame(new_jobs)
        
        # Load existing CSV if available
        try:
            df_old = pd.read_csv(CSV_FILE)
            df_combined = pd.concat([df_old, df_new]).drop_duplicates(subset=["title", "company", "location"], keep="last")
        except FileNotFoundError:
            df_combined = df_new  

        # Save updated data
        df_combined.to_csv(CSV_FILE, index=False)
        print(f"✅ CSV updated successfully! ({len(df_combined)} jobs)")
    except Exception as e:
        print(f"Error updating CSV: {e}")

if __name__ == "__main__":
    update_csv()

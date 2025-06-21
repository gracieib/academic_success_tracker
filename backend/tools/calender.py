import dateparser
from datetime import timedelta
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

mongo_uri = os.getenv("MONGO_URI")
client = MongoClient(mongo_uri)
students_collection = client["academicsuccessdb"]["students"]

def parse_time(text):
    parsed = dateparser.parse(text, settings={'TIMEZONE': 'Africa/Lagos', 'RETURN_AS_TIMEZONE_AWARE': True})
    return parsed.isoformat() if parsed else None

def add_google_event(email: str, summary: str, start: str, end: str = None) -> str:
    student = students_collection.find_one({"email": email})
    if not student or "google_credentials" not in student:
        return "Please connect your Google Calendar first by visiting /authorize."

    creds = Credentials.from_authorized_user_info(student["google_credentials"])
    service = build('calendar', 'v3', credentials=creds)

    start_time = parse_time(start)
    if not start_time:
        return "Could not parse the start time."

    if end:
        end_time = parse_time(end)
    else:
        # Add 1 hour if no end time provided
        start_dt = dateparser.parse(start)
        end_dt = start_dt + timedelta(hours=1)
        end_time = end_dt.isoformat()

    event = {
        'summary': summary,
        'start': {'dateTime': start_time, 'timeZone': 'Africa/Lagos'},
        'end': {'dateTime': end_time, 'timeZone': 'Africa/Lagos'}
    }

    created = service.events().insert(calendarId='primary', body=event).execute()
    return f"Event created: {created.get('htmlLink')}"

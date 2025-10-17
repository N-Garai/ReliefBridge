import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret')
    DEBUG = os.getenv('DEBUG', 'False').lower() == 'true'
    APPWRITE_ENDPOINT = os.getenv('APPWRITE_ENDPOINT', 'https://cloud.appwrite.io/v1')
    APPWRITE_PROJECT_ID = os.getenv('APPWRITE_PROJECT_ID')
    APPWRITE_API_KEY = os.getenv('APPWRITE_API_KEY')
    DATABASE_ID = os.getenv('DATABASE_ID', 'reliefbridge_db')
    SESSION_TYPE = 'filesystem'
    PERMANENT_SESSION_LIFETIME = 3600
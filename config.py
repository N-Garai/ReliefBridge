import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    # Flask Configuration
    SECRET_KEY = os.getenv('SECRET_KEY', 'your-secret-key-change-in-production')
    DEBUG = os.getenv('DEBUG', 'False') == 'True'

    # Appwrite Configuration
    APPWRITE_ENDPOINT = os.getenv('APPWRITE_ENDPOINT', 'https://cloud.appwrite.io/v1')
    APPWRITE_PROJECT_ID = os.getenv('APPWRITE_PROJECT_ID')
    APPWRITE_API_KEY = os.getenv('APPWRITE_API_KEY')

    # Database IDs
    DATABASE_ID = os.getenv('DATABASE_ID', 'reliefbridge_db')

    # Collection IDs
    USERS_COLLECTION_ID = 'users'
    REQUESTS_COLLECTION_ID = 'help_requests'
    RESOURCES_COLLECTION_ID = 'resources'
    VOLUNTEERS_COLLECTION_ID = 'volunteers'

    # Storage Bucket IDs
    DOCUMENTS_BUCKET_ID = 'documents'
    IMAGES_BUCKET_ID = 'images'
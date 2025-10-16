# utils/appwrite_client.py
"""
Appwrite Client Configuration
Professional disaster relief coordination using Appwrite Cloud
"""

import os
from appwrite.client import Client
from appwrite.services.account import Account
from appwrite.services.databases import Databases
from appwrite.services.storage import Storage
from appwrite.services.messaging import Messaging

# Initialize Appwrite Client
client = Client()
client.set_endpoint(os.getenv('APPWRITE_ENDPOINT', 'https://cloud.appwrite.io/v1'))
client.set_project(os.getenv('APPWRITE_PROJECT_ID'))
client.set_key(os.getenv('APPWRITE_API_KEY'))

# Initialize Services
account = Account(client)
databases = Databases(client)
storage = Storage(client)
messaging = Messaging(client)

def get_user_client(session_jwt=None):
    """
    Create a client for user-specific operations
    """
    user_client = Client()
    user_client.set_endpoint(os.getenv('APPWRITE_ENDPOINT', 'https://cloud.appwrite.io/v1'))
    user_client.set_project(os.getenv('APPWRITE_PROJECT_ID'))
    
    if session_jwt:
        user_client.set_jwt(session_jwt)
    
    return user_client

from appwrite.client import Client
from appwrite.services.account import Account
from appwrite.services.databases import Databases
from appwrite.services.storage import Storage
from appwrite.services.functions import Functions
from appwrite.services.messaging import Messaging
from config import Config

def get_appwrite_client():
    """Initialize and return Appwrite client"""
    client = Client()
    client.set_endpoint(Config.APPWRITE_ENDPOINT)
    client.set_project(Config.APPWRITE_PROJECT_ID)
    client.set_key(Config.APPWRITE_API_KEY)
    return client

def get_user_client(session_id):
    """Get client with user session"""
    client = Client()
    client.set_endpoint(Config.APPWRITE_ENDPOINT)
    client.set_project(Config.APPWRITE_PROJECT_ID)
    client.set_session(session_id)
    return client

# Initialize services
client = get_appwrite_client()
account = Account(client)
databases = Databases(client)
storage = Storage(client)
functions = Functions(client)
messaging = Messaging(client)
# setup_appwrite.py
"""Appwrite Database Setup - Run this ONCE before deploying"""

import os
from dotenv import load_dotenv
from appwrite.client import Client
from appwrite.services.databases import Databases
from appwrite.services.storage import Storage
from appwrite.exception import AppwriteException
from appwrite.permission import Permission
from appwrite.role import Role

load_dotenv()

client = Client()
client.set_endpoint(os.getenv('APPWRITE_ENDPOINT', 'https://cloud.appwrite.io/v1'))
client.set_project(os.getenv('APPWRITE_PROJECT_ID'))
client.set_key(os.getenv('APPWRITE_API_KEY'))

databases = Databases(client)
storage = Storage(client)
DATABASE_ID = 'reliefbridge_db'

def create_database():
    try:
        databases.create(database_id=DATABASE_ID, name='ReliefBridge Database')
        print("✅ Database created!")
    except AppwriteException as e:
        if 'already exists' in str(e):
            print("ℹ️  Database already exists.")
        else:
            print(f"❌ Error: {e}")

def create_users_collection():
    try:
        databases.create_collection(
            database_id=DATABASE_ID,
            collection_id='users',
            name='Users',
            permissions=[Permission.read(Role.any()), Permission.create(Role.users())]
        )
        print("✅ Users collection created!")
        
        # Add attributes
        attrs = [
            ('name', 'string', 255, True),
            ('email', 'string', 255, True),
            ('phone', 'string', 20, True),
            ('role', 'string', 50, True),
            ('location', 'string', 255, False),
            ('active', 'boolean', None, True),
            ('created_at', 'string', 50, True),
            ('last_seen', 'string', 50, False)
        ]
        
        for name, type_, size, required in attrs:
            try:
                if type_ == 'boolean':
                    databases.create_boolean_attribute(DATABASE_ID, 'users', name, required, default=True)
                else:
                    databases.create_string_attribute(DATABASE_ID, 'users', name, size, required)
                print(f"  ✅ {name}")
            except: pass
            
    except AppwriteException as e:
        if 'already exists' not in str(e):
            print(f"❌ Error: {e}")

def create_help_requests_collection():
    try:
        databases.create_collection(
            database_id=DATABASE_ID,
            collection_id='help_requests',
            name='Help Requests',
            permissions=[Permission.read(Role.any()), Permission.create(Role.users())]
        )
        print("✅ Help Requests collection created!")
        
        attrs = [
            ('user_id', 'string', 255, True),
            ('user_name', 'string', 255, True),
            ('request_type', 'string', 50, True),
            ('description', 'string', 1000, True),
            ('priority', 'string', 20, True),
            ('location', 'string', 500, True),
            ('latitude', 'float', None, True),
            ('longitude', 'float', None, True),
            ('contact_phone', 'string', 20, True),
            ('status', 'string', 50, True),
            ('volunteer_id', 'string', 255, False),
            ('volunteer_name', 'string', 255, False),
            ('created_at', 'string', 50, True),
            ('updated_at', 'string', 50, True),
            ('claimed_at', 'string', 50, False),
            ('completed_at', 'string', 50, False)
        ]
        
        for name, type_, size, required in attrs:
            try:
                if type_ == 'float':
                    databases.create_float_attribute(DATABASE_ID, 'help_requests', name, required, min=-180, max=180)
                else:
                    databases.create_string_attribute(DATABASE_ID, 'help_requests', name, size, required)
                print(f"  ✅ {name}")
            except: pass
            
    except AppwriteException as e:
        if 'already exists' not in str(e):
            print(f"❌ Error: {e}")

if __name__ == '__main__':
    print("\n🚀 ReliefBridge Appwrite Setup\n")
    create_database()
    create_users_collection()
    create_help_requests_collection()
    print("\n✅ Setup Complete! Run: python app.py\n")

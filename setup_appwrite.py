"""
Script to set up Appwrite collections and buckets
Run this after creating your Appwrite project
"""

from appwrite.client import Client
from appwrite.services.databases import Databases
from appwrite.services.storage import Storage
from appwrite.id import ID
from appwrite.permission import Permission
from appwrite.role import Role
from config import Config
import time

client = Client()
client.set_endpoint(Config.APPWRITE_ENDPOINT)
client.set_project(Config.APPWRITE_PROJECT_ID)
client.set_key(Config.APPWRITE_API_KEY)

databases = Databases(client)
storage = Storage(client)

def create_database():
    """Create main database"""
    try:
        db = databases.create(
            database_id=Config.DATABASE_ID,
            name='ReliefBridge Database'
        )
        print(f"✓ Database created: {db['$id']}")
        return db
    except Exception as e:
        print(f"Database might already exist: {e}")

def create_collections():
    """Create all required collections"""

    # Users Collection
    try:
        users_collection = databases.create_collection(
            database_id=Config.DATABASE_ID,
            collection_id=Config.USERS_COLLECTION_ID,
            name='Users'
        )
        print(f"✓ Users collection created")

        time.sleep(2)

        # Add attributes
        databases.create_string_attribute(Config.DATABASE_ID, Config.USERS_COLLECTION_ID, 'name', 255, required=True)
        databases.create_email_attribute(Config.DATABASE_ID, Config.USERS_COLLECTION_ID, 'email', required=True)
        databases.create_string_attribute(Config.DATABASE_ID, Config.USERS_COLLECTION_ID, 'role', 50, required=True)
        databases.create_string_attribute(Config.DATABASE_ID, Config.USERS_COLLECTION_ID, 'phone', 20, required=True)
        databases.create_string_attribute(Config.DATABASE_ID, Config.USERS_COLLECTION_ID, 'location', 500, required=False)
        databases.create_datetime_attribute(Config.DATABASE_ID, Config.USERS_COLLECTION_ID, 'created_at', required=True)
        databases.create_boolean_attribute(Config.DATABASE_ID, Config.USERS_COLLECTION_ID, 'active', required=True, default=True)

        print("✓ Users collection attributes added")

    except Exception as e:
        print(f"Users collection error: {e}")

    # Help Requests Collection
    try:
        requests_collection = databases.create_collection(
            database_id=Config.DATABASE_ID,
            collection_id=Config.REQUESTS_COLLECTION_ID,
            name='Help Requests'
        )
        print(f"✓ Requests collection created")

        time.sleep(2)

        # Add attributes
        databases.create_string_attribute(Config.DATABASE_ID, Config.REQUESTS_COLLECTION_ID, 'user_id', 255, required=True)
        databases.create_string_attribute(Config.DATABASE_ID, Config.REQUESTS_COLLECTION_ID, 'user_name', 255, required=True)
        databases.create_string_attribute(Config.DATABASE_ID, Config.REQUESTS_COLLECTION_ID, 'request_type', 100, required=True)
        databases.create_string_attribute(Config.DATABASE_ID, Config.REQUESTS_COLLECTION_ID, 'description', 5000, required=True)
        databases.create_string_attribute(Config.DATABASE_ID, Config.REQUESTS_COLLECTION_ID, 'priority', 20, required=True)
        databases.create_string_attribute(Config.DATABASE_ID, Config.REQUESTS_COLLECTION_ID, 'location', 500, required=True)
        databases.create_float_attribute(Config.DATABASE_ID, Config.REQUESTS_COLLECTION_ID, 'latitude', required=True)
        databases.create_float_attribute(Config.DATABASE_ID, Config.REQUESTS_COLLECTION_ID, 'longitude', required=True)
        databases.create_string_attribute(Config.DATABASE_ID, Config.REQUESTS_COLLECTION_ID, 'contact_phone', 20, required=True)
        databases.create_string_attribute(Config.DATABASE_ID, Config.REQUESTS_COLLECTION_ID, 'status', 50, required=True)
        databases.create_string_attribute(Config.DATABASE_ID, Config.REQUESTS_COLLECTION_ID, 'volunteer_id', 255, required=False)
        databases.create_string_attribute(Config.DATABASE_ID, Config.REQUESTS_COLLECTION_ID, 'volunteer_name', 255, required=False)
        databases.create_datetime_attribute(Config.DATABASE_ID, Config.REQUESTS_COLLECTION_ID, 'created_at', required=True)
        databases.create_datetime_attribute(Config.DATABASE_ID, Config.REQUESTS_COLLECTION_ID, 'updated_at', required=True)

        print("✓ Requests collection attributes added")

    except Exception as e:
        print(f"Requests collection error: {e}")

if __name__ == '__main__':
    print("Setting up Appwrite for ReliefBridge...")
    print("=" * 50)

    create_database()
    create_collections()

    print("=" * 50)
    print("✓ Setup complete!")
    print("\nNext steps:")
    print("1. Update your .env file with the database ID above")
    print("2. Run: pip install -r requirements.txt")
    print("3. Run: python app.py")
    print("4. Visit: http://localhost:5000")
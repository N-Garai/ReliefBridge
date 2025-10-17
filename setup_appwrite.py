import os
import time
from dotenv import load_dotenv
from appwrite.client import Client
from appwrite.services.databases import Databases
from appwrite.exception import AppwriteException

load_dotenv()

client = Client()
client.set_endpoint(os.getenv('APPWRITE_ENDPOINT', 'https://cloud.appwrite.io/v1'))
client.set_project(os.getenv('APPWRITE_PROJECT_ID'))
client.set_key(os.getenv('APPWRITE_API_KEY'))

databases = Databases(client)
DB = os.getenv('DATABASE_ID', 'reliefbridge_db')

print("\n🚀 ReliefBridge Database Setup\n")

# Create Database
try:
    databases.create(database_id=DB, name='ReliefBridge Database')
    print("✅ Database created")
    time.sleep(2)
except AppwriteException as e:
    if 'already exists' in str(e).lower() or 'document' in str(e).lower():
        print("ℹ️  Database already exists")
    else:
        print(f"❌ Database error: {e}")

# Create Users Collection
print("\n📦 Creating Users collection...")
try:
    databases.create_collection(
        database_id=DB,
        collection_id='users',
        name='Users'
    )
    print("✅ Users collection created")
    time.sleep(3)
except AppwriteException as e:
    if 'already exists' in str(e).lower():
        print("ℹ️  Users collection exists")
    else:
        print(f"❌ Error: {e}")

# Create String Attributes for Users
print("  Adding string attributes...")
user_string_attrs = [
    ('name', 255, True),
    ('email', 255, True),
    ('phone', 20, True),
    ('role', 50, True),
    ('location', 255, False),
    ('created_at', 50, True),
    ('last_seen', 50, False),
    ('password_hash', 255, True)
]

for attr_name, size, required in user_string_attrs:
    try:
        databases.create_string_attribute(
            database_id=DB,
            collection_id='users',
            key=attr_name,
            size=size,
            required=required
        )
        print(f"    ✅ {attr_name}")
        time.sleep(2)
    except AppwriteException as e:
        if 'already exists' in str(e).lower():
            print(f"    ℹ️  {attr_name} exists")
        else:
            print(f"    ❌ {attr_name}: {e}")

# Create Boolean Attribute for Users
print("  Adding boolean attribute...")
try:
    databases.create_boolean_attribute(
        database_id=DB,
        collection_id='users',
        key='active',
        required=True,
        default=True
    )
    print("    ✅ active")
    time.sleep(2)
except AppwriteException as e:
    if 'already exists' in str(e).lower():
        print("    ℹ️  active exists")
    else:
        print(f"    ❌ active: {e}")

# Create Help Requests Collection
print("\n📦 Creating Help Requests collection...")
try:
    databases.create_collection(
        database_id=DB,
        collection_id='help_requests',
        name='Help Requests'
    )
    print("✅ Help Requests collection created")
    time.sleep(3)
except AppwriteException as e:
    if 'already exists' in str(e).lower():
        print("ℹ️  Help Requests collection exists")
    else:
        print(f"❌ Error: {e}")

# Create String Attributes for Help Requests
print("  Adding string attributes...")
request_string_attrs = [
    ('user_id', 255, True),
    ('user_name', 255, True),
    ('request_type', 50, True),
    ('description', 1000, True),
    ('priority', 20, True),
    ('location', 500, True),
    ('contact_phone', 20, True),
    ('status', 50, True),
    ('volunteer_id', 255, False),
    ('volunteer_name', 255, False),
    ('created_at', 50, True),
    ('updated_at', 50, True),
    ('claimed_at', 50, False),
    ('completed_at', 50, False)
]

for attr_name, size, required in request_string_attrs:
    try:
        databases.create_string_attribute(
            database_id=DB,
            collection_id='help_requests',
            key=attr_name,
            size=size,
            required=required
        )
        print(f"    ✅ {attr_name}")
        time.sleep(2)
    except AppwriteException as e:
        if 'already exists' in str(e).lower():
            print(f"    ℹ️  {attr_name} exists")
        else:
            print(f"    ❌ {attr_name}: {e}")

# Create Float Attributes for Help Requests
print("  Adding float attributes...")
for coord in ['latitude', 'longitude']:
    try:
        databases.create_float_attribute(
            database_id=DB,
            collection_id='help_requests',
            key=coord,
            required=True
        )
        print(f"    ✅ {coord}")
        time.sleep(2)
    except AppwriteException as e:
        if 'already exists' in str(e).lower():
            print(f"    ℹ️  {coord} exists")
        else:
            print(f"    ❌ {coord}: {e}")

print("\n✅ Setup complete!")
print("\n💡 Tip: Check Appwrite Console to verify all attributes are 'Available'\n")

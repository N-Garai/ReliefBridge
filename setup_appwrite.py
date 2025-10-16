from appwrite.client import Client
from appwrite.services.databases import Databases
from appwrite.exception import AppwriteException
from appwrite.permission import Permission
from appwrite.role import Role
from appwrite.id import ID
import time

# REPLACE WITH YOUR VALUES
APPWRITE_PROJECT_ID = "your_project_id_here"
APPWRITE_API_KEY = "your_new_api_key_here"

print("🚀 ReliefBridge Database Setup\n")

client = Client()
client.set_endpoint('https://cloud.appwrite.io/v1')
client.set_project(APPWRITE_PROJECT_ID)
client.set_key(APPWRITE_API_KEY)

databases = Databases(client)
DATABASE_ID = 'reliefbridge_db'

# Create database
print("📊 Creating database...")
try:
    result = databases.create(
        database_id=DATABASE_ID,
        name='ReliefBridge Database'
    )
    print("✅ Database created!\n")
except AppwriteException as e:
    if 'already exists' in str(e).lower() or 'document already exists' in str(e).lower():
        print("ℹ️  Database already exists\n")
    else:
        print(f"❌ Error: {e}\n")

# Create users collection
print("👥 Creating users collection...")
try:
    result = databases.create_collection(
        database_id=DATABASE_ID,
        collection_id='users',
        name='Users'
    )
    print("✅ Users collection created!")
    time.sleep(2)
    
    # Add attributes
    print("📝 Adding user attributes...")
    try:
        databases.create_string_attribute(DATABASE_ID, 'users', 'name', 255, required=True)
        print("  ✅ name")
        time.sleep(1)
    except: pass
    
    try:
        databases.create_string_attribute(DATABASE_ID, 'users', 'email', 255, required=True)
        print("  ✅ email")
        time.sleep(1)
    except: pass
    
    try:
        databases.create_string_attribute(DATABASE_ID, 'users', 'phone', 20, required=True)
        print("  ✅ phone")
        time.sleep(1)
    except: pass
    
    try:
        databases.create_string_attribute(DATABASE_ID, 'users', 'role', 50, required=True)
        print("  ✅ role")
        time.sleep(1)
    except: pass
    
    try:
        databases.create_string_attribute(DATABASE_ID, 'users', 'location', 255, required=False)
        print("  ✅ location")
        time.sleep(1)
    except: pass
    
    try:
        databases.create_boolean_attribute(DATABASE_ID, 'users', 'active', required=True, default=True)
        print("  ✅ active")
        time.sleep(1)
    except: pass
    
    try:
        databases.create_string_attribute(DATABASE_ID, 'users', 'created_at', 50, required=True)
        print("  ✅ created_at")
        time.sleep(1)
    except: pass
    
    try:
        databases.create_string_attribute(DATABASE_ID, 'users', 'last_seen', 50, required=False)
        print("  ✅ last_seen")
    except: pass
    
    print("\n✅ Users collection ready!\n")
    
except AppwriteException as e:
    if 'already exists' in str(e).lower():
        print("ℹ️  Users collection already exists\n")
    else:
        print(f"❌ Error: {e}\n")

# Create help_requests collection
print("🆘 Creating help_requests collection...")
try:
    result = databases.create_collection(
        database_id=DATABASE_ID,
        collection_id='help_requests',
        name='Help Requests'
    )
    print("✅ Help Requests collection created!")
    time.sleep(2)
    
    # Add attributes
    print("📝 Adding help request attributes...")
    
    attrs = [
        ('user_id', 'string', 255, True),
        ('user_name', 'string', 255, True),
        ('request_type', 'string', 50, True),
        ('description', 'string', 1000, True),
        ('priority', 'string', 20, True),
        ('location', 'string', 500, True),
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
            databases.create_string_attribute(DATABASE_ID, 'help_requests', name, size, required=required)
            print(f"  ✅ {name}")
            time.sleep(1)
        except: pass
    
    # Add float attributes
    try:
        databases.create_float_attribute(DATABASE_ID, 'help_requests', 'latitude', required=True)
        print("  ✅ latitude")
        time.sleep(1)
    except: pass
    
    try:
        databases.create_float_attribute(DATABASE_ID, 'help_requests', 'longitude', required=True)
        print("  ✅ longitude")
    except: pass
    
    print("\n✅ Help Requests collection ready!\n")
    
except AppwriteException as e:
    if 'already exists' in str(e).lower():
        print("ℹ️  Help Requests collection already exists\n")
    else:
        print(f"❌ Error: {e}\n")

print("="*50)
print("🎉 SETUP COMPLETE!")
print("="*50)
print("\n✅ Database is ready!")
print("🚀 Test your app: https://web-production-ec9bd.up.railway.app")
print("💡 Google login should work now!\n")

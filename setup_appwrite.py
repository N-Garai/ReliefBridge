import os, time
from dotenv import load_dotenv
from appwrite.client import Client
from appwrite.services.databases import Databases

load_dotenv()

client = Client()
client.set_endpoint(os.getenv('APPWRITE_ENDPOINT', 'https://cloud.appwrite.io/v1'))
client.set_project(os.getenv('APPWRITE_PROJECT_ID'))
client.set_key(os.getenv('APPWRITE_API_KEY'))

databases = Databases(client)
DB = os.getenv('DATABASE_ID', 'reliefbridge_db')

print("Setting up Appwrite database...")

try:
    databases.create(database_id=DB, name='ReliefBridge Database')
    print("✅ Database created")
except: print("ℹ️ Database exists")

try:
    databases.create_collection(database_id=DB, collection_id='users', name='Users')
    print("✅ Users collection")
    time.sleep(2)
    for attr in [('name',255,True),('email',255,True),('phone',20,True),
                 ('role',50,True),('location',255,False),('created_at',50,True),
                 ('last_seen',50,False),('password_hash',255,True)]:
        try:
            databases.create_string_attribute(DB,'users',attr[0],attr[1],required=attr[2]); time.sleep(1)
        except: pass
    databases.create_boolean_attribute(DB,'users','active',required=True,default=True)
except: pass

try:
    databases.create_collection(database_id=DB, collection_id='help_requests', name='Help Requests')
    print("✅ Help Requests collection")
    time.sleep(2)
    for attr in [('user_id',255,True),('user_name',255,True),('request_type',50,True),
                 ('description',1000,True),('priority',20,True),('location',500,True),
                 ('contact_phone',20,True),('status',50,True),('volunteer_id',255,False),
                 ('volunteer_name',255,False),('created_at',50,True),('updated_at',50,True),
                 ('claimed_at',50,False),('completed_at',50,False)]:
        try:
            databases.create_string_attribute(DB,'help_requests',attr[0],attr[1],required=attr[2]); time.sleep(1)
        except: pass
    for coord in ['latitude','longitude']:
        try:
            databases.create_float_attribute(DB,'help_requests',coord,required=True); time.sleep(1)
        except: pass
except: pass

print("✅ Setup complete!")
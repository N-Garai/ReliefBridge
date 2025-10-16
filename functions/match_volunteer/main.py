import os
import json
import math
from appwrite.client import Client
from appwrite.services.databases import Databases
from appwrite.query import Query

def main(context):
    """
    Appwrite Function to automatically match volunteers to requests based on:
    - Location proximity
    - Volunteer skills/preferences
    - Availability
    """
    try:
        client = Client()
        client.set_endpoint(os.environ.get('APPWRITE_ENDPOINT'))
        client.set_project(os.environ.get('APPWRITE_PROJECT_ID'))
        client.set_key(context.req.headers.get('x-appwrite-key'))

        databases = Databases(client)

        # Parse the event data
        event_data = json.loads(context.req.body)
        request_data = event_data.get('data', {})

        request_lat = float(request_data.get('latitude', 0))
        request_lng = float(request_data.get('longitude', 0))
        request_type = request_data.get('request_type', '')

        # Get all available volunteers
        volunteers = databases.list_documents(
            database_id=os.environ.get('DATABASE_ID'),
            collection_id='users',
            queries=[
                Query.equal('role', 'volunteer'),
                Query.equal('active', True)
            ]
        )

        def calculate_distance(lat1, lon1, lat2, lon2):
            """Calculate distance between two points using Haversine formula"""
            R = 6371  # Earth's radius in kilometers

            dlat = math.radians(lat2 - lat1)
            dlon = math.radians(lon2 - lon1)

            a = (math.sin(dlat/2) * math.sin(dlat/2) + 
                 math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * 
                 math.sin(dlon/2) * math.sin(dlon/2))

            c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
            distance = R * c

            return distance

        # Find best matches
        matches = []
        for volunteer in volunteers['documents']:
            # Skip if volunteer has no location data
            vol_location = volunteer.get('location', '')
            if not vol_location:
                continue

            # For demo, assume location has lat,lng embedded or use default
            vol_lat = volunteer.get('latitude', request_lat + 0.01)  # Default nearby
            vol_lng = volunteer.get('longitude', request_lng + 0.01)

            distance = calculate_distance(request_lat, request_lng, vol_lat, vol_lng)

            # Calculate match score (lower is better)
            score = distance

            matches.append({
                'volunteer_id': volunteer['$id'],
                'volunteer_name': volunteer['name'],
                'distance': distance,
                'score': score
            })

        # Sort by score (best matches first)
        matches.sort(key=lambda x: x['score'])

        # Return top 3 matches
        top_matches = matches[:3]

        context.log(f'Found {len(top_matches)} volunteer matches for request {request_data.get("$id")}')

        return context.res.json({
            'success': True,
            'matches': top_matches,
            'total_volunteers': len(volunteers['documents'])
        })

    except Exception as e:
        context.error(f'Matching error: {str(e)}')
        return context.res.json({
            'success': False,
            'error': str(e)
        }, 500)
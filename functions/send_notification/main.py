import os
import json
from appwrite.client import Client
from appwrite.services.messaging import Messaging

def main(context):
    """
    Appwrite Function to send notifications when new requests are created
    Triggered by database events
    """
    try:
        client = Client()
        client.set_endpoint(os.environ.get('APPWRITE_ENDPOINT'))
        client.set_project(os.environ.get('APPWRITE_PROJECT_ID'))
        client.set_key(context.req.headers.get('x-appwrite-key'))

        messaging = Messaging(client)

        # Parse the event data
        event_data = json.loads(context.req.body)

        # Extract request information
        request_data = event_data.get('data', {})
        request_type = request_data.get('request_type', 'Unknown')
        location = request_data.get('location', 'Unknown location')
        priority = request_data.get('priority', 'medium')
        user_name = request_data.get('user_name', 'Someone')

        # Create notification message
        if priority == 'high':
            subject = '🚨 URGENT: New Help Request - ReliefBridge'
            message = f"URGENT REQUEST: {user_name} needs {request_type} assistance in {location}. Please respond immediately!"
        else:
            subject = f'📢 New {request_type.title()} Request - ReliefBridge'
            message = f"{user_name} needs {request_type} assistance in {location}. Priority: {priority.upper()}"

        # Send email notification to volunteers
        try:
            email_result = messaging.create_email(
                message_id='unique()',
                subject=subject,
                content=f"""
                <h2>New Help Request on ReliefBridge</h2>
                <p><strong>Type:</strong> {request_type}</p>
                <p><strong>Location:</strong> {location}</p>
                <p><strong>Priority:</strong> {priority.upper()}</p>
                <p><strong>Description:</strong> {request_data.get('description', 'No description provided')}</p>
                <p><strong>Contact:</strong> {request_data.get('contact_phone', 'Not provided')}</p>
                <br>
                <p>Please log in to ReliefBridge to claim this request if you can help.</p>
                <p><a href="https://reliefbridge.com/login">Login to ReliefBridge</a></p>
                """,
                topics=['volunteers']
            )
            context.log(f'Email notification sent: {email_result["$id"]}')
        except Exception as e:
            context.error(f'Failed to send email: {str(e)}')

        return context.res.json({
            'success': True,
            'message': 'Notifications sent successfully',
            'priority': priority,
            'type': request_type
        })

    except Exception as e:
        context.error(f'Function error: {str(e)}')
        return context.res.json({
            'success': False,
            'error': str(e)
        }, 500)
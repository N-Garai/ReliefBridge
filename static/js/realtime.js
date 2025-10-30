const client = new Appwrite.Client();
client.setEndpoint('https://cloud.appwrite.io/v1')
      .setProject('68f0dbb6003952b7e1c7');  // Your actual project ID

function subscribeToRequests() {
    const realtime = new Appwrite.Realtime(client);
    realtime.subscribe('databases.reliefbridge_db.collections.help_requests.documents', 
        response => {
            console.log('Update:', response);
            // Update the UI based on the response
            if (response.events.includes('databases.*.collections.*.documents.*')) {
                updateMap(response.payload);
            }
        }
    );
}

document.addEventListener('DOMContentLoaded', subscribeToRequests);
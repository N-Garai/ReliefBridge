# ReliefBridge - Disaster Relief Coordination System

A comprehensive real-time disaster relief coordination platform built with Python Flask and Appwrite Backend-as-a-Service.

## 🌟 Features

### ✅ Core Functionality
- **Multi-Role Authentication**: Victims, Volunteers, NGOs, Coordinators
- **OAuth Integration**: Google, GitHub login support
- **Real-Time Updates**: Live notifications via Appwrite Realtime API
- **Geolocation Tracking**: GPS coordinates for precise location tracking
- **Help Request Management**: Create, claim, and track assistance requests
- **Resource Management**: NGO resource inventory and distribution tracking
- **Interactive Maps**: Leaflet.js integration for geographical visualization
- **Role-Based Dashboards**: Customized interfaces for each user type

## 🚀 Quick Start

### Prerequisites
- Python 3.9 or higher
- Appwrite Cloud account (free at cloud.appwrite.io)
- Git

### 1. Setup Python Environment
```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Configure Appwrite
1. Create a new project at [cloud.appwrite.io](https://cloud.appwrite.io)
2. Note your Project ID from the project settings
3. Generate an API key with full permissions
4. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
5. Update `.env` with your Appwrite credentials:
   ```bash
   APPWRITE_PROJECT_ID=your_project_id_here
   APPWRITE_API_KEY=your_api_key_here
   SECRET_KEY=your-unique-secret-key
   ```

### 3. Initialize Database
```bash
python setup_appwrite.py
```

### 4. Run Application
```bash
python app.py
```

Visit http://localhost:5000 to see ReliefBridge in action!

## 📱 User Roles & Workflows

### 🆘 Victims
1. Register → Select "Disaster Victim" role
2. Create help requests with location and priority
3. Track request status and assigned volunteers
4. Communicate with volunteers via contact info

### 🙋‍♂️ Volunteers
1. Register → Select "Volunteer" role
2. Browse available help requests by location/type
3. Claim requests and update status
4. Mark requests as completed when help is provided

### 🏢 NGOs
1. Register → Select "NGO/Organization" role
2. Manage resource inventory (food, medical, shelter)
3. Coordinate with volunteers and other NGOs
4. Track resource distribution and impact

### 👩‍💼 Coordinators
1. Administrative oversight of all activities
2. System-wide statistics and reporting
3. User management and request monitoring
4. Emergency response coordination

## 🚀 Deployment Options

### Option 1: Heroku
```bash
# Install Heroku CLI and login
heroku create reliefbridge-app
heroku config:set APPWRITE_PROJECT_ID=your_id
heroku config:set APPWRITE_API_KEY=your_key
heroku config:set SECRET_KEY=your_secret
git push heroku main
```

### Option 2: Railway
1. Connect your GitHub repository to Railway
2. Add environment variables in Railway dashboard
3. Deploy automatically with every commit

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/reliefbridge/issues)
- **Email**: support@reliefbridge.org

---

**Built with ❤️ for disaster relief and community resilience**

*ReliefBridge connects communities in their darkest hours and helps coordinate relief efforts when every second counts.*
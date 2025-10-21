<div align="center">

# 🌉 ReliefBridge

### Emergency Relief Coordination Platform

*Connecting victims and volunteers during disasters through real-time technology*

[![Live Demo](https://img.shields.io/badge/demo-live-success)](https://web-production-ec9bd.up.railway.app/)
[![Built with Appwrite](https://img.shields.io/badge/Built%20with-Appwrite-f02e65?logo=appwrite)](https://appwrite.io)
[![Python](https://img.shields.io/badge/Python-3.11-blue?logo=python)](https://www.python.org/)
[![Flask](https://img.shields.io/badge/Flask-3.0-black?logo=flask)](https://flask.palletsprojects.com/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

[Live Demo](https://web-production-ec9bd.up.railway.app/) • [Report Bug](https://github.com/N-Garai/ReliefBridge/issues) • [Request Feature](https://github.com/N-Garai/ReliefBridge/issues)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Appwrite Integration](#-appwrite-integration)
- [Tech Stack](#-tech-stack)
- [Demo](#-demo)
- [Getting Started](#-getting-started)
- [Configuration](#-configuration)
- [Project Structure](#-project-structure)
- [Usage](#-usage)
- [Screenshots](#-screenshots)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
- [License](#-license)
- [Acknowledgments](#-acknowledgments)

---

## 🎯 Overview

**ReliefBridge** is a real-time disaster relief coordination platform that bridges the gap between victims in need and volunteers ready to help during emergencies and natural disasters. Built with **Appwrite** as the backend infrastructure, it provides instant communication, GPS-based location tracking, and efficient task management to save lives when every second counts.

### The Problem
During disasters, coordination between relief agencies, volunteers, and victims is often chaotic. Traditional communication methods fail, and there's no centralized system to track and prioritize emergency requests.

### Our Solution
ReliefBridge provides a streamlined platform where:
- 🆘 **Victims** can instantly submit georeferenced emergency requests
- 🤝 **Volunteers** can discover and claim nearby tasks in real-time
- 📍 **Everyone** can visualize all active requests on an interactive live map
- ⚡ **Real-time updates** ensure information stays current without page refreshes

---

## ✨ Key Features

### 🔐 **Role-Based Authentication**
- Secure user registration and login system
- Three user roles: Victims, Volunteers, and Administrators
- Session management with Flask and Appwrite Database
- Password-protected accounts

### 🆘 **Emergency Request System**
- Create help requests with detailed information:
  - Request type (Medical, Food, Shelter, Rescue, Supplies)
  - Priority levels (Low, Medium, High, Critical)
  - Precise GPS coordinates with map-based picker
  - Contact information and detailed descriptions
- Request validation with coordinate boundary checks
- Status tracking (Pending → Claimed → Completed)

### 🗺️ **Interactive Live Map**
- Real-time visualization of all emergency requests
- Color-coded markers by priority level:
  - 🔴 Critical (Red)
  - 🟠 High (Orange)
  - 🟡 Medium (Yellow)
  - 🟢 Low (Green)
- Click markers for detailed request information
- Powered by Leaflet.js and OpenStreetMap

### 🚀 **Real-Time Updates**
- Appwrite Realtime subscriptions for instant updates
- No page refresh needed - see changes as they happen
- Live status updates across all connected clients
- Efficient WebSocket connections

### 📍 **GPS Navigation**
- Geolocation integration for volunteers
- Turn-by-turn navigation to victim locations
- Distance and route calculation
- Mobile-responsive map interface

### 📊 **Smart Dashboard**
- **Victim Dashboard**: View and track your submitted requests
- **Volunteer Dashboard**: Browse pending requests, claim tasks, navigate to locations
- **Admin Dashboard**: Overview of all requests with filtering and management tools
- Real-time statistics and status indicators

### 🎨 **Accessible Design**
- High-contrast UI for better visibility in stressful situations
- Bootstrap 5 responsive design
- Mobile-first approach for field use
- Intuitive user experience

---

## 🔥 Appwrite Integration

ReliefBridge leverages **Appwrite** as its complete backend infrastructure, showcasing the power and flexibility of Appwrite's BaaS (Backend as a Service) platform.

### Appwrite Services Used

#### 📚 **Database**
- **Collections**:
  - `users` - User profiles with roles, contact information, and authentication data
  - `help_requests` - Emergency requests with geolocation, status, and metadata
- **Features Used**:
  - Document creation, retrieval, and updates
  - Advanced queries with `Query.equal()` for filtering
  - Unique document IDs with `ID.unique()`
  - Structured data storage with validation

#### ⚡ **Realtime**
- WebSocket-based real-time subscriptions
- Live updates for help requests collection
- Instant synchronization across all connected clients
- Event-driven architecture for status changes

#### 🔑 **Authentication & Security**
- Secure API key authentication
- Project-based access control
- Environment variable configuration for security
- Session management integration with Flask

### Why Appwrite?

1. **🚀 Rapid Development**: Appwrite's SDKs and pre-built services allowed rapid prototype-to-production
2. **📈 Scalability**: Built-in scaling for handling disaster scenarios with sudden traffic spikes
3. **🔒 Security**: Enterprise-grade security out of the box
4. **🌍 Open Source**: Full control and transparency with self-hosting options
5. **📱 Real-time**: Native realtime capabilities for live coordination
6. **🛠️ Developer Experience**: Excellent documentation and Python SDK support

---

## 🛠️ Tech Stack

### Backend
- **Python 3.11** - Core programming language
- **Flask 3.0** - Lightweight web framework
- **Appwrite 13.4.1** - Backend as a Service (Database, Auth, Realtime)
- **Gunicorn** - Production WSGI server

### Frontend
- **HTML5/CSS3** - Modern web standards
- **Bootstrap 5** - Responsive UI framework
- **JavaScript (ES6+)** - Interactive features
- **Leaflet.js** - Interactive maps
- **Appwrite Web SDK** - Real-time client

### Additional Libraries
- **python-dotenv** - Environment configuration
- **geopy** - Geocoding and distance calculations
- **requests** - HTTP client

### Deployment
- **Railway** - Cloud hosting platform
- **PostgreSQL** - Production database (via Appwrite Cloud)

---

## 🌐 Demo

🔗 **Live Application**: [https://web-production-ec9bd.up.railway.app/](https://web-production-ec9bd.up.railway.app/)

### Test Accounts
Feel free to explore the platform with these test credentials:

**Victim Account:**
- Email: `victim@test.com`
- Password: `test123`

**Volunteer Account:**
- Email: `volunteer@test.com`
- Password: `test123`

---

## 🚀 Getting Started

### Prerequisites

- Python 3.11 or higher
- pip (Python package manager)
- An [Appwrite](https://appwrite.io) account (Cloud or Self-hosted)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/N-Garai/ReliefBridge.git
   cd ReliefBridge
   ```

2. **Create a virtual environment** (recommended)
   ```bash
   python -m venv venv
   
   # Windows
   venv\Scripts\activate
   
   # macOS/Linux
   source venv/bin/activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up Appwrite**
   
   Create a new project in [Appwrite Console](https://cloud.appwrite.io):
   - Navigate to your Appwrite Console
   - Create a new project
   - Copy your Project ID
   - Generate an API Key with appropriate permissions:
     - `databases.read`
     - `databases.write`
     - `collections.read`
     - `collections.write`
     - `documents.read`
     - `documents.write`

5. **Configure environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   # Flask Configuration
   SECRET_KEY=your-secret-key-here
   DEBUG=False
   
   # Appwrite Configuration
   APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
   APPWRITE_PROJECT_ID=your-project-id
   APPWRITE_API_KEY=your-api-key
   DATABASE_ID=reliefbridge_db
   
   # Optional
   PORT=5000
   ```

6. **Initialize the database**
   
   Run the setup script to create collections and attributes:
   ```bash
   python setup_appwrite.py
   ```
   
   This will:
   - Create the ReliefBridge database
   - Set up `users` and `help_requests` collections
   - Configure all required attributes and indexes

7. **Run the application**
   ```bash
   python app.py
   ```
   
   The application will be available at `http://localhost:5000`

### Quick Start with Docker (Optional)

```bash
# Build the image
docker build -t reliefbridge .

# Run the container
docker run -p 5000:5000 --env-file .env reliefbridge
```

---

## ⚙️ Configuration

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `SECRET_KEY` | Flask session secret key | Yes | - |
| `DEBUG` | Enable debug mode | No | `False` |
| `APPWRITE_ENDPOINT` | Appwrite API endpoint | Yes | `https://cloud.appwrite.io/v1` |
| `APPWRITE_PROJECT_ID` | Your Appwrite project ID | Yes | - |
| `APPWRITE_API_KEY` | Appwrite API key with permissions | Yes | - |
| `DATABASE_ID` | Appwrite database identifier | No | `reliefbridge_db` |
| `PORT` | Application port | No | `5000` |

### Appwrite Setup Details

The `setup_appwrite.py` script creates the following structure:

**Users Collection Attributes:**
- `name` (string, 255) - User's full name
- `email` (string, 255) - Email address (unique)
- `phone` (string, 20) - Contact phone number
- `role` (string, 50) - User role (victim/volunteer/admin)
- `location` (string, 500) - Current location description
- `password_hash` (string, 255) - Hashed password
- `active` (boolean) - Account status
- `created_at` (datetime) - Registration timestamp
- `last_seen` (datetime) - Last activity timestamp

**Help Requests Collection Attributes:**
- `user_id` (string, 255) - Creator's user ID
- `user_name` (string, 255) - Creator's name
- `request_type` (string, 100) - Type of assistance needed
- `description` (string, 1000) - Detailed description
- `priority` (string, 50) - Priority level
- `status` (string, 50) - Current status
- `location` (string, 500) - Address/location description
- `latitude` (float) - GPS latitude
- `longitude` (float) - GPS longitude
- `contact_phone` (string, 20) - Contact number
- `volunteer_id` (string, 255) - Assigned volunteer ID
- `volunteer_name` (string, 255) - Assigned volunteer name
- `created_at` (datetime) - Request timestamp
- `updated_at` (datetime) - Last update
- `claimed_at` (datetime) - Claim timestamp
- `completed_at` (datetime) - Completion timestamp

---

## 📁 Project Structure

```
ReliefBridge/
│
├── app.py                      # Main Flask application
├── config.py                   # Configuration management
├── setup_appwrite.py           # Database initialization script
├── requirements.txt            # Python dependencies
├── runtime.txt                 # Python version specification
├── Procfile                    # Deployment configuration
├── README.md                   # Project documentation
│
├── utils/
│   ├── __init__.py
│   ├── appwrite_client.py     # Appwrite SDK initialization
│   └── auth.py                # Authentication decorators
│
├── templates/
│   ├── base.html              # Base template with navigation
│   ├── index.html             # Landing page
│   ├── register.html          # User registration
│   ├── login.html             # User login
│   ├── dashboard.html         # Role-based dashboard
│   ├── create_request.html    # Emergency request form
│   ├── live_map.html          # Real-time map view
│   └── navigate_to_victim.html # Navigation interface
│
└── static/
    ├── css/
    │   └── custom.css         # Custom styles
    └── js/
        ├── geolocation.js     # GPS functionality
        ├── map_picker.js      # Location picker
        ├── navigation.js      # Route navigation
        └── realtime.js        # Realtime subscriptions
```

---

## 📖 Usage

### For Victims

1. **Register** an account with role "Victim"
2. **Login** to access your dashboard
3. **Create Request**:
   - Select request type and priority
   - Pick your location on the map
   - Provide detailed description
   - Add contact information
4. **Track** your request status in the dashboard
5. **Wait** for a volunteer to claim and complete your request

### For Volunteers

1. **Register** an account with role "Volunteer"
2. **Login** to access volunteer dashboard
3. **View** pending requests on the map or list
4. **Claim** a task that matches your location/skills
5. **Navigate** to the victim using built-in GPS navigation
6. **Complete** the task after providing assistance
7. **Repeat** to help more people!

### For Administrators

1. Login with admin credentials
2. Monitor all requests across the platform
3. View statistics and analytics
4. Manage user accounts (future feature)
5. Generate reports (future feature)

---

## ️ Roadmap

### Phase 1: Core Features ✅
- [x] User authentication system
- [x] Emergency request creation
- [x] GPS-based location tracking
- [x] Real-time updates with Appwrite
- [x] Interactive live map
- [x] Volunteer task claiming
- [x] Role-based dashboards

### Phase 2: Enhanced Features 🚧
- [ ] SMS/Email notifications
- [ ] Push notifications
- [ ] Multi-language support
- [ ] Advanced search and filtering
- [ ] Request history and analytics
- [ ] User ratings and reviews
- [ ] Resource inventory management

### Phase 3: Advanced Features 🔮
- [ ] AI-powered request prioritization
- [ ] Optimal volunteer matching algorithm
- [ ] Disaster prediction integration
- [ ] Mobile applications (iOS/Android)
- [ ] Offline mode with sync
- [ ] Integration with emergency services
- [ ] Blockchain-based donation tracking

---

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

### How to Contribute

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines

- Follow PEP 8 style guide for Python code
- Write meaningful commit messages
- Add comments for complex logic
- Test your changes thoroughly
- Update documentation as needed

---

## 📄 License

Distributed under the MIT License. See `LICENSE` file for more information.

---

## 🙏 Acknowledgments

- **[Appwrite](https://appwrite.io)** - For providing an amazing Backend as a Service platform
- **[Appwrite Init Program](https://appwrite.io/init)** - For supporting innovative projects
- **[Leaflet.js](https://leafletjs.com/)** - For the interactive mapping library
- **[OpenStreetMap](https://www.openstreetmap.org/)** - For map tiles and data
- **[Bootstrap](https://getbootstrap.com/)** - For the responsive UI framework
- **[Flask](https://flask.palletsprojects.com/)** - For the lightweight Python web framework
- **Railway** - For seamless deployment and hosting

---

## 👨‍💻 Author

**Nayananshu Garai**

- GitHub: [@N-Garai](https://github.com/N-Garai)
- Project Link: [https://github.com/N-Garai/ReliefBridge](https://github.com/N-Garai/ReliefBridge)
- Live Demo: [https://web-production-ec9bd.up.railway.app/](https://web-production-ec9bd.up.railway.app/)

---

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/N-Garai/ReliefBridge/issues) page
2. Create a new issue with detailed information
3. Contact via GitHub discussions

---

<div align="center">

### Built with ❤️ for Appwrite Init Program

**Making a difference, one connection at a time** 🌉

*Star ⭐ this repository if you find it helpful!*

</div>
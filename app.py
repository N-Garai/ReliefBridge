from flask import Flask, render_template, request, redirect, url_for, session, flash, jsonify
from appwrite.exception import AppwriteException
from appwrite.id import ID
from appwrite.query import Query
from appwrite.permission import Permission
from appwrite.role import Role
from utils.appwrite_client import account, databases, storage, messaging, get_user_client
from utils.auth import login_required, role_required, admin_required
from config import Config
import json
from datetime import datetime
import os

app = Flask(__name__)
app.config.from_object(Config)

# ============= AUTHENTICATION ROUTES =============

@app.route('/')
def index():
    """Landing page"""
    return render_template('index.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    """User registration with role selection"""
    if request.method == 'POST':
        try:
            email = request.form.get('email')
            password = request.form.get('password')
            name = request.form.get('name')
            role = request.form.get('role')
            phone = request.form.get('phone')
            location = request.form.get('location', '')

            # Create user account
            user = account.create(
                user_id=ID.unique(),
                email=email,
                password=password,
                name=name
            )

            # Create session
            session_data = account.create_email_password_session(email, password)
            session['session_id'] = session_data['$id']
            session['user_id'] = user['$id']
            session['user_name'] = name
            session['role'] = role

            # Store user data in database
            databases.create_document(
                database_id=Config.DATABASE_ID,
                collection_id=Config.USERS_COLLECTION_ID,
                document_id=user['$id'],
                data={
                    'name': name,
                    'email': email,
                    'role': role,
                    'phone': phone,
                    'location': location,
                    'created_at': datetime.now().isoformat(),
                    'active': True
                }
            )

            flash(f'Registration successful! Welcome {name}!', 'success')
            return redirect(url_for('dashboard'))

        except AppwriteException as e:
            flash(f'Registration failed: {e.message}', 'danger')

    return render_template('register.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    """User login"""
    if request.method == 'POST':
        try:
            email = request.form.get('email')
            password = request.form.get('password')

            session_data = account.create_email_password_session(email, password)

            client = get_user_client(session_data['$id'])
            user_account = Account(client)
            user_data = user_account.get()

            user_doc = databases.get_document(
                database_id=Config.DATABASE_ID,
                collection_id=Config.USERS_COLLECTION_ID,
                document_id=user_data['$id']
            )

            session['session_id'] = session_data['$id']
            session['user_id'] = user_data['$id']
            session['user_name'] = user_data['name']
            session['role'] = user_doc['role']

            flash(f'Welcome back, {user_data["name"]}!', 'success')
            return redirect(url_for('dashboard'))

        except AppwriteException as e:
            flash(f'Login failed: {e.message}', 'danger')

    return render_template('login.html')

@app.route('/logout')
@login_required
def logout():
    """Logout user"""
    try:
        if 'session_id' in session:
            client = get_user_client(session['session_id'])
            user_account = Account(client)
            user_account.delete_session('current')
    except:
        pass

    session.clear()
    flash('You have been logged out successfully.', 'info')
    return redirect(url_for('index'))

# ============= DASHBOARD ROUTES =============

@app.route('/dashboard')
@login_required
def dashboard():
    """Main dashboard - role-based routing"""
    role = session.get('role')

    if role == 'victim':
        return redirect(url_for('victim_dashboard'))
    elif role == 'volunteer':
        return redirect(url_for('volunteer_dashboard'))
    elif role == 'ngo':
        return redirect(url_for('ngo_dashboard'))
    elif role == 'coordinator':
        return redirect(url_for('coordinator_dashboard'))
    else:
        return render_template('dashboard.html')

@app.route('/victim/dashboard')
@login_required
@role_required('victim')
def victim_dashboard():
    """Victim dashboard"""
    try:
        requests = databases.list_documents(
            database_id=Config.DATABASE_ID,
            collection_id=Config.REQUESTS_COLLECTION_ID,
            queries=[
                Query.equal('user_id', session['user_id']),
                Query.order_desc('created_at')
            ]
        )
        return render_template('victim_dashboard.html', requests=requests['documents'])
    except AppwriteException as e:
        flash(f'Error loading dashboard: {e.message}', 'danger')
        return render_template('victim_dashboard.html', requests=[])

@app.route('/volunteer/dashboard')
@login_required
@role_required('volunteer')
def volunteer_dashboard():
    """Volunteer dashboard"""
    try:
        all_requests = databases.list_documents(
            database_id=Config.DATABASE_ID,
            collection_id=Config.REQUESTS_COLLECTION_ID,
            queries=[
                Query.equal('status', 'pending'),
                Query.order_desc('priority'),
                Query.limit(50)
            ]
        )

        my_requests = databases.list_documents(
            database_id=Config.DATABASE_ID,
            collection_id=Config.REQUESTS_COLLECTION_ID,
            queries=[
                Query.equal('volunteer_id', session['user_id']),
                Query.order_desc('created_at')
            ]
        )

        return render_template('volunteer_dashboard.html', 
                             available_requests=all_requests['documents'],
                             my_requests=my_requests['documents'])
    except AppwriteException as e:
        flash(f'Error loading dashboard: {e.message}', 'danger')
        return render_template('volunteer_dashboard.html', 
                             available_requests=[], my_requests=[])

# ============= REQUEST MANAGEMENT =============

@app.route('/request/create', methods=['GET', 'POST'])
@login_required
def create_request():
    """Create a new help request"""
    if request.method == 'POST':
        try:
            request_data = {
                'user_id': session['user_id'],
                'user_name': session['user_name'],
                'request_type': request.form.get('request_type'),
                'description': request.form.get('description'),
                'priority': request.form.get('priority'),
                'location': request.form.get('location'),
                'latitude': float(request.form.get('latitude', 0)),
                'longitude': float(request.form.get('longitude', 0)),
                'contact_phone': request.form.get('contact_phone'),
                'status': 'pending',
                'created_at': datetime.now().isoformat(),
                'updated_at': datetime.now().isoformat()
            }

            doc = databases.create_document(
                database_id=Config.DATABASE_ID,
                collection_id=Config.REQUESTS_COLLECTION_ID,
                document_id=ID.unique(),
                data=request_data
            )

            flash('Help request created successfully!', 'success')
            return redirect(url_for('victim_dashboard'))

        except AppwriteException as e:
            flash(f'Error creating request: {e.message}', 'danger')
        except ValueError as e:
            flash('Invalid latitude/longitude values', 'danger')

    return render_template('create_request.html')

@app.route('/request/<request_id>/claim', methods=['POST'])
@login_required
@role_required('volunteer')
def claim_request(request_id):
    """Volunteer claims a help request"""
    try:
        databases.update_document(
            database_id=Config.DATABASE_ID,
            collection_id=Config.REQUESTS_COLLECTION_ID,
            document_id=request_id,
            data={
                'volunteer_id': session['user_id'],
                'volunteer_name': session['user_name'],
                'status': 'in_progress',
                'claimed_at': datetime.now().isoformat(),
                'updated_at': datetime.now().isoformat()
            }
        )

        flash('Request claimed successfully!', 'success')
        return redirect(url_for('volunteer_dashboard'))

    except AppwriteException as e:
        flash(f'Error claiming request: {e.message}', 'danger')
        return redirect(url_for('volunteer_dashboard'))

@app.route('/map')
@login_required
def map_view():
    """Map view showing all requests with locations"""
    try:
        requests = databases.list_documents(
            database_id=Config.DATABASE_ID,
            collection_id=Config.REQUESTS_COLLECTION_ID,
            queries=[Query.order_desc('created_at'), Query.limit(200)]
        )

        return render_template('map_view.html', requests=requests['documents'])
    except AppwriteException as e:
        flash(f'Error loading map: {e.message}', 'danger')
        return render_template('map_view.html', requests=[])

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=Config.DEBUG, host='0.0.0.0', port=port)
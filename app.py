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
import requests

app = Flask(__name__)
app.config.from_object(Config)

# ============= ERROR HANDLERS =============

@app.errorhandler(404)
def not_found_error(error):
    return render_template('404.html'), 404

@app.errorhandler(500)
def internal_error(error):
    return render_template('500.html'), 500

# ============= AUTHENTICATION ROUTES =============

@app.route('/')
def index():
    """Enhanced landing page"""
    return render_template('index.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    """Enhanced user registration with role selection"""
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
                    'active': True,
                    'last_seen': datetime.now().isoformat()
                },
                permissions=[
                    Permission.read(Role.user(user['$id'])),
                    Permission.update(Role.user(user['$id'])),
                    Permission.delete(Role.user(user['$id']))
                ]
            )

            flash(f'Welcome to ReliefBridge, {name}! Your account has been created successfully.', 'success')
            return redirect(url_for('dashboard'))

        except AppwriteException as e:
            flash(f'Registration failed: {e.message}', 'danger')

    return render_template('register.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    """Enhanced user login"""
    if request.method == 'POST':
        try:
            email = request.form.get('email')
            password = request.form.get('password')

            # Create email session
            session_data = account.create_email_password_session(email, password)

            # Get user account
            client = get_user_client(session_data['$id'])
            user_account = Account(client)
            user_data = user_account.get()

            # Get user role from database
            user_doc = databases.get_document(
                database_id=Config.DATABASE_ID,
                collection_id=Config.USERS_COLLECTION_ID,
                document_id=user_data['$id']
            )

            # Update last seen
            databases.update_document(
                database_id=Config.DATABASE_ID,
                collection_id=Config.USERS_COLLECTION_ID,
                document_id=user_data['$id'],
                data={'last_seen': datetime.now().isoformat()}
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


@app.route('/oauth/google')
def google_oauth():
    """Google OAuth login"""
    try:
        success_url = url_for('oauth_callback', _external=True)
        failure_url = url_for('login', _external=True)
        
        # NEW METHOD NAME: create_oauth2_session (no underscore between o and auth)
        oauth_url = account.create_oauth2_session(
            provider='google',
            success=success_url,
            failure=failure_url
        )
        
        return redirect(oauth_url)
    except Exception as e:
        flash(f'Google login failed: {str(e)}', 'danger')
        return redirect(url_for('login'))


@app.route('/oauth/callback')
def oauth_callback():
    """Enhanced OAuth callback handler"""
    try:
        # Get the current user (already authenticated by Appwrite)
        user_data = account.get()

        # Check if user exists in database
        try:
            user_doc = databases.get_document(
                database_id=Config.DATABASE_ID,
                collection_id=Config.USERS_COLLECTION_ID,
                document_id=user_data['$id']
            )
            role = user_doc['role']

            # Update last seen
            databases.update_document(
                database_id=Config.DATABASE_ID,
                collection_id=Config.USERS_COLLECTION_ID,
                document_id=user_data['$id'],
                data={'last_seen': datetime.now().isoformat()}
            )

            # User exists, log them in
            session['user_id'] = user_data['$id']
            session['user_name'] = user_data['name']
            session['role'] = role

            flash(f'Welcome back, {user_data["name"]}!', 'success')
            return redirect(url_for('dashboard'))

        except AppwriteException:
            # New OAuth user - need to complete profile
            session['temp_user_id'] = user_data['$id']
            session['temp_user_name'] = user_data['name']
            session['temp_user_email'] = user_data['email']

            flash('Please complete your profile to continue', 'info')
            return redirect(url_for('complete_profile'))

    except Exception as e:
        flash(f'OAuth callback failed. Please try again.', 'danger')
        return redirect(url_for('login'))

@app.route('/complete-profile', methods=['GET', 'POST'])
def complete_profile():
    """Complete profile for OAuth users"""
    if 'temp_user_id' not in session:
        return redirect(url_for('register'))

    if request.method == 'POST':
        try:
            role = request.form.get('role')
            phone = request.form.get('phone')
            location = request.form.get('location', '')

            # Store user data in database
            databases.create_document(
                database_id=Config.DATABASE_ID,
                collection_id=Config.USERS_COLLECTION_ID,
                document_id=session['temp_user_id'],
                data={
                    'name': session['temp_user_name'],
                    'email': session['temp_user_email'],
                    'role': role,
                    'phone': phone,
                    'location': location,
                    'created_at': datetime.now().isoformat(),
                    'active': True,
                    'last_seen': datetime.now().isoformat()
                },
                permissions=[
                    Permission.read(Role.user(session['temp_user_id'])),
                    Permission.update(Role.user(session['temp_user_id'])),
                    Permission.delete(Role.user(session['temp_user_id']))
                ]
            )

            # Move temp session data to real session
            session['user_id'] = session.pop('temp_user_id')
            session['user_name'] = session.pop('temp_user_name')
            session['role'] = role
            session.pop('temp_user_email', None)

            flash('Profile completed successfully! Welcome to ReliefBridge!', 'success')
            return redirect(url_for('dashboard'))

        except AppwriteException as e:
            flash(f'Profile completion failed: {e.message}', 'danger')

    return render_template('complete_profile.html', 
                         name=session.get('temp_user_name'),
                         email=session.get('temp_user_email'))

@app.route('/logout')
@login_required
def logout():
    """Enhanced logout"""
    try:
        if 'session_id' in session:
            client = get_user_client(session['session_id'])
            user_account = Account(client)
            user_account.delete_session('current')
    except:
        pass

    session.clear()
    flash('You have been logged out successfully. Stay safe!', 'info')
    return redirect(url_for('index'))

# ============= DASHBOARD ROUTES =============

@app.route('/dashboard')
@login_required
def dashboard():
    """Enhanced main dashboard with role-based routing"""
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
    """Enhanced victim dashboard with real-time tracking"""
    try:
        # Get user's requests
        requests = databases.list_documents(
            database_id=Config.DATABASE_ID,
            collection_id=Config.REQUESTS_COLLECTION_ID,
            queries=[
                Query.equal('user_id', session['user_id']),
                Query.order_desc('created_at')
            ]
        )

        # Get active requests for tracking
        active_requests = [req for req in requests['documents'] if req['status'] in ['pending', 'in_progress']]

        return render_template('victim_dashboard.html', 
                             requests=requests['documents'],
                             active_requests=active_requests)
    except AppwriteException as e:
        flash(f'Error loading dashboard: {e.message}', 'danger')
        return render_template('victim_dashboard.html', requests=[], active_requests=[])

@app.route('/victim/track-help')
@login_required
@role_required('victim')
def track_help():
    """Real-time help tracking for victims"""
    try:
        # Get user's active requests
        active_requests = databases.list_documents(
            database_id=Config.DATABASE_ID,
            collection_id=Config.REQUESTS_COLLECTION_ID,
            queries=[
                Query.equal('user_id', session['user_id']),
                Query.equal('status', 'in_progress')
            ]
        )

        return render_template('track_help.html', 
                             active_requests=active_requests['documents'])
    except AppwriteException as e:
        flash(f'Error loading tracking: {e.message}', 'danger')
        return render_template('track_help.html', active_requests=[])

@app.route('/volunteer/dashboard')
@login_required
@role_required('volunteer')
def volunteer_dashboard():
    """Enhanced volunteer dashboard"""
    try:
        # Get all pending requests with priority sorting
        all_requests = databases.list_documents(
            database_id=Config.DATABASE_ID,
            collection_id=Config.REQUESTS_COLLECTION_ID,
            queries=[
                Query.equal('status', 'pending'),
                Query.order_desc('created_at'),  # Most recent first
                Query.limit(50)
            ]
        )

        # Sort by priority (high first)
        priority_order = {'high': 3, 'medium': 2, 'low': 1}
        sorted_requests = sorted(all_requests['documents'], 
                               key=lambda x: priority_order.get(x['priority'], 0), 
                               reverse=True)

        # Get volunteer's claimed requests
        my_requests = databases.list_documents(
            database_id=Config.DATABASE_ID,
            collection_id=Config.REQUESTS_COLLECTION_ID,
            queries=[
                Query.equal('volunteer_id', session['user_id']),
                Query.order_desc('created_at')
            ]
        )

        return render_template('volunteer_dashboard.html', 
                             available_requests=sorted_requests,
                             my_requests=my_requests['documents'])
    except AppwriteException as e:
        flash(f'Error loading dashboard: {e.message}', 'danger')
        return render_template('volunteer_dashboard.html', 
                             available_requests=[], my_requests=[])

# ============= REQUEST MANAGEMENT =============

@app.route('/request/create', methods=['GET', 'POST'])
@login_required
def create_request():
    """Enhanced help request creation"""
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

            # Create document
            doc = databases.create_document(
                database_id=Config.DATABASE_ID,
                collection_id=Config.REQUESTS_COLLECTION_ID,
                document_id=ID.unique(),
                data=request_data,
                permissions=[
                    Permission.read(Role.any()),
                    Permission.update(Role.user(session['user_id'])),
                    Permission.delete(Role.user(session['user_id']))
                ]
            )

            flash('Help request created successfully! Volunteers in your area will be notified.', 'success')
            return redirect(url_for('victim_dashboard'))

        except AppwriteException as e:
            flash(f'Error creating request: {e.message}', 'danger')
        except ValueError as e:
            flash('Invalid location coordinates. Please use the location button.', 'danger')

    return render_template('create_request.html')

@app.route('/request/<request_id>/claim', methods=['POST'])
@login_required
@role_required('volunteer')
def claim_request(request_id):
    """Enhanced request claiming with validation"""
    try:
        # Check if request is still available
        doc = databases.get_document(
            database_id=Config.DATABASE_ID,
            collection_id=Config.REQUESTS_COLLECTION_ID,
            document_id=request_id
        )

        if doc['status'] != 'pending':
            flash('This request has already been claimed or completed.', 'warning')
            return redirect(url_for('volunteer_dashboard'))

        # Update request
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

        flash('Request claimed successfully! Please contact the victim and provide assistance.', 'success')
        return redirect(url_for('volunteer_dashboard'))

    except AppwriteException as e:
        flash(f'Error claiming request: {e.message}', 'danger')
        return redirect(url_for('volunteer_dashboard'))

@app.route('/request/<request_id>/complete', methods=['POST'])
@login_required
def complete_request(request_id):
    """Enhanced request completion"""
    try:
        # Get the request to check permissions
        doc = databases.get_document(
            database_id=Config.DATABASE_ID,
            collection_id=Config.REQUESTS_COLLECTION_ID,
            document_id=request_id
        )

        # Check permissions
        can_complete = (
            session['role'] == 'coordinator' or 
            doc.get('volunteer_id') == session['user_id'] or 
            doc.get('user_id') == session['user_id']
        )

        if not can_complete:
            flash('You do not have permission to complete this request.', 'danger')
            return redirect(url_for('dashboard'))

        databases.update_document(
            database_id=Config.DATABASE_ID,
            collection_id=Config.REQUESTS_COLLECTION_ID,
            document_id=request_id,
            data={
                'status': 'completed',
                'completed_at': datetime.now().isoformat(),
                'updated_at': datetime.now().isoformat()
            }
        )

        flash('Request marked as completed! Thank you for your help.', 'success')
        return redirect(url_for('dashboard'))

    except AppwriteException as e:
        flash(f'Error completing request: {e.message}', 'danger')
        return redirect(url_for('dashboard'))

# ============= REAL-TIME TRACKING API =============

@app.route('/api/requests/live')
@login_required
def live_requests():
    """Enhanced API endpoint for real-time request updates"""
    try:
        user_role = session.get('role')
        queries = [Query.order_desc('created_at'), Query.limit(100)]

        # Filter based on user role
        if user_role == 'victim':
            queries.append(Query.equal('user_id', session['user_id']))
        elif user_role == 'volunteer':
            # Show pending requests and volunteer's own requests
            pass  # Show all for now, can be filtered client-side

        requests = databases.list_documents(
            database_id=Config.DATABASE_ID,
            collection_id=Config.REQUESTS_COLLECTION_ID,
            queries=queries
        )

        return jsonify({
            'success': True,
            'data': requests['documents'],
            'timestamp': datetime.now().isoformat()
        })
    except AppwriteException as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/requests/<request_id>/location')
@login_required
def get_request_location(request_id):
    """Get real-time location data for a specific request"""
    try:
        doc = databases.get_document(
            database_id=Config.DATABASE_ID,
            collection_id=Config.REQUESTS_COLLECTION_ID,
            document_id=request_id
        )

        # Check if user has permission to view this request
        can_view = (
            session['role'] in ['coordinator', 'ngo'] or
            doc.get('user_id') == session['user_id'] or
            doc.get('volunteer_id') == session['user_id']
        )

        if not can_view:
            return jsonify({'success': False, 'error': 'Unauthorized'}), 403

        return jsonify({
            'success': True,
            'data': {
                'id': doc['$id'],
                'latitude': doc['latitude'],
                'longitude': doc['longitude'],
                'location': doc['location'],
                'status': doc['status'],
                'priority': doc['priority'],
                'request_type': doc['request_type'],
                'volunteer_name': doc.get('volunteer_name'),
                'updated_at': doc['updated_at']
            }
        })
    except AppwriteException as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/map')
@login_required
def map_view():
    """Enhanced map view with real-time updates"""
    try:
        # Get requests based on user role
        user_role = session.get('role')
        queries = [Query.order_desc('created_at'), Query.limit(200)]

        if user_role == 'victim':
            queries.append(Query.equal('user_id', session['user_id']))

        requests = databases.list_documents(
            database_id=Config.DATABASE_ID,
            collection_id=Config.REQUESTS_COLLECTION_ID,
            queries=queries
        )

        return render_template('map_view.html', 
                             requests=requests['documents'],
                             user_role=user_role)
    except AppwriteException as e:
        flash(f'Error loading map: {e.message}', 'danger')
        return render_template('map_view.html', requests=[], user_role=session.get('role'))

if __name__ == '__main__':
    # Create uploads directory if it doesn't exist
    os.makedirs('uploads', exist_ok=True)

    # Run the application
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=Config.DEBUG, host='0.0.0.0', port=port)
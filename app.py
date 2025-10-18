from flask import Flask, render_template, request, redirect, url_for, session, flash, jsonify
from config import Config
import os
from datetime import datetime
from utils.appwrite_client import databases
from utils.auth import login_required
from appwrite.query import Query
from appwrite.id import ID


app = Flask(__name__)
app.config.from_object(Config)


@app.errorhandler(404)
def not_found(error):
    return '<h1>404</h1>', 404


@app.errorhandler(500)
def server_error(error):
    return '<h1>500</h1>', 500


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        try:
            databases.create_document(
                database_id=Config.DATABASE_ID,
                collection_id='users',
                document_id=ID.unique(),
                data={
                    'name': request.form['name'],
                    'email': request.form['email'],
                    'phone': request.form['phone'],
                    'role': request.form.get('role', 'victim'),
                    'location': request.form.get('location', ''),
                    'active': True,
                    'created_at': datetime.utcnow().isoformat(),
                    'last_seen': datetime.utcnow().isoformat(),
                    'password_hash': request.form['password']
                }
            )
            flash('Registered!', 'success')
            return redirect(url_for('login'))
        except Exception as e:
            flash(str(e), 'danger')
    return render_template('register.html')


@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        try:
            result = databases.list_documents(
                database_id=Config.DATABASE_ID,
                collection_id='users',
                queries=[Query.equal('email', request.form['email'])]
            )
            if result['total'] > 0:
                user = result['documents'][0]
                if user['password_hash'] == request.form['password']:
                    session['user_id'] = user['$id']
                    session['user_name'] = user['name']
                    session['role'] = user['role']
                    session['email'] = user['email']
                    return redirect(url_for('dashboard'))
            flash('Invalid credentials', 'danger')
        except Exception as e:
            flash(str(e), 'danger')
    return render_template('login.html')


@app.route('/logout')
def logout():
    session.clear()
    flash('Logged out successfully!', 'info')
    return redirect(url_for('index'))


@app.route('/dashboard')
@login_required
def dashboard():
    try:
        user_role = session.get('role')
        user_id = session.get('user_id')
        
        all_requests = databases.list_documents(
            database_id=Config.DATABASE_ID,
            collection_id='help_requests'
        )
        
        if user_role == 'victim':
            my_requests = databases.list_documents(
                database_id=Config.DATABASE_ID,
                collection_id='help_requests',
                queries=[Query.equal('user_id', user_id)]
            )
            return render_template('dashboard.html',
                                 my_requests=my_requests['documents'],
                                 all_requests=all_requests['documents'],
                                 pending_requests=[],
                                 my_claimed=[])
        
        elif user_role == 'volunteer':
            pending_requests = databases.list_documents(
                database_id=Config.DATABASE_ID,
                collection_id='help_requests',
                queries=[Query.equal('status', 'pending')]
            )
            
            my_claimed = databases.list_documents(
                database_id=Config.DATABASE_ID,
                collection_id='help_requests',
                queries=[Query.equal('volunteer_id', user_id)]
            )
            
            return render_template('dashboard.html',
                                 pending_requests=pending_requests['documents'],
                                 my_claimed=my_claimed['documents'],
                                 all_requests=all_requests['documents'],
                                 my_requests=[])
        
        else:
            pending_requests = databases.list_documents(
                database_id=Config.DATABASE_ID,
                collection_id='help_requests',
                queries=[Query.equal('status', 'pending')]
            )
            
            claimed_requests = databases.list_documents(
                database_id=Config.DATABASE_ID,
                collection_id='help_requests',
                queries=[Query.equal('status', 'claimed')]
            )
            
            return render_template('dashboard.html',
                                 all_requests=all_requests['documents'],
                                 pending_requests=pending_requests['documents'],
                                 claimed_requests=claimed_requests['documents'],
                                 my_requests=[],
                                 my_claimed=[])
    
    except Exception as e:
        flash(f'Error: {str(e)}', 'danger')
        return redirect(url_for('index'))


@app.route('/request/create', methods=['GET', 'POST'])
@login_required
def create_request():
    if request.method == 'POST':
        try:
            # ✅ GET AND VALIDATE COORDINATES
            latitude = float(request.form['latitude'])
            longitude = float(request.form['longitude'])
            
            # ✅ VALIDATE LATITUDE (-90 to 90)
            if not (-90 <= latitude <= 90):
                flash('❌ Invalid latitude! Must be between -90 and 90. Please select location on the map.', 'danger')
                return redirect(url_for('create_request'))
            
            # ✅ VALIDATE LONGITUDE (-180 to 180)
            if not (-180 <= longitude <= 180):
                flash('❌ Invalid longitude! Must be between -180 and 180. Please select location on the map.', 'danger')
                return redirect(url_for('create_request'))
            
            # ✅ ROUND TO 6 DECIMAL PLACES (prevents floating point issues)
            latitude = round(latitude, 6)
            longitude = round(longitude, 6)
            
            # Create help request with validated coordinates
            databases.create_document(
                database_id=Config.DATABASE_ID,
                collection_id='help_requests',
                document_id=ID.unique(),
                data={
                    'user_id': session['user_id'],
                    'user_name': session['user_name'],
                    'request_type': request.form['request_type'],
                    'description': request.form['description'],
                    'priority': request.form['priority'],
                    'location': request.form['location'],
                    'latitude': latitude,
                    'longitude': longitude,
                    'contact_phone': request.form['contact_phone'],
                    'status': 'pending',
                    'created_at': datetime.utcnow().isoformat(),
                    'updated_at': datetime.utcnow().isoformat()
                }
            )
            
            flash(f'✅ Request submitted successfully! Location: {latitude}, {longitude}', 'success')
            return redirect(url_for('dashboard'))
            
        except ValueError as e:
            flash('❌ Invalid coordinates format! Please select a valid location on the map.', 'danger')
            return redirect(url_for('create_request'))
        except Exception as e:
            flash(f'Error: {str(e)}', 'danger')
            
    return render_template('create_request.html')


@app.route('/task/claim/<request_id>')
@login_required
def claim_task(request_id):
    try:
        if session.get('role') != 'volunteer':
            flash('Only volunteers can claim tasks', 'danger')
            return redirect(url_for('dashboard'))
        
        databases.update_document(
            database_id=Config.DATABASE_ID,
            collection_id='help_requests',
            document_id=request_id,
            data={
                'status': 'claimed',
                'volunteer_id': session.get('user_id'),
                'volunteer_name': session.get('user_name'),
                'claimed_at': datetime.utcnow().isoformat(),
                'updated_at': datetime.utcnow().isoformat()
            }
        )
        
        flash('Task claimed successfully!', 'success')
        return redirect(url_for('dashboard'))
    except Exception as e:
        flash(f'Error: {str(e)}', 'danger')
        return redirect(url_for('dashboard'))


@app.route('/task/complete/<request_id>')
@login_required
def complete_task(request_id):
    try:
        if session.get('role') != 'volunteer':
            flash('Only volunteers can complete tasks', 'danger')
            return redirect(url_for('dashboard'))
        
        databases.update_document(
            database_id=Config.DATABASE_ID,
            collection_id='help_requests',
            document_id=request_id,
            data={
                'status': 'completed',
                'completed_at': datetime.utcnow().isoformat(),
                'updated_at': datetime.utcnow().isoformat()
            }
        )
        
        flash('Task marked as completed!', 'success')
        return redirect(url_for('dashboard'))
    except Exception as e:
        flash(f'Error: {str(e)}', 'danger')
        return redirect(url_for('dashboard'))


@app.route('/tasks/available')
@login_required
def available_tasks():
    try:
        if session.get('role') != 'volunteer':
            flash('Access denied', 'danger')
            return redirect(url_for('dashboard'))
        
        pending = databases.list_documents(
            database_id=Config.DATABASE_ID,
            collection_id='help_requests',
            queries=[Query.equal('status', 'pending')]
        )
        
        return render_template('available_tasks.html', tasks=pending['documents'])
    except Exception as e:
        flash(f'Error: {str(e)}', 'danger')
        return redirect(url_for('dashboard'))


@app.route('/navigate/<request_id>')
@login_required
def navigate_to_victim(request_id):
    try:
        if session.get('role') != 'volunteer':
            flash('Only volunteers can access navigation', 'danger')
            return redirect(url_for('dashboard'))
        
        request_doc = databases.get_document(
            database_id=Config.DATABASE_ID,
            collection_id='help_requests',
            document_id=request_id
        )
        
        if request_doc.get('volunteer_id') != session.get('user_id'):
            flash('You can only navigate to tasks you claimed', 'danger')
            return redirect(url_for('dashboard'))
        
        return render_template('navigate_to_victim.html', request=request_doc)
    
    except Exception as e:
        flash(f'Error: {str(e)}', 'danger')
        return redirect(url_for('dashboard'))


@app.route('/map')
def live_map():
    try:
        reqs = databases.list_documents(
            database_id=Config.DATABASE_ID,
            collection_id='help_requests'
        )
        return render_template('live_map.html', requests=reqs['documents'])
    except:
        return redirect(url_for('index'))


@app.route('/api/requests')
def get_requests():
    try:
        reqs = databases.list_documents(
            database_id=Config.DATABASE_ID,
            collection_id='help_requests'
        )
        return jsonify(reqs)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=Config.DEBUG, host='0.0.0.0', port=port)

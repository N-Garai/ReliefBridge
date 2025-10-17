from functools import wraps
from flask import session, redirect, url_for, flash

def login_required(f):
    @wraps(f)
    def wrap(*args, **kwargs):
        if 'user_id' not in session:
            flash('Login required', 'warning')
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return wrap

def role_required(role):
    def decorator(f):
        @wraps(f)
        def wrap(*args, **kwargs):
            if session.get('role') != role:
                flash('Access denied', 'danger')
                return redirect(url_for('dashboard'))
            return f(*args, **kwargs)
        return wrap
    return decorator

def admin_required(f):
    @wraps(f)
    def wrap(*args, **kwargs):
        if session.get('role') not in ['admin','coordinator']:
            flash('Admin required', 'danger')
            return redirect(url_for('dashboard'))
        return f(*args, **kwargs)
    return wrap
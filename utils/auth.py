# utils/auth.py
"""
Authentication decorators and helpers
"""

from functools import wraps
from flask import session, redirect, url_for, flash

def require_login(f):
    """
    Decorator to require user login
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            flash('Please login to access this page.', 'warning')
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function

def require_role(required_role):
    """
    Decorator to require specific user role
    """
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if 'user_id' not in session:
                flash('Please login to access this page.', 'warning')
                return redirect(url_for('login'))
            
            if session.get('role') != required_role:
                flash(f'Access denied. This page requires {required_role} role.', 'danger')
                return redirect(url_for('dashboard'))
            
            return f(*args, **kwargs)
        return decorated_function
    return decorator

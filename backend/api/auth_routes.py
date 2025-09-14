# -*- coding: utf-8 -*-
"""
auth_routes.py: API routes for user authentication.

This blueprint manages login and logout functionality for the application.
"""

from flask import Blueprint, request, jsonify

# Define the blueprint for authentication routes
auth_bp = Blueprint('auth_api', __name__)

# --- Mock User Database ---
# In a real-world application, you would query a database for user credentials.
# For this project, we'll use a hardcoded dictionary for the admin user.
MOCK_ADMIN_USER = {
    "username": "admin",
    "password": "password123" 
}

@auth_bp.route('/login', methods=['POST'])
def login():
    """
    Authenticates a user based on username and password.

    Expects a JSON body with 'username' and 'password' fields.
    
    Returns:
        JSON: A success object with a mock token, or an error object.
    """
    # Get the JSON data from the request body
    data = request.get_json()

    if not data or not data.get('username') or not data.get('password'):
        return jsonify({"message": "Username and password are required."}), 400

    username = data.get('username')
    password = data.get('password')

    # --- Authentication Check ---
    if username == MOCK_ADMIN_USER['username'] and password == MOCK_ADMIN_USER['password']:
        # If credentials are correct, send back a success response and a mock token.
        # In a real application, you would generate a secure JWT (JSON Web Token) here.
        mock_token = "fake-jwt-token-for-admin-user"
        
        print(f"Successful login for user: {username}")
        return jsonify({
            "message": "Login successful!",
            "token": mock_token,
            "user": {"username": username}
        }), 200
    else:
        # If credentials are incorrect, send back an unauthorized error.
        print(f"Failed login attempt for user: {username}")
        return jsonify({"message": "Invalid credentials. Please try again."}), 401


@auth_bp.route('/logout', methods=['POST'])
def logout():
    """
    Logs out the user.

    In a stateless token-based system, logout is primarily handled on the
    client-side (by deleting the token). This endpoint is here to provide
    a complete API and for any potential server-side cleanup if needed.
    """
    # You could add token blocklisting logic here in a more advanced setup.
    return jsonify({"message": "You have been successfully logged out."}), 200
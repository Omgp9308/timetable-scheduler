import jwt
from datetime import datetime, timedelta
from flask import Blueprint, request, jsonify, current_app

# Import the new data access function for getting users
from data import get_user_by_username

# Define the blueprint for authentication routes
auth_bp = Blueprint('auth_api', __name__)

@auth_bp.route('/login', methods=['POST'])
def login():
    """
    Authenticates a user based on username and password and returns a JWT.
    """
    data = request.get_json()
    if not data or not data.get('username') or not data.get('password'):
        return jsonify({"message": "Username and password are required."}), 400

    username = data.get('username')
    password = data.get('password')

    # Find the user in the database
    user = get_user_by_username(username)

    # Check if the user exists and the password is correct
    if not user or not user.check_password(password):
        return jsonify({"message": "Invalid credentials. Please try again."}), 401

    # --- Create the JWT Payload ---
    # The payload contains the claims about the user.
    payload = {
        'iat': datetime.utcnow(), # Issued at time
        'exp': datetime.utcnow() + timedelta(hours=24), # Expiration time
        'sub': user.id, # Subject (the user's ID)
        'role': user.role, # User's role for frontend logic
        'dept': user.department_id, # User's department ID
        'user': user.username
    }

    # --- Generate the JWT ---
    token = jwt.encode(
        payload,
        current_app.config['SECRET_KEY'],
        algorithm='HS256'
    )

    print(f"Successful login for user: {username}, Role: {user.role}")
    return jsonify({
        "message": "Login successful!",
        "token": token,
        # Send back user info for display on the frontend
        "user": user.to_dict()
    }), 200

@auth_bp.route('/logout', methods=['POST'])
def logout():
    """
    Logs out the user. In a JWT system, this is handled by the client
    deleting the token. This endpoint is kept for API completeness.
    """
    return jsonify({"message": "You have been successfully logged out."}), 200

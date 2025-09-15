from flask import Blueprint, request, jsonify
from database import db, User

# Define the blueprint for authentication routes
auth_bp = Blueprint('auth_api', __name__)

@auth_bp.route('/login', methods=['POST'])
def login():
    """
    Authenticates a user by checking credentials against the database.
    Returns the user's role upon successful login.
    """
    data = request.get_json()
    if not data or not data.get('username') or not data.get('password'):
        return jsonify({"message": "Username and password are required."}), 400

    username = data.get('username')
    password = data.get('password')

    # --- Database Authentication Check ---
    # Find the user by their username in the User table
    user = User.query.filter_by(username=username).first()

    # If user exists and the password is correct
    if user and user.check_password(password):
        print(f"Successful login for user: {username}, Role: {user.role}")
        return jsonify({
            "message": "Login successful!",
            # In a real app, you would generate a JWT token here
            "token": "fake-jwt-token-for-" + user.role,
            "user": {
                "username": user.username,
                "role": user.role  # <-- The crucial addition!
            }
        }), 200
    else:
        # If user doesn't exist or password is incorrect
        print(f"Failed login attempt for user: {username}")
        return jsonify({"message": "Invalid credentials. Please try again."}), 401

@auth_bp.route('/logout', methods=['POST'])
def logout():
    """Logs out the user."""
    return jsonify({"message": "You have been successfully logged out."}), 200


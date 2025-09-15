from flask import Blueprint, request, jsonify, current_app
from database import db, User
import jwt
import datetime

# Define the blueprint for authentication routes
auth_bp = Blueprint('auth_api', __name__)

@auth_bp.route('/login', methods=['POST'])
def login():
    """
    Authenticates a user by checking credentials against the database.
    Returns a JWT token and user's role upon successful login.
    """
    data = request.get_json()
    if not data or not data.get('username') or not data.get('password'):
        return jsonify({"message": "Username and password are required."}), 400

    username = data.get('username')
    password = data.get('password')

    # --- Database Authentication Check ---
    user = User.query.filter_by(username=username).first()

    if user and user.check_password(password):
        # --- JWT Token Generation ---
        token = jwt.encode({
            'sub': user.id,
            'role': user.role,
            'dept': user.department_id,
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
        }, current_app.config['SECRET_KEY'], algorithm="HS256")

        print(f"Successful login for user: {username}, Role: {user.role}")
        return jsonify({
            "message": "Login successful!",
            "token": token,
            "user": {
                "username": user.username,
                "role": user.role
            }
        }), 200
    else:
        print(f"Failed login attempt for user: {username}")
        return jsonify({"message": "Invalid credentials. Please try again."}), 401

@auth_bp.route('/logout', methods=['POST'])
def logout():
    """Logs out the user."""
    # In a real-world scenario, you might handle token blacklisting here
    return jsonify({"message": "You have been successfully logged out."}), 200
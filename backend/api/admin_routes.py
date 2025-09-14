# -*- coding: utf-8 -*-
"""
admin_routes.py: Secure API routes for administrator actions.

This blueprint handles requests that require administrative privileges, such as
triggering the timetable generation process, saving a timetable, or modifying
core data. Access to these routes should be protected.
"""

from functools import wraps
from flask import Blueprint, jsonify, request

# Import the main function from our optimization engine
from optimizer.solver import generate_timetable

# Define the blueprint for admin routes
admin_bp = Blueprint('admin_api', __name__)

# --- Security Decorator (Placeholder) ---
# In a real-world application, this decorator would check for a valid JSON Web Token (JWT)
# or session cookie to ensure the user is an authenticated administrator.
def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if request.method == 'OPTIONS':
            return '', 204 # Or 200 OK
        token = None
        # For now, we'll just simulate a pass.
        # In production, you would add logic like:
        # if not current_user.is_admin():
        #     return jsonify({"message": "Admin access required"}), 403
        print("--- Admin access check passed (simulation) ---")
        return f(*args, **kwargs)
    return decorated_function   


@admin_bp.route('/generate', methods=['POST'])
@admin_required
def trigger_generation():
    """
    Triggers the timetable generation process.

    This is a long-running, computationally intensive task. The frontend
    should expect a delay and show a loading indicator.
    
    Returns:
        JSON: A success object with the generated timetable data or a failure
              object with an error message.
    """
    data = request.get_json() 

    # Now you can safely access keys from the dictionary
    some_value = data['some_key'] 
    print("Received request to generate timetable...")
    
    try:
        # Call the core solver function
        solution = generate_timetable()
        
        if solution and solution['status'] == 'success':
            print("Successfully generated a timetable.")
            return jsonify(solution), 200
        else:
            print("Failed to generate a timetable.")
            # 422 Unprocessable Entity is a good status code when the server
            # understands the request but cannot process the instructions.
            return jsonify(solution), 422
            
    except Exception as e:
        print(f"An unexpected error occurred during generation: {e}")
        # 500 Internal Server Error for unexpected issues.
        return jsonify({
            "status": "error",
            "message": f"An internal server error occurred: {str(e)}"
        }), 500

# You can add other admin routes here later, for example:
# @admin_bp.route('/data/faculty', methods=['POST'])
# @admin_required
# def add_faculty():
#     # Logic to add a new faculty member to the data source
#     pass
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
# Import mock data functions to serve admin data
from data import get_subjects, get_faculty, get_rooms, get_batches

# Define the blueprint for admin routes
admin_bp = Blueprint('admin_api', __name__)

# --- Security Decorator ---
# This decorator correctly handles preflight OPTIONS requests to allow CORS checks to pass.
def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Allow preflight OPTIONS requests to pass through without auth checks.
        if request.method == 'OPTIONS':
            return '', 204
        
        # In production, you would validate a JWT or session here.
        print("--- Admin access check passed (simulation) ---")
        return f(*args, **kwargs)
    return decorated_function

# --- Admin Routes ---

@admin_bp.route('/stats', methods=['GET', 'OPTIONS'])
@admin_required
def get_admin_stats():
    """Provides simple statistics for the admin dashboard."""
    print("Request received for admin stats.")
    try:
        stats = {
            "subjects": len(get_subjects()),
            "faculty": len(get_faculty()),
            "rooms": len(get_rooms()),
            "batches": len(get_batches())
        }
        return jsonify(stats), 200
    except Exception as e:
        return jsonify({"message": f"Error fetching stats: {e}"}), 500


@admin_bp.route('/all-data', methods=['GET', 'OPTIONS'])
@admin_required
def get_all_data():
    """Provides all core data for the admin management view."""
    print("Request received for all admin data.")
    try:
        all_data = {
            "subjects": get_subjects(),
            "faculty": get_faculty(),
            "rooms": get_rooms(),
            "batches": get_batches()
        }
        return jsonify(all_data), 200
    except Exception as e:
        return jsonify({"message": f"Error fetching all data: {e}"}), 500

@admin_bp.route('/generate', methods=['POST', 'OPTIONS'])
@admin_required
def trigger_generation():
    """
    Triggers the timetable generation process.
    This route no longer needs to read from the request body.
    """
    print("Received request to generate timetable...")
    
    try:
        solution = generate_timetable()
        
        if solution and solution.get('status') == 'success':
            print("Successfully generated a timetable.")
            return jsonify(solution), 200
        else:
            print("Failed to generate a timetable.")
            return jsonify(solution or {"status": "error", "message": "Solver failed to produce a valid solution."}), 422
            
    except Exception as e:
        print(f"An unexpected error occurred during generation: {e}")
        return jsonify({
            "status": "error",
            "message": f"An internal server error occurred: {str(e)}"
        }), 500


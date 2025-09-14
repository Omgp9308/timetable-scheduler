# -*- coding: utf-8 -*-
"""
admin_routes.py: Secure API routes for administrator actions.
"""

from functools import wraps
from flask import Blueprint, jsonify, request
from sqlalchemy.exc import IntegrityError

# Import the main function from our optimization engine
from optimizer.solver import generate_timetable
# Import database-aware functions from our data access layer
from data import get_subjects, get_faculty, get_rooms, get_batches, add_subject

# Define the blueprint for admin routes
admin_bp = Blueprint('admin_api', __name__)

# --- Security Decorator ---
def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if request.method == 'OPTIONS':
            return '', 204
        print("--- Admin access check passed (simulation) ---")
        return f(*args, **kwargs)
    return decorated_function

# --- Admin Routes ---

@admin_bp.route('/stats', methods=['GET', 'OPTIONS'])
@admin_required
def get_admin_stats():
    """Provides simple statistics for the admin dashboard."""
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

@admin_bp.route('/subjects', methods=['POST', 'OPTIONS'])
@admin_required
def handle_add_subject():
    """Adds a new subject to the database."""
    data = request.get_json()
    if not data or not all(k in data for k in ['id', 'name', 'credits', 'type']):
        return jsonify({"message": "Missing required fields for subject."}), 400
    try:
        new_subject = add_subject(data)
        return jsonify(new_subject), 201  # 201 Created
    except IntegrityError:
        return jsonify({"message": f"Subject with ID '{data['id']}' already exists."}), 409 # 409 Conflict
    except Exception as e:
        return jsonify({"message": f"An unexpected error occurred: {e}"}), 500

@admin_bp.route('/generate', methods=['POST', 'OPTIONS'])
@admin_required
def trigger_generation():
    """Triggers the timetable generation process."""
    print("Received request to generate timetable...")
    try:
        solution = generate_timetable()
        if solution and solution.get('status') == 'success':
            return jsonify(solution), 200
        else:
            return jsonify(solution or {"status": "error", "message": "Solver failed to produce a valid solution."}), 422
    except Exception as e:
        return jsonify({"status": "error", "message": f"An internal server error occurred: {str(e)}"}), 500


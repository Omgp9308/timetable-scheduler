# -*- coding: utf-8 -*-
"""
admin_routes.py: Secure API routes for administrator actions.
"""

from functools import wraps
from flask import Blueprint, jsonify, request

from optimizer.solver import generate_timetable
from data import (
    get_subjects, get_faculty, get_rooms, get_batches, add_subject
)
from .public_routes import update_published_timetable

admin_bp = Blueprint('admin_api', __name__)

# --- Security Decorator (Simulation) ---
def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if request.method == 'OPTIONS':
            return '', 204
        print("--- Admin access check passed (simulation) ---")
        return f(*args, **kwargs)
    return decorated_function

# --- Dashboard & Data Viewing Routes ---

@admin_bp.route('/stats', methods=['GET', 'OPTIONS'])
@admin_required
def get_admin_stats():
    """Provides simple statistics for the admin dashboard from the database."""
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
    """Provides all core data for the admin management view from the database."""
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

# --- Data Management (CRUD) Routes ---

@admin_bp.route('/add-subject', methods=['POST', 'OPTIONS'])
@admin_required
def handle_add_subject():
    """Adds a new subject to the database."""
    data = request.get_json()
    if not data or not all(k in data for k in ['name', 'credits', 'type']):
        return jsonify({"status": "error", "message": "Missing required fields."}), 400
    
    try:
        new_subject = add_subject(data['name'], data['credits'], data['type'])
        return jsonify({"status": "success", "subject": new_subject}), 201
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

# --- Timetable Generation & Publishing Routes ---

@admin_bp.route('/generate', methods=['POST', 'OPTIONS'])
@admin_required
def trigger_generation():
    """Triggers the timetable generation process using data from the database."""
    print("Received request to generate timetable...")
    try:
        solution = generate_timetable()
        if solution and solution.get('status') == 'success':
            return jsonify(solution), 200
        else:
            return jsonify(solution or {"status": "error", "message": "Solver failed."}), 422
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@admin_bp.route('/publish', methods=['POST', 'OPTIONS'])
@admin_required
def publish_new_timetable():
    """Receives and publishes a new timetable."""
    new_timetable_data = request.get_json()
    if not new_timetable_data:
        return jsonify({"status": "error", "message": "No timetable data provided."}), 400
    try:
        update_published_timetable(new_timetable_data)
        return jsonify({"status": "success", "message": "Timetable published successfully."}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


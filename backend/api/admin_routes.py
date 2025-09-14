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
# Import functions to interact with the database
from data import (
    get_subjects, get_faculty, get_rooms, get_batches,
    add_subject, add_faculty, add_room, add_batch,
    delete_subject, delete_faculty, delete_room, delete_batch
)
from .public_routes import update_published_timetable

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

# --- GET Routes ---
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

# --- POST (ADD) Routes ---
@admin_bp.route('/add-subject', methods=['POST', 'OPTIONS'])
@admin_required
def add_subject_route():
    data = request.get_json()
    if not data or not all(k in data for k in ['name', 'credits', 'type']):
        return jsonify({"message": "Missing data for subject."}), 400
    new_subject = add_subject(data['name'], data['credits'], data['type'])
    return jsonify(new_subject), 201

@admin_bp.route('/add-faculty', methods=['POST', 'OPTIONS'])
@admin_required
def add_faculty_route():
    data = request.get_json()
    if not data or not all(k in data for k in ['name', 'expertise']):
        return jsonify({"message": "Missing data for faculty."}), 400
    new_faculty = add_faculty(data['name'], data['expertise'])
    return jsonify(new_faculty), 201

@admin_bp.route('/add-room', methods=['POST', 'OPTIONS'])
@admin_required
def add_room_route():
    data = request.get_json()
    if not data or not all(k in data for k in ['name', 'capacity', 'type']):
        return jsonify({"message": "Missing data for room."}), 400
    new_room = add_room(data['name'], data['capacity'], data['type'])
    return jsonify(new_room), 201

@admin_bp.route('/add-batch', methods=['POST', 'OPTIONS'])
@admin_required
def add_batch_route():
    data = request.get_json()
    if not data or not all(k in data for k in ['name', 'strength', 'subjects']):
        return jsonify({"message": "Missing data for batch."}), 400
    new_batch = add_batch(data['name'], data['strength'], data['subjects'])
    return jsonify(new_batch), 201

# --- DELETE Routes ---
@admin_bp.route('/delete-subject/<int:subject_id>', methods=['DELETE', 'OPTIONS'])
@admin_required
def delete_subject_route(subject_id):
    if delete_subject(subject_id):
        return jsonify({"message": "Subject deleted successfully."}), 200
    return jsonify({"message": "Subject not found."}), 404

@admin_bp.route('/delete-faculty/<int:faculty_id>', methods=['DELETE', 'OPTIONS'])
@admin_required
def delete_faculty_route(faculty_id):
    if delete_faculty(faculty_id):
        return jsonify({"message": "Faculty deleted successfully."}), 200
    return jsonify({"message": "Faculty not found."}), 404

@admin_bp.route('/delete-room/<int:room_id>', methods=['DELETE', 'OPTIONS'])
@admin_required
def delete_room_route(room_id):
    if delete_room(room_id):
        return jsonify({"message": "Room deleted successfully."}), 200
    return jsonify({"message": "Room not found."}), 404

@admin_bp.route('/delete-batch/<int:batch_id>', methods=['DELETE', 'OPTIONS'])
@admin_required
def delete_batch_route(batch_id):
    if delete_batch(batch_id):
        return jsonify({"message": "Batch deleted successfully."}), 200
    return jsonify({"message": "Batch not found."}), 404


# --- Timetable Generation and Publishing ---
@admin_bp.route('/generate', methods=['POST', 'OPTIONS'])
@admin_required
def trigger_generation():
    """Triggers the timetable generation process."""
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
        return jsonify({"status": "error", "message": f"An internal server error occurred: {str(e)}"}), 500

@admin_bp.route('/publish', methods=['POST', 'OPTIONS'])
@admin_required
def publish_new_timetable():
    """Receives a timetable and sets it as the new public timetable."""
    new_timetable_data = request.get_json()
    if not new_timetable_data:
        return jsonify({"status": "error", "message": "No timetable data provided."}), 400
    try:
        update_published_timetable(new_timetable_data)
        return jsonify({"status": "success", "message": "Timetable has been successfully published."}), 200
    except Exception as e:
        print(f"An error occurred during publishing: {e}")
        return jsonify({"status": "error", "message": f"An internal server error occurred: {str(e)}"}), 500


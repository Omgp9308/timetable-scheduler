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
# Import the data access functions
from data import (
    get_subjects, get_faculty, get_rooms, get_batches,
    add_subject, add_faculty, add_room, add_batch,
    delete_subject, delete_faculty, delete_room, delete_batch,
    update_subject, update_faculty, update_room, update_batch
)

# Define the blueprint for admin routes
admin_bp = Blueprint('admin_api', __name__)

# --- Security Decorator (Corrected) ---
# This decorator no longer needs to handle OPTIONS requests manually.
# Flask-CORS will manage all preflight requests for the entire app.
def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # In a real app, you would validate a JWT or session here.
        # For now, we'll simulate a passed check.
        print("--- Admin access check passed (simulation) ---")
        return f(*args, **kwargs)
    return decorated_function

# --- Admin Routes ---

@admin_bp.route('/stats', methods=['GET'])
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


@admin_bp.route('/all-data', methods=['GET'])
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

@admin_bp.route('/generate', methods=['POST'])
@admin_required
def trigger_generation():
    """Triggers the timetable generation process."""
    try:
        solution = generate_timetable()
        if solution and solution.get('status') == 'success':
            return jsonify(solution), 200
        else:
            return jsonify(solution or {"status": "error", "message": "Solver failed."}), 422
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@admin_bp.route('/publish', methods=['POST'])
@admin_required
def publish_new_timetable():
    """Receives and publishes a new timetable."""
    # This function needs to be connected to the public_routes logic
    # For now, it's a placeholder.
    return jsonify({"message": "Publish endpoint is not fully implemented yet."}), 501


# --- ADD ROUTES ---
@admin_bp.route('/add-subject', methods=['POST'])
@admin_required
def add_new_subject():
    data = request.get_json()
    new_subject = add_subject(data['name'], data['credits'], data['type'])
    return jsonify(new_subject), 201

@admin_bp.route('/add-faculty', methods=['POST'])
@admin_required
def add_new_faculty():
    data = request.get_json()
    new_faculty = add_faculty(data['name'], data['expertise'])
    return jsonify(new_faculty), 201

@admin_bp.route('/add-room', methods=['POST'])
@admin_required
def add_new_room():
    data = request.get_json()
    new_room = add_room(data['name'], data['capacity'], data['type'])
    return jsonify(new_room), 201

@admin_bp.route('/add-batch', methods=['POST'])
@admin_required
def add_new_batch():
    data = request.get_json()
    new_batch = add_batch(data['name'], data['strength'], data['subjects'])
    return jsonify(new_batch), 201

# --- UPDATE ROUTES ---
@admin_bp.route('/update-subject/<int:subject_id>', methods=['PUT'])
@admin_required
def update_existing_subject(subject_id):
    data = request.get_json()
    updated_subject = update_subject(
        subject_id, data['name'], data['credits'], data['type']
    )
    if updated_subject:
        return jsonify(updated_subject), 200
    return jsonify({"message": "Subject not found"}), 404

@admin_bp.route('/update-faculty/<int:faculty_id>', methods=['PUT'])
@admin_required
def update_existing_faculty(faculty_id):
    data = request.get_json()
    updated_faculty = update_faculty(
        faculty_id, data['name'], data['expertise']
    )
    if updated_faculty:
        return jsonify(updated_faculty), 200
    return jsonify({"message": "Faculty not found"}), 404

@admin_bp.route('/update-room/<int:room_id>', methods=['PUT'])
@admin_required
def update_existing_room(room_id):
    data = request.get_json()
    updated_room = update_room(
        room_id, data['name'], data['capacity'], data['type']
    )
    if updated_room:
        return jsonify(updated_room), 200
    return jsonify({"message": "Room not found"}), 404

@admin_bp.route('/update-batch/<int:batch_id>', methods=['PUT'])
@admin_required
def update_existing_batch(batch_id):
    data = request.get_json()
    updated_batch = update_batch(
        batch_id, data['name'], data['strength'], data['subjects']
    )
    if updated_batch:
        return jsonify(updated_batch), 200
    return jsonify({"message": "Batch not found"}), 404

# --- DELETE ROUTES ---
@admin_bp.route('/delete-subject/<int:subject_id>', methods=['DELETE'])
@admin_required
def delete_existing_subject(subject_id):
    if delete_subject(subject_id):
        return jsonify({"message": "Subject deleted successfully"}), 200
    return jsonify({"message": "Subject not found"}), 404

@admin_bp.route('/delete-faculty/<int:faculty_id>', methods=['DELETE'])
@admin_required
def delete_existing_faculty(faculty_id):
    if delete_faculty(faculty_id):
        return jsonify({"message": "Faculty deleted successfully"}), 200
    return jsonify({"message": "Faculty not found"}), 404

@admin_bp.route('/delete-room/<int:room_id>', methods=['DELETE'])
@admin_required
def delete_existing_room(room_id):
    if delete_room(room_id):
        return jsonify({"message": "Room deleted successfully"}), 200
    return jsonify({"message": "Room not found"}), 404

@admin_bp.route('/delete-batch/<int:batch_id>', methods=['DELETE'])
@admin_required
def delete_existing_batch(batch_id):
    if delete_batch(batch_id):
        return jsonify({"message": "Batch deleted successfully"}), 200
    return jsonify({"message": "Batch not found"}), 404


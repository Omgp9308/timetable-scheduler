from flask import Blueprint, jsonify, request
from functools import wraps
import traceback # Import traceback for detailed error logging
from sqlalchemy.exc import IntegrityError # Import the specific error for duplicate entries

# Import data access functions
from data import (
    get_subjects, get_faculty, get_rooms, get_batches,
    add_subject, add_faculty, add_room, add_batch,
    delete_subject, delete_faculty, delete_room, delete_batch,
    update_subject, update_faculty, update_room, update_batch
)
from database import db # Import the db instance for session management
# Import the main function from our optimization engine
from optimizer.solver import generate_timetable

# Define the blueprint for admin routes
admin_bp = Blueprint('admin_api', __name__)

# --- Security Decorator ---
def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # In a real app, you would validate a JWT or session here.
        # This is a placeholder for development.
        return f(*args, **kwargs)
    return decorated_function

# --- GET (Read) Routes ---

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

# --- POST (Create) Routes with Improved Error Handling ---

@admin_bp.route('/add-subject', methods=['POST'])
@admin_required
def add_new_subject():
    """Adds a new subject."""
    data = request.get_json()
    try:
        if not data or 'name' not in data or 'credits' not in data or 'type' not in data:
            return jsonify({"status": "error", "message": "Missing required fields."}), 400
        
        name = data['name']
        credits = int(data['credits'])
        subject_type = data['type']

        new_subject = add_subject(name, credits, subject_type)
        return jsonify({"status": "success", "message": "Subject added successfully.", "subject": new_subject}), 201
    
    except IntegrityError:
        db.session.rollback() # Important: Rollback the failed transaction
        return jsonify({"status": "error", "message": "A subject with this name already exists."}), 409 # 409 Conflict is the correct status code

    except (ValueError, TypeError):
        return jsonify({"status": "error", "message": "Invalid data format. 'credits' must be a number."}), 400
    except Exception as e:
        print("--- UNEXPECTED ERROR ---")
        print(traceback.format_exc())
        print("--- END TRACEBACK ---")
        return jsonify({"status": "error", "message": "An internal server error occurred."}), 500

@admin_bp.route('/add-faculty', methods=['POST'])
@admin_required
def add_new_faculty():
    """Adds a new faculty member."""
    data = request.get_json()
    try:
        if not data or 'name' not in data or 'expertise' not in data:
            return jsonify({"status": "error", "message": "Missing required fields."}), 400
        new_faculty = add_faculty(data['name'], data['expertise'])
        return jsonify({"status": "success", "message": "Faculty added successfully.", "faculty": new_faculty}), 201
    except IntegrityError:
        db.session.rollback()
        return jsonify({"status": "error", "message": "A faculty member with this name already exists."}), 409
    except Exception as e:
        print("--- UNEXPECTED ERROR ---")
        print(traceback.format_exc())
        print("--- END TRACEBACK ---")
        return jsonify({"status": "error", "message": "An internal server error occurred."}), 500

@admin_bp.route('/add-room', methods=['POST'])
@admin_required
def add_new_room():
    """Adds a new room or lab."""
    data = request.get_json()
    try:
        if not data or 'name' not in data or 'capacity' not in data or 'type' not in data:
            return jsonify({"status": "error", "message": "Missing required fields."}), 400

        name = data['name']
        capacity = int(data['capacity'])
        room_type = data['type']

        new_room = add_room(name, capacity, room_type)
        return jsonify({"status": "success", "message": "Room added successfully.", "room": new_room}), 201
    except IntegrityError:
        db.session.rollback()
        return jsonify({"status": "error", "message": "A room with this name already exists."}), 409
    except (ValueError, TypeError):
        return jsonify({"status": "error", "message": "Invalid data format. 'capacity' must be a number."}), 400
    except Exception as e:
        print("--- UNEXPECTED ERROR ---")
        print(traceback.format_exc())
        print("--- END TRACEBACK ---")
        return jsonify({"status": "error", "message": "An internal server error occurred."}), 500

@admin_bp.route('/add-batch', methods=['POST'])
@admin_required
def add_new_batch():
    """Adds a new student batch."""
    data = request.get_json()
    try:
        if not data or 'name' not in data or 'strength' not in data or 'subjects' not in data:
            return jsonify({"status": "error", "message": "Missing required fields."}), 400

        name = data['name']
        strength = int(data['strength'])
        subjects = data['subjects']

        new_batch = add_batch(name, strength, subjects)
        return jsonify({"status": "success", "message": "Batch added successfully.", "batch": new_batch}), 201
    except IntegrityError:
        db.session.rollback()
        return jsonify({"status": "error", "message": "A batch with this name already exists."}), 409
    except (ValueError, TypeError):
        return jsonify({"status": "error", "message": "Invalid data format. 'strength' must be a number."}), 400
    except Exception as e:
        print("--- UNEXPECTED ERROR ---")
        print(traceback.format_exc())
        print("--- END TRACEBACK ---")
        return jsonify({"status": "error", "message": "An internal server error occurred."}), 500


# --- PUT (Update) Routes ---

@admin_bp.route('/update-subject/<int:subject_id>', methods=['PUT'])
@admin_required
def update_existing_subject(subject_id):
    data = request.get_json()
    try:
        updated_subject = update_subject(subject_id, data)
        return jsonify({"status": "success", "message": "Subject updated successfully.", "subject": updated_subject})
    except IntegrityError:
        db.session.rollback()
        return jsonify({"status": "error", "message": "Another subject with this name already exists."}), 409
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@admin_bp.route('/update-faculty/<int:faculty_id>', methods=['PUT'])
@admin_required
def update_existing_faculty(faculty_id):
    data = request.get_json()
    try:
        updated_faculty = update_faculty(faculty_id, data)
        return jsonify({"status": "success", "message": "Faculty updated successfully.", "faculty": updated_faculty})
    except IntegrityError:
        db.session.rollback()
        return jsonify({"status": "error", "message": "Another faculty member with this name already exists."}), 409
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@admin_bp.route('/update-room/<int:room_id>', methods=['PUT'])
@admin_required
def update_existing_room(room_id):
    data = request.get_json()
    try:
        updated_room = update_room(room_id, data)
        return jsonify({"status": "success", "message": "Room updated successfully.", "room": updated_room})
    except IntegrityError:
        db.session.rollback()
        return jsonify({"status": "error", "message": "Another room with this name already exists."}), 409
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@admin_bp.route('/update-batch/<int:batch_id>', methods=['PUT'])
@admin_required
def update_existing_batch(batch_id):
    data = request.get_json()
    try:
        updated_batch = update_batch(batch_id, data)
        return jsonify({"status": "success", "message": "Batch updated successfully.", "batch": updated_batch})
    except IntegrityError:
        db.session.rollback()
        return jsonify({"status": "error", "message": "Another batch with this name already exists."}), 409
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


# --- DELETE Routes ---

@admin_bp.route('/delete-subject/<int:subject_id>', methods=['DELETE'])
@admin_required
def delete_existing_subject(subject_id):
    try:
        delete_subject(subject_id)
        return jsonify({"status": "success", "message": "Subject deleted successfully."})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@admin_bp.route('/delete-faculty/<int:faculty_id>', methods=['DELETE'])
@admin_required
def delete_existing_faculty(faculty_id):
    try:
        delete_faculty(faculty_id)
        return jsonify({"status": "success", "message": "Faculty deleted successfully."})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@admin_bp.route('/delete-room/<int:room_id>', methods=['DELETE'])
@admin_required
def delete_existing_room(room_id):
    try:
        delete_room(room_id)
        return jsonify({"status": "success", "message": "Room deleted successfully."})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@admin_bp.route('/delete-batch/<int:batch_id>', methods=['DELETE'])
@admin_required
def delete_existing_batch(batch_id):
    try:
        delete_batch(batch_id)
        return jsonify({"status": "success", "message": "Batch deleted successfully."})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

# --- Timetable Generation ---

@admin_bp.route('/generate', methods=['POST'])
@admin_required
def trigger_generation():
    """
    Triggers the timetable generation process.
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
        print("--- UNEXPECTED ERROR ---")
        print(traceback.format_exc())
        print("--- END TRACEBACK ---")
        return jsonify({"status": "error", "message": "An internal server error occurred."}), 500

# --- Timetable Publishing ---

from .public_routes import update_published_timetable

@admin_bp.route('/publish', methods=['POST'])
@admin_required
def publish_new_timetable():
    """
    Receives a generated timetable from the admin and sets it as the
    new public timetable.
    """
    new_timetable_data = request.get_json()
    if not new_timetable_data:
        return jsonify({"status": "error", "message": "No timetable data provided."}), 400
    try:
        update_published_timetable(new_timetable_data)
        return jsonify({
            "status": "success",
            "message": "Timetable has been successfully published and is now live."
        }), 200
    except Exception as e:
        print("--- UNEXPECTED ERROR ---")
        print(traceback.format_exc())
        print("--- END TRACEBACK ---")
        return jsonify({"status": "error", "message": "An internal server error occurred."}), 500


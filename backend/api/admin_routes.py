from functools import wraps
from flask import Blueprint, jsonify, request, g, current_app
import jwt
import traceback

# Import all necessary data access functions
from data import (
    get_subjects, get_faculty, get_rooms, get_batches,
    add_subject, add_faculty, add_room, add_batch,
    update_subject, delete_subject, update_room, delete_room, update_batch, delete_batch,
    save_timetable_draft, get_timetables_by_status, update_timetable_status,
    add_department, get_departments, add_user, get_users
)
from database import db, User
from sqlalchemy.exc import IntegrityError
from optimizer.solver import generate_timetable
from .public_routes import update_published_timetable

admin_bp = Blueprint('admin_api', __name__)

# --- JWT-BASED SECURITY DECORATOR ---

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        auth_header = request.headers.get('Authorization')
        if auth_header:
            try:
                token = auth_header.split(" ")[1]
            except IndexError:
                return jsonify({'message': 'Bearer token malformed.'}), 401

        if not token:
            return jsonify({'message': 'Token is missing!'}), 401

        try:
            # Decode the token and attach the payload to the global g object
            data = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=["HS256"])
            # Load the full user object to ensure it's valid and for easy access
            g.current_user_id = data['sub']
            g.current_user_role = data['role']
            g.current_user_dept_id = data.get('dept')
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token has expired!'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'message': 'Token is invalid!'}), 401
        
        return f(*args, **kwargs)
    return decorated

# --- ROLE-SPECIFIC DECORATORS ---

def admin_required(f):
    @wraps(f)
    @token_required
    def decorated(*args, **kwargs):
        if g.current_user_role != 'Admin':
            return jsonify({'message': 'Admin access required!'}), 403
        return f(*args, **kwargs)
    return decorated

def hod_required(f):
    @wraps(f)
    @token_required
    def decorated(*args, **kwargs):
        if g.current_user_role not in ['HOD', 'Admin']:
            return jsonify({'message': 'HOD access or higher required!'}), 403
        if g.current_user_dept_id is None:
             return jsonify({'message': 'HOD must be associated with a department.'}), 403
        return f(*args, **kwargs)
    return decorated

def teacher_required(f):
    @wraps(f)
    @token_required
    def decorated(*args, **kwargs):
        if g.current_user_role not in ['Teacher', 'HOD', 'Admin']:
            return jsonify({'message': 'Teacher access or higher required!'}), 403
        if g.current_user_dept_id is None:
             return jsonify({'message': 'User must be associated with a department.'}), 403
        return f(*args, **kwargs)
    return decorated


# --- ROUTES FOR ADMINS ONLY ---

@admin_bp.route('/departments', methods=['GET', 'POST'])
@admin_required
def manage_departments():
    if request.method == 'POST':
        data = request.get_json()
        if not data or not data.get('name'):
            return jsonify({"message": "Department name is required."}), 400
        try:
            new_dept = add_department(data['name'])
            return jsonify(new_dept), 201
        except IntegrityError:
            db.session.rollback()
            return jsonify({"message": "A department with this name already exists."}), 409
        except Exception as e:
            db.session.rollback()
            return jsonify({"message": f"An error occurred: {str(e)}"}), 500
    else: # GET request
        departments = get_departments()
        return jsonify(departments), 200


@admin_bp.route('/users', methods=['GET', 'POST'])
@admin_required
def manage_users():
    if request.method == 'POST':
        data = request.get_json()
        required_fields = ['username', 'password', 'role']
        if not all(k in data for k in required_fields):
            return jsonify({"message": "Missing required fields: username, password, role."}), 400
        
        # HODs must be assigned to a department
        if data['role'] == 'HOD' and 'department_id' not in data:
            return jsonify({"message": "HOD role requires a 'department_id'."}), 400

        try:
            new_user = add_user(
                username=data['username'], 
                password=data['password'],
                role=data['role'], 
                department_id=data.get('department_id') # Safely get, None for Admin
            )
            # Create a corresponding faculty entry if the user is a Teacher or HOD
            if new_user['role'] in ['HOD', 'Teacher']:
                 add_faculty(
                    name=new_user['username'],  # Default name to username
                    expertise=[], 
                    department_id=new_user['department_id'], 
                    user_id=new_user['id']
                )

            return jsonify(new_user), 201
        except IntegrityError:
            db.session.rollback()
            return jsonify({"message": "Username already exists."}), 409
        except Exception as e:
            db.session.rollback()
            return jsonify({"message": f"An unexpected error occurred: {str(e)}"}), 500
            
    else: # GET request
        users = get_users()
        return jsonify(users), 200


# --- ROUTES FOR HODs (and Admins) ---

@admin_bp.route('/teachers', methods=['POST'])
@hod_required
def add_teacher_to_department():
    data = request.get_json()
    hod_dept_id = g.current_user_dept_id
    
    required_fields = ['name', 'expertise', 'username', 'password']
    if not all(k in data for k in required_fields):
         return jsonify({"message": "Missing required fields for teacher creation."}), 400
    try:
        # Create the user account for the teacher
        teacher_user = add_user(
            username=data['username'], password=data['password'],
            role='Teacher', department_id=hod_dept_id
        )
        # Create the corresponding faculty profile
        new_faculty = add_faculty(
            name=data['name'], expertise=data['expertise'],
            department_id=hod_dept_id, user_id=teacher_user['id']
        )
        return jsonify(new_faculty), 201
    except IntegrityError:
        db.session.rollback()
        return jsonify({"message": "A user with this username or a faculty with this name already exists in your department."}), 409
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"An error occurred: {str(e)}"}), 500

@admin_bp.route('/timetables/approve/<int:timetable_id>', methods=['POST'])
@hod_required
def approve_timetable(timetable_id):
    approver_id = g.current_user_id
    hod_dept_id = g.current_user_dept_id
    
    # The data function should verify that the timetable belongs to the HOD's department
    updated_timetable = update_timetable_status(timetable_id, 'Published', hod_dept_id, approver_id)
    if updated_timetable:
        update_published_timetable(updated_timetable['data'], hod_dept_id)
        return jsonify({"message": "Timetable approved and published.", "timetable": updated_timetable}), 200
    return jsonify({"message": "Timetable not found, does not belong to your department, or is not in a pending state."}), 404

@admin_bp.route('/timetables/reject/<int:timetable_id>', methods=['POST'])
@hod_required
def reject_timetable(timetable_id):
    hod_dept_id = g.current_user_dept_id
    updated_timetable = update_timetable_status(timetable_id, 'Rejected', hod_dept_id)
    if updated_timetable:
        return jsonify({"message": "Timetable rejected.", "timetable": updated_timetable}), 200
    return jsonify({"message": "Timetable not found, does not belong to your department, or is not in a pending state."}), 404

@admin_bp.route('/timetables/pending', methods=['GET'])
@hod_required
def get_pending_timetables_for_hod():
    hod_dept_id = g.current_user_dept_id
    timetables = get_timetables_by_status(hod_dept_id, 'Pending Approval')
    return jsonify(timetables), 200

# --- ROUTES FOR TEACHERS (and HODs, Admins) ---

# This single endpoint fetches all necessary data for the management pages.
@admin_bp.route('/data-for-my-department', methods=['GET'])
@teacher_required
def get_department_data():
    dept_id = g.current_user_dept_id
    all_data = {
        "subjects": get_subjects(dept_id),
        "faculty": get_faculty(dept_id),
        "rooms": get_rooms(dept_id),
        "batches": get_batches(dept_id)
    }
    return jsonify(all_data), 200

# --- Generic CRUD routes for department-specific data ---

@admin_bp.route('/subjects', methods=['POST'])
@teacher_required
def add_subject_route():
    data = request.get_json()
    dept_id = g.current_user_dept_id
    try:
        new_subject = add_subject(name=data['name'], credits=int(data['credits']), subject_type=data['type'], department_id=dept_id)
        return jsonify(new_subject), 201
    except (IntegrityError, ValueError):
        db.session.rollback()
        return jsonify({"message": "Invalid data or a subject with this name already exists in your department."}), 400

@admin_bp.route('/subjects/<int:subject_id>', methods=['PUT', 'DELETE'])
@teacher_required
def manage_subject_route(subject_id):
    dept_id = g.current_user_dept_id
    if request.method == 'PUT':
        data = request.get_json()
        updated = update_subject(subject_id, data, dept_id)
        return jsonify(updated) if updated else (jsonify({"message": "Subject not found or access denied."}), 404)
    elif request.method == 'DELETE':
        success = delete_subject(subject_id, dept_id)
        return jsonify({"message": "Subject deleted."}) if success else (jsonify({"message": "Subject not found or access denied."}), 404)

@admin_bp.route('/rooms', methods=['POST'])
@teacher_required
def add_room_route():
    data = request.get_json()
    dept_id = g.current_user_dept_id
    try:
        new_room = add_room(name=data['name'], capacity=int(data['capacity']), room_type=data['type'], department_id=dept_id)
        return jsonify(new_room), 201
    except (IntegrityError, ValueError):
        db.session.rollback()
        return jsonify({"message": "Invalid data or a room with this name already exists in your department."}), 400

@admin_bp.route('/rooms/<int:room_id>', methods=['PUT', 'DELETE'])
@teacher_required
def manage_room_route(room_id):
    dept_id = g.current_user_dept_id
    if request.method == 'PUT':
        data = request.get_json()
        updated = update_room(room_id, data, dept_id)
        return jsonify(updated) if updated else (jsonify({"message": "Room not found or access denied."}), 404)
    elif request.method == 'DELETE':
        success = delete_room(room_id, dept_id)
        return jsonify({"message": "Room deleted."}) if success else (jsonify({"message": "Room not found or access denied."}), 404)

@admin_bp.route('/batches', methods=['POST'])
@teacher_required
def add_batch_route():
    data = request.get_json()
    dept_id = g.current_user_dept_id
    try:
        new_batch = add_batch(name=data['name'], strength=int(data['strength']), subjects=data['subjects'], department_id=dept_id)
        return jsonify(new_batch), 201
    except (IntegrityError, ValueError):
        db.session.rollback()
        return jsonify({"message": "Invalid data or a batch with this name already exists in your department."}), 400

@admin_bp.route('/batches/<int:batch_id>', methods=['PUT', 'DELETE'])
@teacher_required
def manage_batch_route(batch_id):
    dept_id = g.current_user_dept_id
    if request.method == 'PUT':
        data = request.get_json()
        updated = update_batch(batch_id, data, dept_id)
        return jsonify(updated) if updated else (jsonify({"message": "Batch not found or access denied."}), 404)
    elif request.method == 'DELETE':
        success = delete_batch(batch_id, dept_id)
        return jsonify({"message": "Batch deleted."}) if success else (jsonify({"message": "Batch not found or access denied."}), 404)


# --- Timetable Workflow ---

@admin_bp.route('/generate-and-save', methods=['POST'])
@teacher_required
def generate_and_save_timetable():
    user_dept_id = g.current_user_dept_id
    data = request.get_json()
    name = data.get('name', 'New Timetable Draft')
    
    try:
        solution = generate_timetable(department_id=user_dept_id)
        if solution and solution.get('status') == 'success':
            draft = save_timetable_draft(name, solution['timetable'], user_dept_id)
            return jsonify({"message": "Timetable generated and saved as draft.", "draft": draft}), 200
        else:
            return jsonify(solution or {"message": "Solver failed to find a solution."}), 422
    except Exception as e:
        traceback.print_exc()
        return jsonify({"message": f"An unexpected error occurred during generation: {str(e)}"}), 500

@admin_bp.route('/timetables/submit/<int:timetable_id>', methods=['POST'])
@teacher_required
def submit_timetable_for_approval(timetable_id):
    dept_id = g.current_user_dept_id
    # The update function should check if the timetable belongs to the user's department
    updated_timetable = update_timetable_status(timetable_id, 'Pending Approval', dept_id)
    if updated_timetable:
        return jsonify({"message": "Timetable submitted for approval.", "timetable": updated_timetable}), 200
    return jsonify({"message": "Timetable not found, does not belong to your department, or is not in a draft state."}), 404

@admin_bp.route('/timetables/drafts', methods=['GET'])
@teacher_required
def get_draft_timetables_for_teacher():
    teacher_dept_id = g.current_user_dept_id
    timetables = get_timetables_by_status(teacher_dept_id, 'Draft')
    return jsonify(timetables), 200

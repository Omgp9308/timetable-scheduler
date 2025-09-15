from functools import wraps
from flask import Blueprint, jsonify, request, g, current_app
import jwt
import traceback

# Import all necessary data access functions
from data import (
    get_subjects, get_faculty, get_rooms, get_batches,
    add_subject, add_faculty, add_room, add_batch,
    update_subject, delete_subject, update_room, delete_room, update_batch, delete_batch,
    update_faculty,
    save_timetable_draft, get_timetables_by_status, update_timetable_status,
    add_department, get_departments, update_department, delete_department,
    add_user, get_users, update_user, delete_user
)
from database import db, User, Subject, Room, Batch, Faculty
from sqlalchemy.exc import IntegrityError
from optimizer.solver import generate_timetable

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
            data = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=["HS256"])
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
        if g.current_user_dept_id is None and g.current_user_role != 'Admin':
             return jsonify({'message': 'HOD must be associated with a department.'}), 403
        return f(*args, **kwargs)
    return decorated

def teacher_required(f):
    @wraps(f)
    @token_required
    def decorated(*args, **kwargs):
        if g.current_user_role not in ['Teacher', 'HOD', 'Admin']:
            return jsonify({'message': 'Teacher access or higher required!'}), 403
        if g.current_user_role != 'Admin' and g.current_user_dept_id is None:
             return jsonify({'message': 'User must be associated with a department.'}), 403
        return f(*args, **kwargs)
    return decorated


# --- ADMIN: DASHBOARD ---
@admin_bp.route('/stats', methods=['GET'])
@admin_required
def get_admin_dashboard_stats():
    stats = {
        "subjects": Subject.query.count(),
        "faculty": Faculty.query.count(),
        "rooms": Room.query.count(),
        "batches": Batch.query.count(),
    }
    return jsonify(stats)


# --- ADMIN: DEPARTMENT MANAGEMENT ---

@admin_bp.route('/departments', methods=['GET', 'POST'])
@admin_required
def manage_departments():
    if request.method == 'POST':
        data = request.get_json()
        if not data or not data.get('name'): return jsonify({"message": "Department name is required."}), 400
        try:
            return jsonify(add_department(data['name'])), 201
        except IntegrityError:
            db.session.rollback()
            return jsonify({"message": "A department with this name already exists."}), 409
    return jsonify(get_departments()), 200

@admin_bp.route('/departments/<int:dept_id>', methods=['PUT', 'DELETE'])
@admin_required
def manage_single_department(dept_id):
    if request.method == 'PUT':
        data = request.get_json()
        if not data or not data.get('name'): return jsonify({"message": "Department name is required."}), 400
        try:
            updated = update_department(dept_id, data)
            if not updated: return jsonify({"message": "Department not found."}), 404
            return jsonify(updated), 200
        except IntegrityError:
            db.session.rollback()
            return jsonify({"message": "A department with this name already exists."}), 409
    elif request.method == 'DELETE':
        try:
            success = delete_department(dept_id)
            if not success: return jsonify({"message": "Department not found."}), 404
            return jsonify({"message": "Department deleted successfully."}), 200
        except IntegrityError as e:
            db.session.rollback()
            return jsonify({"message": str(e)}), 409


# --- ADMIN: USER MANAGEMENT ---

# Add OPTIONS method to handle preflight requests for PUT and DELETE on this route
@admin_bp.route('/users/<int:user_id>', methods=['OPTIONS'])
def handle_user_options(user_id):
    return '', 200

@admin_bp.route('/users', methods=['GET', 'POST'])
@admin_required
def manage_users():
    if request.method == 'POST':
        data = request.get_json()
        required = ['username', 'password', 'role']
        if not all(k in data for k in required): return jsonify({"message": "Missing required fields."}), 400
        if data['role'] in ['HOD', 'Teacher'] and not data.get('department_id'): return jsonify({"message": "HOD/Teacher must have a department."}), 400
        try:
            new_user = add_user(username=data['username'], password=data['password'], role=data['role'], department_id=data.get('department_id'))
            if new_user['role'] in ['HOD', 'Teacher']:
                add_faculty(name=new_user['username'], expertise=[], department_id=new_user['department_id'], user_id=new_user['id'])
            return jsonify(new_user), 201
        except IntegrityError:
            db.session.rollback()
            return jsonify({"message": "Username already exists."}), 409
    return jsonify(get_users()), 200

@admin_bp.route('/users/<int:user_id>', methods=['PUT', 'DELETE'])
@admin_required
def manage_single_user(user_id):
    if request.method == 'PUT':
        data = request.get_json()
        try:
            updated = update_user(user_id, data)
            # If the role changes from non-faculty to faculty, create a profile.
            # If the role changes from faculty to non-faculty, delete the profile.
            # This logic is best handled in the client side based on the new role.
            if updated:
                user = User.query.get(user_id)
                if user and user.role in ['HOD', 'Teacher'] and not user.faculty_profile:
                     add_faculty(name=user.username, expertise=[], department_id=user.department_id, user_id=user.id)
                if user and user.role not in ['HOD', 'Teacher'] and user.faculty_profile:
                     db.session.delete(user.faculty_profile)
                     db.session.commit()
            if not updated: return jsonify({"message": "User not found."}), 404
            return jsonify(updated), 200
        except IntegrityError:
            db.session.rollback()
            return jsonify({"message": "Username already exists."}), 409
    elif request.method == 'DELETE':
        success = delete_user(user_id)
        if not success: return jsonify({"message": "User not found."}), 404
        return jsonify({"message": "User and associated faculty profile deleted."}), 200

# --- ADMIN: DATA MANAGEMENT VIEWS ---

@admin_bp.route('/data/subjects/<int:dept_id>', methods=['GET'])
@admin_required
def get_subjects_for_dept(dept_id):
    return jsonify(get_subjects(dept_id)), 200

@admin_bp.route('/data/rooms/<int:dept_id>', methods=['GET'])
@admin_required
def get_rooms_for_dept(dept_id):
    return jsonify(get_rooms(dept_id)), 200

@admin_bp.route('/data/batches/<int:dept_id>', methods=['GET'])
@admin_required
def get_batches_for_dept(dept_id):
    return jsonify(get_batches(dept_id)), 200

@admin_bp.route('/data/faculty/<int:dept_id>', methods=['GET'])
@admin_required
def get_faculty_for_dept(dept_id):
    return jsonify(get_faculty(dept_id)), 200


# --- ROUTES FOR HODs ---

@admin_bp.route('/teachers', methods=['POST'])
@hod_required
def add_teacher_to_department():
    data = request.get_json()
    hod_dept_id = g.current_user_dept_id
    if not all(k in data for k in ['name', 'expertise', 'username', 'password']):
         return jsonify({"message": "Missing required fields."}), 400
    try:
        teacher_user = add_user(username=data['username'], password=data['password'], role='Teacher', department_id=hod_dept_id)
        new_faculty = add_faculty(name=data['name'], expertise=data['expertise'], department_id=hod_dept_id, user_id=teacher_user['id'])
        return jsonify(new_faculty), 201
    except IntegrityError:
        db.session.rollback()
        return jsonify({"message": "Username or faculty name already exists."}), 409

@admin_bp.route('/teachers/<int:user_id>', methods=['OPTIONS'])
@hod_required
def handle_teacher_update_options(user_id):
    # This route will respond to preflight requests for the PUT and DELETE methods
    return '', 200

@admin_bp.route('/teachers/<int:user_id>', methods=['PUT'])
@hod_required
def update_teacher_from_hod(user_id):
    data = request.get_json()
    hod_dept_id = g.current_user_dept_id
    
    user_to_update = User.query.get(user_id)
    if not user_to_update or user_to_update.department_id != hod_dept_id:
        return jsonify({"message": "User not found or access denied."}), 404
        
    try:
        updated = update_user(user_id, data)
        # Update faculty profile if it exists
        if updated and updated['role'] in ['HOD', 'Teacher'] and updated['department_id'] == hod_dept_id:
            faculty_profile = Faculty.query.filter_by(user_id=user_id).first()
            if faculty_profile:
                update_faculty(faculty_profile.id, {'name': updated['username'], 'expertise': data.get('expertise') or []}, hod_dept_id)
        
        return jsonify(updated), 200
    except IntegrityError:
        db.session.rollback()
        return jsonify({"message": "Username or faculty name already exists."}), 409
    except Exception as e:
        return jsonify({"message": str(e)}), 400

@admin_bp.route('/teachers/<int:user_id>', methods=['DELETE'])
@hod_required
def delete_teacher_from_hod(user_id):
    hod_dept_id = g.current_user_dept_id
    user_to_delete = User.query.get(user_id)
    
    if not user_to_delete or user_to_delete.department_id != hod_dept_id:
        return jsonify({"message": "User not found or access denied."}), 404
    
    try:
        success = delete_user(user_id)
        if not success:
            return jsonify({"message": "User not found or delete failed."}), 404
        return jsonify({"message": "User and associated faculty profile deleted."}), 200
    except IntegrityError as e:
        db.session.rollback()
        return jsonify({"message": str(e)}), 409


@admin_bp.route('/timetables/approve/<int:timetable_id>', methods=['POST'])
@hod_required
def approve_timetable(timetable_id):
    updated = update_timetable_status(timetable_id, 'Published', g.current_user_dept_id, g.current_user_id)
    if updated: return jsonify({"message": "Timetable approved and published."}), 200
    return jsonify({"message": "Action failed."}), 404

@admin_bp.route('/timetables/reject/<int:timetable_id>', methods=['POST'])
@hod_required
def reject_timetable(timetable_id):
    updated = update_timetable_status(timetable_id, 'Rejected', g.current_user_dept_id)
    if updated: return jsonify({"message": "Timetable rejected."}), 200
    return jsonify({"message": "Action failed."}), 404

@admin_bp.route('/timetables/pending', methods=['GET'])
@hod_required
def get_pending_timetables_for_hod():
    return jsonify(get_timetables_by_status(g.current_user_dept_id, 'Pending Approval')), 200

# --- ROUTES FOR TEACHERS, HODs, AND ADMINS (UNIVERSAL CRUD) ---

@admin_bp.route('/data-for-my-department', methods=['GET'])
@teacher_required
def get_department_data():
    if g.current_user_role == 'Admin': return jsonify({"message": "Endpoint for department-scoped users."}), 400
    all_data = {
        "subjects": get_subjects(g.current_user_dept_id), "faculty": get_faculty(g.current_user_dept_id),
        "rooms": get_rooms(g.current_user_dept_id), "batches": get_batches(g.current_user_dept_id)
    }
    return jsonify(all_data), 200

# Universal CRUD routes
@admin_bp.route('/subjects', methods=['POST'])
@teacher_required
def add_subject_route():
    data = request.get_json(); dept_id = g.current_user_dept_id
    if g.current_user_role == 'Admin':
        dept_id = data.get('department_id')
        if not dept_id: return jsonify({"message": "Admin must provide a 'department_id'."}), 400
    try:
        return jsonify(add_subject(data['name'], int(data['credits']), data['type'], dept_id)), 201
    except Exception: db.session.rollback(); return jsonify({"message": "Invalid data or subject exists."}), 400

@admin_bp.route('/subjects/<int:subject_id>', methods=['PUT', 'DELETE'])
@teacher_required
def manage_subject_route(subject_id):
    dept_id = g.current_user_dept_id
    if g.current_user_role == 'Admin':
        item = Subject.query.get(subject_id); dept_id = item.department_id if item else None
    if request.method == 'PUT':
        updated = update_subject(subject_id, request.get_json(), dept_id)
        return jsonify(updated) if updated else (jsonify({"message": "Not found or access denied."}), 404)
    else:
        success = delete_subject(subject_id, dept_id)
        return jsonify({"message": "Deleted."}) if success else (jsonify({"message": "Not found or access denied."}), 404)

@admin_bp.route('/rooms', methods=['POST'])
@teacher_required
def add_room_route():
    data = request.get_json(); dept_id = g.current_user_dept_id
    if g.current_user_role == 'Admin':
        dept_id = data.get('department_id')
        if not dept_id: return jsonify({"message": "Admin must provide a 'department_id'."}), 400
    try:
        return jsonify(add_room(data['name'], int(data['capacity']), data['type'], dept_id)), 201
    except Exception: db.session.rollback(); return jsonify({"message": "Invalid data or room exists."}), 400

@admin_bp.route('/rooms/<int:room_id>', methods=['PUT', 'DELETE'])
@teacher_required
def manage_room_route(room_id):
    dept_id = g.current_user_dept_id
    if g.current_user_role == 'Admin':
        item = Room.query.get(room_id); dept_id = item.department_id if item else None
    if request.method == 'PUT':
        updated = update_room(room_id, request.get_json(), dept_id)
        return jsonify(updated) if updated else (jsonify({"message": "Not found or access denied."}), 404)
    else:
        success = delete_room(room_id, dept_id)
        return jsonify({"message": "Deleted."}) if success else (jsonify({"message": "Not found or access denied."}), 404)

@admin_bp.route('/batches/<int:batch_id>', methods=['PUT', 'DELETE'])
@teacher_required
def manage_batch_route(batch_id):
    dept_id = g.current_user_dept_id
    if g.current_user_role == 'Admin':
        item = Batch.query.get(batch_id); dept_id = item.department_id if item else None
    if request.method == 'PUT':
        updated = update_batch(batch_id, request.get_json(), dept_id)
        return jsonify(updated) if updated else (jsonify({"message": "Not found or access denied."}), 404)
    else:
        success = delete_batch(batch_id, dept_id)
        return jsonify({"message": "Deleted."}) if success else (jsonify({"message": "Not found or access denied."}), 404)

@admin_bp.route('/faculty/<int:faculty_id>', methods=['PUT'])
@admin_required # Only Admins can edit faculty this way
def manage_faculty_route(faculty_id):
    item = Faculty.query.get(faculty_id)
    if not item: return jsonify({"message": "Faculty not found."}), 404

    updated = update_faculty(faculty_id, request.get_json(), item.department_id)
    return jsonify(updated) if updated else (jsonify({"message": "Update failed."}), 404)


# --- Timetable Workflow ---
@admin_bp.route('/generate-and-save', methods=['POST'])
@teacher_required
def generate_and_save_timetable():
    if g.current_user_role == 'Admin': return jsonify({"message": "Only department users can generate timetables."}), 403
    name = request.get_json().get('name', 'New Draft')
    try:
        solution = generate_timetable(department_id=g.current_user_dept_id)
        if solution.get('status') == 'success':
            draft = save_timetable_draft(name, solution['timetable'], g.current_user_dept_id)
            return jsonify({"message": "Timetable generated and saved.", "draft": draft}), 200
        return jsonify(solution), 422
    except Exception as e:
        traceback.print_exc()
        return jsonify({"message": f"An error occurred: {str(e)}"}), 500

@admin_bp.route('/timetables/submit/<int:timetable_id>', methods=['POST'])
@teacher_required
def submit_for_approval(timetable_id):
    if g.current_user_role == 'Admin': return jsonify({"message": "Not applicable for Admins."}), 403
    updated = update_timetable_status(timetable_id, 'Pending Approval', g.current_user_dept_id)
    if updated: return jsonify({"message": "Timetable submitted."}), 200
    return jsonify({"message": "Action failed."}), 404

@admin_bp.route('/timetables/drafts', methods=['GET'])
@teacher_required
def get_drafts_for_teacher():
    if g.current_user_role == 'Admin': return jsonify({"message": "Not applicable for Admins."}), 403
    return jsonify(get_timetables_by_status(g.current_user_dept_id, 'Draft')), 200
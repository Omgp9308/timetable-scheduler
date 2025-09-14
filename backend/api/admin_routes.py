from functools import wraps
from flask import Blueprint, jsonify, request, g, current_app
import jwt
import traceback

# Import all necessary data access functions
from data import (
    get_subjects, get_faculty, get_rooms, get_batches,
    add_subject, add_faculty, add_room, add_batch,
    save_timetable_draft, get_timetables_by_status, update_timetable_status,
    add_department, get_departments, add_user, get_users
)
from database import db
from sqlalchemy.exc import IntegrityError
from optimizer.solver import generate_timetable
from .public_routes import update_published_timetable

admin_bp = Blueprint('admin_api', __name__)

# --- JWT-BASED SECURITY DECORATOR ---

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            token = request.headers['Authorization'].split(" ")[1]

        if not token:
            return jsonify({'message': 'Token is missing!'}), 401

        try:
            data = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=["HS256"])
            g.current_user = data
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
        if g.current_user['role'] != 'Admin':
            return jsonify({'message': 'Admin access required!'}), 403
        return f(*args, **kwargs)
    return decorated

def hod_required(f):
    @wraps(f)
    @token_required
    def decorated(*args, **kwargs):
        if g.current_user['role'] not in ['HOD', 'Admin']:
            return jsonify({'message': 'HOD access or higher required!'}), 403
        return f(*args, **kwargs)
    return decorated

def teacher_required(f):
    @wraps(f)
    @token_required
    def decorated(*args, **kwargs):
        if g.current_user['role'] not in ['Teacher', 'HOD', 'Admin']:
            return jsonify({'message': 'Teacher access or higher required!'}), 403
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
            return jsonify({"message": f"An error occurred: {str(e)}"}), 500
    else: # GET request
        try:
            departments = get_departments()
            return jsonify(departments), 200
        except Exception as e:
            return jsonify({"message": f"An error occurred: {str(e)}"}), 500


@admin_bp.route('/users', methods=['GET', 'POST'])
@admin_required
def manage_users():
    if request.method == 'POST':
        data = request.get_json()
        try:
            if not all(k in data for k in ['username', 'password', 'role']):
                return jsonify({"message": "Missing required fields."}), 400
            if data['role'] in ['HOD', 'Teacher'] and 'department_id' not in data:
                return jsonify({"message": "HOD/Teacher must have a department."}), 400
            new_user = add_user(
                username=data['username'], password=data['password'],
                role=data['role'], department_id=data.get('department_id')
            )
            return jsonify(new_user), 201
        except IntegrityError:
            db.session.rollback()
            return jsonify({"message": "Username already exists."}), 409
        except Exception as e:
            return jsonify({"message": f"An error occurred: {str(e)}"}), 500
    else: # GET request
        try:
            users = get_users()
            return jsonify(users), 200
        except Exception as e:
            return jsonify({"message": f"An error occurred: {str(e)}"}), 500


# --- ROUTES FOR HODs (and Admins) ---

@admin_bp.route('/teachers', methods=['POST'])
@hod_required
def add_teacher_to_department():
    data = request.get_json()
    hod_dept_id = g.current_user['dept']
    try:
        if not all(k in data for k in ['name', 'expertise', 'username', 'password']):
             return jsonify({"message": "Missing required fields."}), 400
        teacher_user = add_user(
            username=data['username'], password=data['password'],
            role='Teacher', department_id=hod_dept_id
        )
        new_faculty = add_faculty(
            name=data['name'], expertise=data['expertise'],
            department_id=hod_dept_id, user_id=teacher_user['id']
        )
        return jsonify(new_faculty), 201
    except IntegrityError:
        db.session.rollback()
        return jsonify({"message": "Username or faculty name already exists."}), 409
    except Exception as e:
        return jsonify({"message": f"An error occurred: {str(e)}"}), 500

@admin_bp.route('/timetables/approve/<int:timetable_id>', methods=['POST'])
@hod_required
def approve_timetable(timetable_id):
    # Additional logic needed here to ensure HOD can only approve for their own department
    approver_id = g.current_user['sub']
    updated_timetable = update_timetable_status(timetable_id, 'Published', approver_id)
    if updated_timetable:
        update_published_timetable(updated_timetable['data'])
        return jsonify({"message": "Timetable approved and published.", "timetable": updated_timetable}), 200
    return jsonify({"message": "Timetable not found or not in pending state."}), 404

@admin_bp.route('/timetables/reject/<int:timetable_id>', methods=['POST'])
@hod_required
def reject_timetable(timetable_id):
    # Additional logic needed here to ensure HOD can only reject for their own department
    updated_timetable = update_timetable_status(timetable_id, 'Rejected')
    if updated_timetable:
        return jsonify({"message": "Timetable rejected.", "timetable": updated_timetable}), 200
    return jsonify({"message": "Timetable not found or not in pending state."}), 404

@admin_bp.route('/timetables/pending', methods=['GET'])
@hod_required
def get_pending_timetables_for_hod():
    hod_dept_id = g.current_user['dept']
    timetables = get_timetables_by_status(hod_dept_id, 'Pending Approval')
    return jsonify(timetables), 200

# --- ROUTES FOR TEACHERS (and HODs, Admins) ---

@admin_bp.route('/subjects', methods=['POST'])
@teacher_required
def add_subject_to_department():
    data = request.get_json()
    user_dept_id = g.current_user['dept']
    try:
        new_subject = add_subject(
            name=data['name'], credits=int(data['credits']),
            subject_type=data['type'], department_id=user_dept_id
        )
        return jsonify(new_subject), 201
    except (IntegrityError, ValueError):
        db.session.rollback()
        return jsonify({"message": "Invalid data or duplicate entry."}), 400

@admin_bp.route('/rooms', methods=['POST'])
@teacher_required
def add_room_to_department():
    data = request.get_json()
    user_dept_id = g.current_user['dept']
    try:
        new_room = add_room(
            name=data['name'], capacity=int(data['capacity']),
            room_type=data['type'], department_id=user_dept_id
        )
        return jsonify(new_room), 201
    except (IntegrityError, ValueError):
        db.session.rollback()
        return jsonify({"message": "Invalid data or duplicate entry."}), 400

@admin_bp.route('/batches', methods=['POST'])
@teacher_required
def add_batch_to_department():
    data = request.get_json()
    user_dept_id = g.current_user['dept']
    try:
        new_batch = add_batch(
            name=data['name'], strength=int(data['strength']),
            subjects=data['subjects'], department_id=user_dept_id
        )
        return jsonify(new_batch), 201
    except (IntegrityError, ValueError):
        db.session.rollback()
        return jsonify({"message": "Invalid data or duplicate entry."}), 400

@admin_bp.route('/generate-and-save', methods=['POST'])
@teacher_required
def generate_and_save_timetable():
    user_dept_id = g.current_user['dept']
    data = request.get_json()
    name = data.get('name', 'New Timetable Draft')
    
    try:
        solution = generate_timetable(department_id=user_dept_id)
        if solution and solution.get('status') == 'success':
            draft = save_timetable_draft(name, solution['timetable'], user_dept_id)
            return jsonify({"message": "Timetable generated and saved as draft.", "draft": draft}), 200
        else:
            return jsonify(solution or {"message": "Solver failed."}), 422
    except Exception as e:
        return jsonify({"message": f"An error occurred: {str(e)}"}), 500

@admin_bp.route('/timetables/submit/<int:timetable_id>', methods=['POST'])
@teacher_required
def submit_timetable_for_approval(timetable_id):
    # Additional logic needed to ensure teacher can only submit their own drafts
    updated_timetable = update_timetable_status(timetable_id, 'Pending Approval')
    if updated_timetable:
        return jsonify({"message": "Timetable submitted for approval.", "timetable": updated_timetable}), 200
    return jsonify({"message": "Timetable not found or not in draft state."}), 404

@admin_bp.route('/timetables/drafts', methods=['GET'])
@teacher_required
def get_draft_timetables_for_teacher():
    teacher_dept_id = g.current_user['dept']
    timetables = get_timetables_by_status(teacher_dept_id, 'Draft')
    return jsonify(timetables), 200

# --- Department Data Route ---
@admin_bp.route('/data-for-my-department', methods=['GET'])
@token_required # Any logged in user (Teacher, HOD, Admin) can access this for their department
def get_department_data():
    dept_id = g.current_user.get('dept')
    if not dept_id:
        # Admins might not have a department, handle this case gracefully
        return jsonify({"subjects": [], "faculty": [], "rooms": [], "batches": []}), 200
        
    all_data = {
        "subjects": get_subjects(dept_id),
        "faculty": get_faculty(dept_id),
        "rooms": get_rooms(dept_id),
        "batches": get_batches(dept_id)
    }
    return jsonify(all_data), 200


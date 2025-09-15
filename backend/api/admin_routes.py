from flask import Blueprint, jsonify, request
from flask_cors import CORS
from auth_middleware import token_required
from models import db, Department, User, Teacher, HOD, Timetable, Batch

# Blueprint
admin_bp = Blueprint("admin_api", __name__)

# ✅ Enable CORS only for this blueprint
CORS(admin_bp, resources={
    r"/*": {
        "origins": [
            "https://timetable-scheduler-mu.vercel.app",  # Production frontend
            "http://localhost:3000"                      # Local dev frontend
        ],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True
    }
})


# -------------------------
# Admin-only routes
# -------------------------

@admin_bp.route("/stats", methods=["GET"])
@token_required
def get_stats(current_user):
    if current_user.role != "Admin":
        return jsonify({"message": "Unauthorized"}), 403

    total_users = User.query.count()
    total_departments = Department.query.count()
    total_teachers = Teacher.query.count()
    total_hods = HOD.query.count()

    return jsonify({
        "total_users": total_users,
        "total_departments": total_departments,
        "total_teachers": total_teachers,
        "total_hods": total_hods,
    })


# -------------------------
# Department CRUD
# -------------------------

@admin_bp.route("/departments", methods=["POST"])
@token_required
def add_department(current_user):
    if current_user.role != "Admin":
        return jsonify({"message": "Unauthorized"}), 403

    data = request.json
    dept = Department(name=data["name"])
    db.session.add(dept)
    db.session.commit()
    return jsonify({"message": "Department added successfully"})


@admin_bp.route("/departments", methods=["GET"])
@token_required
def get_departments(current_user):
    if current_user.role != "Admin":
        return jsonify({"message": "Unauthorized"}), 403

    departments = Department.query.all()
    return jsonify([{"id": d.id, "name": d.name} for d in departments])


@admin_bp.route("/departments/<int:id>", methods=["PUT"])
@token_required
def update_department(current_user, id):
    if current_user.role != "Admin":
        return jsonify({"message": "Unauthorized"}), 403

    dept = Department.query.get_or_404(id)
    data = request.json
    dept.name = data["name"]
    db.session.commit()
    return jsonify({"message": "Department updated successfully"})


@admin_bp.route("/departments/<int:id>", methods=["DELETE"])
@token_required
def delete_department(current_user, id):
    if current_user.role != "Admin":
        return jsonify({"message": "Unauthorized"}), 403

    dept = Department.query.get_or_404(id)
    db.session.delete(dept)
    db.session.commit()
    return jsonify({"message": "Department deleted successfully"})


# -------------------------
# User CRUD
# -------------------------

@admin_bp.route("/users", methods=["GET"])
@token_required
def get_users(current_user):
    if current_user.role != "Admin":
        return jsonify({"message": "Unauthorized"}), 403

    users = User.query.all()
    return jsonify([
        {"id": u.id, "username": u.username, "role": u.role, "department_id": u.department_id}
        for u in users
    ])


@admin_bp.route("/users/<int:id>", methods=["PUT"])
@token_required
def update_user(current_user, id):
    if current_user.role != "Admin":
        return jsonify({"message": "Unauthorized"}), 403

    user = User.query.get_or_404(id)
    data = request.json
    user.username = data.get("username", user.username)
    user.role = data.get("role", user.role)
    user.department_id = data.get("department_id", user.department_id)
    db.session.commit()
    return jsonify({"message": "User updated successfully"})


@admin_bp.route("/users/<int:id>", methods=["DELETE"])
@token_required
def delete_user(current_user, id):
    if current_user.role != "Admin":
        return jsonify({"message": "Unauthorized"}), 403

    user = User.query.get_or_404(id)
    db.session.delete(user)
    db.session.commit()
    return jsonify({"message": "User deleted successfully"})


# -------------------------
# Teacher & HOD routes
# -------------------------

@admin_bp.route("/teachers", methods=["GET"])
@token_required
def get_teachers(current_user):
    if current_user.role != "Admin":
        return jsonify({"message": "Unauthorized"}), 403

    teachers = Teacher.query.all()
    return jsonify([
        {"id": t.id, "name": t.name, "department_id": t.department_id}
        for t in teachers
    ])


@admin_bp.route("/hods", methods=["GET"])
@token_required
def get_hods(current_user):
    if current_user.role != "Admin":
        return jsonify({"message": "Unauthorized"}), 403

    hods = HOD.query.all()
    return jsonify([
        {"id": h.id, "name": h.name, "department_id": h.department_id}
        for h in hods
    ])


# -------------------------
# Timetable routes
# -------------------------

@admin_bp.route("/timetables/generate", methods=["POST"])
@token_required
def generate_timetable(current_user):
    if current_user.role != "Admin":
        return jsonify({"message": "Unauthorized"}), 403

    data = request.json
    timetable = Timetable(department_id=data["department_id"], data="Generated timetable data")
    db.session.add(timetable)
    db.session.commit()
    return jsonify({"message": "Timetable generated successfully"})


@admin_bp.route("/timetables/submit", methods=["POST"])
@token_required
def submit_timetable(current_user):
    if current_user.role != "Admin":
        return jsonify({"message": "Unauthorized"}), 403

    data = request.json
    timetable = Timetable.query.get_or_404(data["id"])
    timetable.data = data["data"]
    db.session.commit()
    return jsonify({"message": "Timetable submitted successfully"})


# -------------------------
# Batch routes
# -------------------------

@admin_bp.route("/batches", methods=["POST"])
@token_required
def add_batch(current_user):
    if current_user.role != "Admin":
        return jsonify({"message": "Unauthorized"}), 403

    data = request.json
    batch = Batch(name=data["name"], department_id=data["department_id"])
    db.session.add(batch)
    db.session.commit()
    return jsonify({"message": "Batch added successfully"})


@admin_bp.route("/batches", methods=["GET"])
@token_required
def get_batches(current_user):
    if current_user.role != "Admin":
        return jsonify({"message": "Unauthorized"}), 403

    batches = Batch.query.all()
    return jsonify([
        {"id": b.id, "name": b.name, "department_id": b.department_id}
        for b in batches
    ])

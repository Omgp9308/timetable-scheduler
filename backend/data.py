import json
from database import db, Department, User, Subject, Faculty, Room, Batch, Timetable
from sqlalchemy.orm import joinedload
from sqlalchemy.exc import IntegrityError

# A global dictionary to cache the published timetable for each department
published_timetables_cache = {}

def clear_published_timetable_cache(department_id):
    """Clears the cache for a specific department."""
    if department_id in published_timetables_cache:
        del published_timetables_cache[department_id]
        print(f"--- Cleared timetable cache for department ID: {department_id} ---")

# --- Department Management ---

def add_department(name):
    new_department = Department(name=name)
    db.session.add(new_department)
    db.session.commit()
    return new_department.to_dict()

def get_departments():
    return [dept.to_dict() for dept in Department.query.order_by(Department.name).all()]

def update_department(dept_id, data):
    department = Department.query.get(dept_id)
    if department:
        department.name = data.get('name', department.name)
        db.session.commit()
        return department.to_dict()
    return None

def delete_department(dept_id):
    department = Department.query.get(dept_id)
    if department:
        if department.users or department.subjects or department.faculty or department.rooms or department.batches:
            # Raise a specific error that the route can catch
            raise IntegrityError("Cannot delete department with associated data.", None, None)
        db.session.delete(department)
        db.session.commit()
        clear_published_timetable_cache(dept_id)
        return True
    return False

# --- User Management ---

def add_user(username, password, role, department_id=None):
    new_user = User(username=username, role=role, department_id=department_id)
    new_user.set_password(password)
    db.session.add(new_user)
    db.session.commit()
    return new_user.to_dict()

def get_users():
    users = User.query.options(joinedload(User.department)).order_by(User.username).all()
    return [user.to_dict() for user in users]

def get_user_by_username(username):
    return User.query.filter_by(username=username).first()

def update_user(user_id, data):
    user = User.query.get(user_id)
    if user:
        user.username = data.get('username', user.username)
        user.role = data.get('role', user.role)
        user.department_id = data.get('department_id', user.department_id)
        if 'password' in data and data['password']:
            user.set_password(data['password'])
        db.session.commit()
        return user.to_dict()
    return None

def delete_user(user_id):
    user = User.query.get(user_id)
    if user:
        db.session.delete(user)
        db.session.commit()
        return True
    return False


# --- Subject Management ---

def add_subject(name, credits, subject_type, department_id):
    new_subject = Subject(name=name, credits=credits, type=subject_type, department_id=department_id)
    db.session.add(new_subject)
    db.session.commit()
    return new_subject.to_dict()

def get_subjects(department_id):
    return [s.to_dict() for s in Subject.query.filter_by(department_id=department_id).order_by(Subject.name).all()]

def update_subject(subject_id, data, department_id):
    subject = Subject.query.filter_by(id=subject_id, department_id=department_id).first()
    if subject:
        subject.name = data.get('name', subject.name)
        subject.credits = int(data.get('credits', subject.credits))
        subject.type = data.get('type', subject.type)
        db.session.commit()
        return subject.to_dict()
    return None

def delete_subject(subject_id, department_id):
    subject = Subject.query.filter_by(id=subject_id, department_id=department_id).first()
    if subject:
        db.session.delete(subject)
        db.session.commit()
        return True
    return False

# --- Faculty Management ---

def add_faculty(name, expertise, department_id, user_id=None):
    expertise_str = ",".join(map(str, expertise))
    new_faculty = Faculty(name=name, expertise=expertise_str, department_id=department_id, user_id=user_id)
    db.session.add(new_faculty)
    db.session.commit()
    return new_faculty.to_dict()

def get_faculty(department_id):
    return [f.to_dict() for f in Faculty.query.filter_by(department_id=department_id).order_by(Faculty.name).all()]

def update_faculty(faculty_id, data, department_id):
    faculty = Faculty.query.filter_by(id=faculty_id, department_id=department_id).first()
    if faculty:
        faculty.name = data.get('name', faculty.name)
        expertise = data.get('expertise', faculty.expertise.split(','))
        faculty.expertise = ",".join(map(str, expertise))
        db.session.commit()
        return faculty.to_dict()
    return None

def delete_faculty(faculty_id, department_id):
    # This is handled by deleting the user, but we provide a direct way for completeness
    faculty = Faculty.query.filter_by(id=faculty_id, department_id=department_id).first()
    if faculty:
        # We should not delete the user here, just the faculty profile.
        # This situation should be rare.
        db.session.delete(faculty)
        db.session.commit()
        return True
    return False


# --- Room Management ---

def add_room(name, capacity, room_type, department_id):
    new_room = Room(name=name, capacity=capacity, type=room_type, department_id=department_id)
    db.session.add(new_room)
    db.session.commit()
    return new_room.to_dict()

def get_rooms(department_id):
    return [r.to_dict() for r in Room.query.filter_by(department_id=department_id).order_by(Room.name).all()]

def update_room(room_id, data, department_id):
    room = Room.query.filter_by(id=room_id, department_id=department_id).first()
    if room:
        room.name = data.get('name', room.name)
        room.capacity = int(data.get('capacity', room.capacity))
        room.type = data.get('type', room.type)
        db.session.commit()
        return room.to_dict()
    return None

def delete_room(room_id, department_id):
    room = Room.query.filter_by(id=room_id, department_id=department_id).first()
    if room:
        db.session.delete(room)
        db.session.commit()
        return True
    return False

# --- Batch Management ---

def add_batch(name, strength, subjects, department_id):
    subjects_str = ",".join(map(str, subjects))
    new_batch = Batch(name=name, strength=strength, subjects=subjects_str, department_id=department_id)
    db.session.add(new_batch)
    db.session.commit()
    return new_batch.to_dict()

def get_batches(department_id):
    return [b.to_dict() for b in Batch.query.filter_by(department_id=department_id).order_by(Batch.name).all()]

def update_batch(batch_id, data, department_id):
    batch = Batch.query.filter_by(id=batch_id, department_id=department_id).first()
    if batch:
        batch.name = data.get('name', batch.name)
        batch.strength = int(data.get('strength', batch.strength))
        subjects = data.get('subjects', batch.subjects.split(','))
        batch.subjects = ",".join(map(str, subjects))
        db.session.commit()
        return batch.to_dict()
    return None

def delete_batch(batch_id, department_id):
    batch = Batch.query.filter_by(id=batch_id, department_id=department_id).first()
    if batch:
        db.session.delete(batch)
        db.session.commit()
        return True
    return False

# --- Timetable Management ---

def save_timetable_draft(name, timetable_data, department_id):
    data_str = json.dumps(timetable_data)
    new_timetable = Timetable(name=name, data=data_str, department_id=department_id, status='Draft')
    db.session.add(new_timetable)
    db.session.commit()
    return new_timetable.to_dict()

def get_timetables_by_status(department_id, status):
    return [t.to_dict() for t in Timetable.query.filter_by(department_id=department_id, status=status).order_by(Timetable.created_at.desc()).all()]

def update_timetable_status(timetable_id, new_status, department_id, approver_id=None):
    timetable = Timetable.query.filter_by(id=timetable_id, department_id=department_id).first()
    if timetable:
        if new_status == 'Pending Approval' and timetable.status != 'Draft': return None
        if new_status in ['Published', 'Rejected'] and timetable.status != 'Pending Approval': return None
        
        timetable.status = new_status
        if new_status == 'Published' and approver_id:
            timetable.approved_by_id = approver_id
            clear_published_timetable_cache(department_id)

        db.session.commit()
        return timetable.to_dict()
    return None

# --- Public Timetable Functions ---
def get_published_timetable(department_id):
    if department_id in published_timetables_cache:
        return published_timetables_cache[department_id]
        
    timetable = Timetable.query.filter_by(department_id=department_id, status='Published').order_by(Timetable.created_at.desc()).first()
    
    if timetable:
        data = json.loads(timetable.data)
        published_timetables_cache[department_id] = data
        return data
    return []

# --- Solver Data Functions ---
def get_timeslots():
    days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
    periods = ["09:00-10:00", "10:00-11:00", "11:00-12:00", "12:00-13:00", "13:00-14:00", "14:00-15:00", "15:00-16:00"]
    return [(day, period) for day in days for period in periods]

def get_constraints():
    return { "max_lectures_per_day_faculty": 4, "lunch_break_slot": "12:00-13:00" }


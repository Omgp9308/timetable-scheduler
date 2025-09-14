import json
from database import db, Department, User, Subject, Faculty, Room, Batch, Timetable

# --- Department Management ---

def add_department(name):
    new_department = Department(name=name)
    db.session.add(new_department)
    db.session.commit()
    return new_department.to_dict()

def get_departments():
    return [dept.to_dict() for dept in Department.query.all()]

# --- User Management ---

def add_user(username, password, role, department_id=None):
    new_user = User(username=username, role=role, department_id=department_id)
    new_user.set_password(password)
    db.session.add(new_user)
    db.session.commit()
    return new_user.to_dict()

def get_users():
    return [user.to_dict() for user in User.query.all()]

def get_user_by_username(username):
    return User.query.filter_by(username=username).first()

# --- Subject Management ---

def add_subject(name, credits, subject_type, department_id):
    new_subject = Subject(name=name, credits=credits, type=subject_type, department_id=department_id)
    db.session.add(new_subject)
    db.session.commit()
    return new_subject.to_dict()

def get_subjects(department_id=None):
    query = Subject.query
    if department_id:
        query = query.filter_by(department_id=department_id)
    return [s.to_dict() for s in query.all()]

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

# --- Faculty (Teacher) Management ---

def add_faculty(name, expertise, department_id, user_id=None):
    expertise_str = ",".join(map(str, expertise))
    new_faculty = Faculty(name=name, expertise=expertise_str, department_id=department_id, user_id=user_id)
    db.session.add(new_faculty)
    db.session.commit()
    return new_faculty.to_dict()

def get_faculty(department_id=None):
    query = Faculty.query
    if department_id:
        query = query.filter_by(department_id=department_id)
    return [f.to_dict() for f in query.all()]

# --- Room Management ---

def add_room(name, capacity, room_type, department_id):
    new_room = Room(name=name, capacity=capacity, type=room_type, department_id=department_id)
    db.session.add(new_room)
    db.session.commit()
    return new_room.to_dict()

def get_rooms(department_id=None):
    query = Room.query
    if department_id:
        query = query.filter_by(department_id=department_id)
    return [r.to_dict() for r in query.all()]

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

def get_batches(department_id=None):
    query = Batch.query
    if department_id:
        query = query.filter_by(department_id=department_id)
    return [b.to_dict() for b in query.all()]

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
    return [t.to_dict() for t in Timetable.query.filter_by(department_id=department_id, status=status).all()]

def update_timetable_status(timetable_id, new_status, approver_id=None):
    timetable = Timetable.query.get(timetable_id)
    if timetable:
        timetable.status = new_status
        if approver_id:
            timetable.approved_by_id = approver_id
        db.session.commit()
        return timetable.to_dict()
    return None

# --- Legacy Functions (for solver, may not need database) ---

def get_timeslots():
    """Defines the weekly schedule structure."""
    days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
    periods = [
        "09:00-10:00", "10:00-11:00", "11:00-12:00",
        "12:00-13:00", # Lunch Break
        "13:00-14:00", "14:00-15:00", "15:00-16:00"
    ]
    return [(day, period) for day in days for period in periods]

def get_constraints():
    """Returns a dictionary of scheduling rules and preferences."""
    return {
        "max_lectures_per_day_faculty": 4,
        "max_consecutive_lectures_faculty": 2,
        "lunch_break_slot": "12:00-13:00",
        "lab_preferred_slots": ["14:00-15:00", "15:00-16:00"],
    }


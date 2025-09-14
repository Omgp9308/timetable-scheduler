# -*- coding: utf-8 -*-
"""
data.py: Data Access Layer

This file contains all the functions that interact with the database.
It abstracts the database logic from the API routes.
"""

from database import db, Subject, Faculty, Room, Batch

# --- GET (Read) Functions ---

def get_subjects():
    """Returns a list of all subjects from the database."""
    return [s.to_dict() for s in Subject.query.all()]

def get_faculty():
    """Returns a list of all faculty from the database."""
    return [f.to_dict() for f in Faculty.query.all()]

def get_rooms():
    """Returns a list of all rooms from the database."""
    return [r.to_dict() for r in Room.query.all()]

def get_batches():
    """Returns a list of all batches from the database."""
    return [b.to_dict() for b in Batch.query.all()]

# --- POST (Create) Functions ---

def add_subject(name, credits, subject_type):
    """Adds a new subject to the database."""
    new_subject = Subject(name=name, credits=credits, type=subject_type)
    db.session.add(new_subject)
    db.session.commit()
    return new_subject.to_dict()

def add_faculty(name, expertise):
    """Adds a new faculty member to the database."""
    # Expertise is stored as a comma-separated string
    expertise_str = ",".join(expertise)
    new_faculty = Faculty(name=name, expertise=expertise_str)
    db.session.add(new_faculty)
    db.session.commit()
    return new_faculty.to_dict()

def add_room(name, capacity, room_type):
    """Adds a new room to the database."""
    new_room = Room(name=name, capacity=capacity, type=room_type)
    db.session.add(new_room)
    db.session.commit()
    return new_room.to_dict()

def add_batch(name, strength, subjects):
    """Adds a new batch to the database."""
    # Subjects are stored as a comma-separated string
    subjects_str = ",".join(subjects)
    new_batch = Batch(name=name, strength=strength, subjects=subjects_str)
    db.session.add(new_batch)
    db.session.commit()
    return new_batch.to_dict()

# --- PUT (Update) Functions ---

def update_subject(subject_id, data):
    """Updates an existing subject."""
    subject = Subject.query.get_or_404(subject_id)
    subject.name = data.get('name', subject.name)
    subject.credits = data.get('credits', subject.credits)
    subject.type = data.get('type', subject.type)
    db.session.commit()
    return subject.to_dict()

def update_faculty(faculty_id, data):
    """Updates an existing faculty member."""
    faculty = Faculty.query.get_or_404(faculty_id)
    faculty.name = data.get('name', faculty.name)
    if 'expertise' in data:
        faculty.expertise = ",".join(data['expertise'])
    db.session.commit()
    return faculty.to_dict()

def update_room(room_id, data):
    """Updates an existing room."""
    room = Room.query.get_or_404(room_id)
    room.name = data.get('name', room.name)
    room.capacity = data.get('capacity', room.capacity)
    room.type = data.get('type', room.type)
    db.session.commit()
    return room.to_dict()

def update_batch(batch_id, data):
    """Updates an existing batch."""
    batch = Batch.query.get_or_404(batch_id)
    batch.name = data.get('name', batch.name)
    batch.strength = data.get('strength', batch.strength)
    if 'subjects' in data:
        batch.subjects = ",".join(data['subjects'])
    db.session.commit()
    return batch.to_dict()

# --- DELETE Functions ---

def delete_subject(subject_id):
    """Deletes a subject from the database."""
    subject = Subject.query.get_or_404(subject_id)
    db.session.delete(subject)
    db.session.commit()

def delete_faculty(faculty_id):
    """Deletes a faculty member from the database."""
    faculty = Faculty.query.get_or_404(faculty_id)
    db.session.delete(faculty)
    db.session.commit()

def delete_room(room_id):
    """Deletes a room from the database."""
    room = Room.query.get_or_404(room_id)
    db.session.delete(room)
    db.session.commit()

def delete_batch(batch_id):
    """Deletes a batch from the database."""
    batch = Batch.query.get_or_404(batch_id)
    db.session.delete(batch)
    db.session.commit()

# --- Non-Database Functions (for Solver) ---

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


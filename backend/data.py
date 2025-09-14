# -*- coding: utf-8 -*-
"""
data.py: Data Access Layer

This module acts as an interface between the application's business logic
and the database. It contains all the functions to query and manipulate
the data in the database, abstracting the database operations from the API routes.
"""

from database import db, Subject, Faculty, Room, Batch

# --- Subject Functions ---

def get_subjects():
    """Returns a list of all subjects from the database."""
    return [s.to_dict() for s in Subject.query.all()]

def add_subject(name, credits, subject_type):
    """Adds a new subject to the database."""
    new_subject = Subject(name=name, credits=credits, type=subject_type)
    db.session.add(new_subject)
    db.session.commit()
    return new_subject.to_dict()

# --- Faculty Functions ---

def get_faculty():
    """Returns a list of all faculty members from the database."""
    return [f.to_dict() for f in Faculty.query.all()]

# --- Room Functions ---

def get_rooms():
    """Returns a list of all rooms from the database."""
    return [r.to_dict() for r in Room.query.all()]

# --- Batch Functions ---

def get_batches():
    """Returns a list of all batches from the database."""
    return [b.to_dict() for b in Batch.query.all()]

# --- Timeslot & Constraint Functions (Still hardcoded as they represent business logic) ---

def get_timeslots():
    """Defines the weekly schedule structure."""
    days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
    periods = [
        "09:00-10:00", "10:00-11:00", "11:00-12:00",
        "12:00-13:00", # Lunch Break
        "13:00-14:00", "14:00-15:00", "15:00-16:00"
    ]
    slots = [(day, period) for day in days for period in periods]
    return slots

def get_constraints():
    """Returns a dictionary of scheduling rules and preferences."""
    constraints = {
        "max_lectures_per_day_faculty": 4,
        "max_consecutive_lectures_faculty": 2,
        "lunch_break_slot": "12:00-13:00",
        "lab_preferred_slots": ["14:00-15:00", "15:00-16:00"], 
    }
    return constraints

# -*- coding: utf-8 -*-
"""
data.py: Data Access Layer

This module acts as an interface between the application's business logic
and the database. It contains all the functions to query and manipulate
the data in the database, abstracting the database operations from the API routes.
"""

from database import db, Subject, Faculty, Room, Batch

# --- Subject Functions ---

def get_subjects():
    """Returns a list of all subjects from the database."""
    return [s.to_dict() for s in Subject.query.all()]

def add_subject(name, credits, subject_type):
    """Adds a new subject to the database."""
    new_subject = Subject(name=name, credits=credits, type=subject_type)
    db.session.add(new_subject)
    db.session.commit()
    return new_subject.to_dict()

# --- Faculty Functions ---

def get_faculty():
    """Returns a list of all faculty members from the database."""
    return [f.to_dict() for f in Faculty.query.all()]

# --- Room Functions ---

def get_rooms():
    """Returns a list of all rooms from the database."""
    return [r.to_dict() for r in Room.query.all()]

# --- Batch Functions ---

def get_batches():
    """Returns a list of all batches from the database."""
    return [b.to_dict() for b in Batch.query.all()]

# --- Timeslot & Constraint Functions (Still hardcoded as they represent business logic) ---

def get_timeslots():
    """Defines the weekly schedule structure."""
    days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
    periods = [
        "09:00-10:00", "10:00-11:00", "11:00-12:00",
        "12:00-13:00", # Lunch Break
        "13:00-14:00", "14:00-15:00", "15:00-16:00"
    ]
    slots = [(day, period) for day in days for period in periods]
    return slots

def get_constraints():
    """Returns a dictionary of scheduling rules and preferences."""
    constraints = {
        "max_lectures_per_day_faculty": 4,
        "max_consecutive_lectures_faculty": 2,
        "lunch_break_slot": "12:00-13:00",
        "lab_preferred_slots": ["14:00-15:00", "15:00-16:00"], 
    }
    return constraints


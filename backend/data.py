# -*- coding: utf-8 -*-
"""
data.py: Data Access Layer

This file now acts as an interface between the application's logic and the
database. It contains functions to query or add data to the database,
abstracting the direct database interaction from the API routes.
"""

from .database import db, Subject, Faculty, Room, Batch
from .database import subject_to_dict, faculty_to_dict, room_to_dict, batch_to_dict

# --- Data Query Functions ---

def get_subjects():
    """Returns a list of all subjects from the database."""
    subjects = Subject.query.all()
    return [subject_to_dict(s) for s in subjects]

def get_faculty():
    """Returns a list of all faculty members from the database."""
    faculty = Faculty.query.all()
    return [faculty_to_dict(f) for f in faculty]

def get_rooms():
    """Returns a list of all rooms from the database."""
    rooms = Room.query.all()
    return [room_to_dict(r) for r in rooms]

def get_batches():
    """Returns a list of all student batches from the database."""
    batches = Batch.query.all()
    return [batch_to_dict(b) for b in batches]

# --- Data Modification Functions ---

def add_subject(data):
    """Adds a new subject to the database."""
    new_subject = Subject(
        id=data['id'],
        name=data['name'],
        credits=data['credits'],
        type=data['type']
    )
    db.session.add(new_subject)
    db.session.commit()
    return subject_to_dict(new_subject)

# --- Static Configuration ---
# These functions don't need to be in the database as they define
# the core structure and rules of the timetable, not user-editable data.

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
    """Returns a dictionary of fixed scheduling rules."""
    return {
        "max_lectures_per_day_faculty": 4,
        "max_consecutive_lectures_faculty": 2,
        "lunch_break_slot": "12:00-13:00",
        "lab_preferred_slots": ["14:00-15:00", "15:00-16:00"],
    }


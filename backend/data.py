# -*- coding: utf-8 -*-
"""
data.py: Data Access Layer

This file contains all functions that interact with the database.
It abstracts the database logic from the API routes.
"""
from database import db, Subject, Faculty, Room, Batch

# --- GET Functions ---
def get_subjects():
    """Returns a list of all subjects from the database."""
    return [subject.to_dict() for subject in Subject.query.all()]

def get_faculty():
    """Returns a list of all faculty members from the database."""
    return [f.to_dict() for f in Faculty.query.all()]

def get_rooms():
    """Returns a list of all rooms from the database."""
    return [room.to_dict() for room in Room.query.all()]

def get_batches():
    """Returns a list of all batches from the database."""
    return [batch.to_dict() for batch in Batch.query.all()]

# --- ADD Functions ---
def add_subject(name, credits, type):
    """Adds a new subject to the database."""
    subject = Subject(name=name, credits=credits, type=type)
    db.session.add(subject)
    db.session.commit()
    return subject.to_dict()

def add_faculty(name, expertise):
    """Adds a new faculty member to the database."""
    faculty = Faculty(name=name, expertise=expertise)
    db.session.add(faculty)
    db.session.commit()
    return faculty.to_dict()

def add_room(name, capacity, type):
    """Adds a new room to the database."""
    room = Room(name=name, capacity=capacity, type=type)
    db.session.add(room)
    db.session.commit()
    return room.to_dict()

def add_batch(name, strength, subjects):
    """Adds a new batch to the database."""
    batch = Batch(name=name, strength=strength, subjects=subjects)
    db.session.add(batch)
    db.session.commit()
    return batch.to_dict()

# --- DELETE Functions ---
def delete_subject(subject_id):
    """Deletes a subject from the database by its ID."""
    subject = Subject.query.get(subject_id)
    if subject:
        db.session.delete(subject)
        db.session.commit()
        return True
    return False

def delete_faculty(faculty_id):
    """Deletes a faculty member from the database by their ID."""
    faculty = Faculty.query.get(faculty_id)
    if faculty:
        db.session.delete(faculty)
        db.session.commit()
        return True
    return False

def delete_room(room_id):
    """Deletes a room from the database by its ID."""
    room = Room.query.get(room_id)
    if room:
        db.session.delete(room)
        db.session.commit() 
        return True
    return False

def delete_batch(batch_id):
    """Deletes a batch from the database by its ID."""
    batch = Batch.query.get(batch_id)
    if batch:
        db.session.delete(batch)
        db.session.commit()
        return True
    return False


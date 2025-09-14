# -*- coding: utf-8 -*-
"""
database.py: Sets up the database and defines data models.
"""

from flask_sqlalchemy import SQLAlchemy

# Initialize the SQLAlchemy extension
db = SQLAlchemy()

# --- Database Models ---
# Each class represents a table in the database.

class Subject(db.Model):
    id = db.Column(db.String(50), primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    credits = db.Column(db.Integer, nullable=False)
    type = db.Column(db.String(50), nullable=False)  # 'Theory' or 'Lab'

class Faculty(db.Model):
    id = db.Column(db.String(50), primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    # Storing expertise as a simple comma-separated string
    expertise = db.Column(db.String(300), nullable=False)

class Room(db.Model):
    id = db.Column(db.String(50), primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    capacity = db.Column(db.Integer, nullable=False)
    type = db.Column(db.String(50), nullable=False)  # 'Theory' or 'Lab'

class Batch(db.Model):
    id = db.Column(db.String(50), primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    strength = db.Column(db.Integer, nullable=False)
    # Storing subject IDs as a comma-separated string
    subjects = db.Column(db.String(500), nullable=False)

# --- Helper Functions to Convert Models to Dicts ---
# This is useful for converting SQLAlchemy objects to JSON.

def subject_to_dict(subject):
    return {
        "id": subject.id,
        "name": subject.name,
        "credits": subject.credits,
        "type": subject.type
    }

def faculty_to_dict(faculty):
    return {
        "id": faculty.id,
        "name": faculty.name,
        "expertise": faculty.expertise.split(',') if faculty.expertise else []
    }

def room_to_dict(room):
    return {
        "id": room.id,
        "name": room.name,
        "capacity": room.capacity,
        "type": room.type
    }

def batch_to_dict(batch):
    return {
        "id": batch.id,
        "name": batch.name,
        "strength": batch.strength,
        "subjects": batch.subjects.split(',') if batch.subjects else []
    }


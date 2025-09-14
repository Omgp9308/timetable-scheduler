# -*- coding: utf-8 -*-
"""
data.py: Mock Database Module

This file contains sample data that simulates a real university database.
It provides the raw inputs for the timetable optimization engine, including
subjects, faculty, classrooms, and student batches.
"""

def get_subjects():
    """Returns a list of all subjects to be taught in the semester."""
    subjects = [
        {"id": "CS101", "name": "Introduction to Programming", "credits": 4, "type": "Theory"},
        {"id": "CS101L", "name": "Programming Lab", "credits": 2, "type": "Lab"},
        {"id": "MA201", "name": "Advanced Calculus", "credits": 4, "type": "Theory"},
        {"id": "EE203", "name": "Digital Circuits", "credits": 3, "type": "Theory"},
        {"id": "EE203L", "name": "Digital Circuits Lab", "credits": 2, "type": "Lab"},
        {"id": "PH102", "name": "Engineering Physics", "credits": 3, "type": "Theory"},
        {"id": "HS301", "name": "Professional Ethics", "credits": 2, "type": "Theory"},
        {"id": "CS305", "name": "Operating Systems", "credits": 4, "type": "Theory"},
        {"id": "CS306", "name": "Database Management", "credits": 3, "type": "Theory"},
        {"id": "CS306L", "name": "DBMS Lab", "credits": 2, "type": "Lab"},
    ]
    return subjects

def get_faculty():
    """Returns a list of faculty members with their expertise."""
    faculty = [
        {"id": "F101", "name": "Dr. Alan Turing", "expertise": ["CS101", "CS305"]},
        {"id": "F102", "name": "Dr. Ada Lovelace", "expertise": ["CS101", "CS101L", "CS306"]},
        {"id": "F201", "name": "Dr. Isaac Newton", "expertise": ["MA201", "PH102"]},
        {"id": "F202", "name": "Dr. Marie Curie", "expertise": ["PH102"]},
        {"id": "F301", "name": "Dr. Nikola Tesla", "expertise": ["EE203", "EE203L"]},
        {"id": "F401", "name": "Dr. Socrates", "expertise": ["HS301"]},
        {"id": "F103", "name": "Dr. Grace Hopper", "expertise": ["CS306", "CS306L"]},
    ]
    return faculty

def get_rooms():
    """Returns a list of available rooms and labs with their capacities."""
    rooms = [
        {"id": "CR1", "name": "Classroom 101", "capacity": 60, "type": "Theory"},
        {"id": "CR2", "name": "Classroom 102", "capacity": 60, "type": "Theory"},
        {"id": "CR3", "name": "Seminar Hall A", "capacity": 80, "type": "Theory"},
        {"id": "LAB1", "name": "Computer Lab 1", "capacity": 30, "type": "Lab"},
        {"id": "LAB2", "name": "Computer Lab 2", "capacity": 30, "type": "Lab"},
        {"id": "LAB3", "name": "Electronics Lab", "capacity": 35, "type": "Lab"},
    ]
    return rooms

def get_batches():
    """Returns a list of student batches and the subjects they have enrolled in."""
    batches = [
        {
            "id": "B_CSE_S1", 
            "name": "Computer Science - Sem 1",
            "strength": 55,
            "subjects": ["CS101", "CS101L", "MA201", "PH102"]
        },
        {
            "id": "B_CSE_S3",
            "name": "Computer Science - Sem 3",
            "strength": 50,
            "subjects": ["CS305", "CS306", "CS306L", "EE203", "HS301"]
        },
        {
            "id": "B_EE_S3",
            "name": "Electrical Engineering - Sem 3",
            "strength": 45,
            "subjects": ["EE203", "EE203L", "MA201", "CS101", "HS301"]
        }
    ]
    return batches

def get_timeslots():
    """Defines the weekly schedule structure."""
    days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
    periods = [
        "09:00-10:00",
        "10:00-11:00",
        "11:00-12:00",
        "12:00-13:00", # Lunch Break
        "13:00-14:00",
        "14:00-15:00",
        "15:00-16:00"
    ]
    
    # Generate a list of (day, period) tuples
    slots = [(day, period) for day in days for period in periods]
    return slots

def get_constraints():
    """Returns a dictionary of scheduling rules and preferences."""
    constraints = {
        "max_lectures_per_day_faculty": 4,
        "max_consecutive_lectures_faculty": 2,
        "lunch_break_slot": "12:00-13:00", # No classes should be scheduled here
        # Labs should preferably be in the afternoon
        "lab_preferred_slots": ["14:00-15:00", "15:00-16:00"], 
    }
    return constraints
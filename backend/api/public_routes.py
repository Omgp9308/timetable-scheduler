# -*- coding: utf-8 -*-
"""
public_routes.py: Publicly accessible API routes.

This blueprint handles requests that do not require authentication, such as
fetching the current published timetable or getting the list of available
batches, faculty, and rooms to populate dropdown menus.
"""

from flask import Blueprint, jsonify, request

# Import functions from our mock database
from data import get_batches, get_faculty, get_rooms

# --- In-Memory Cache for the Published Timetable ---
# In a real application, the admin would "publish" a generated timetable,
# which would save it to a database. The public routes would then read from there.
# We'll simulate this with a simple global variable that acts as a cache.
# The `admin_routes` would call a function to update this variable.
# We will pre-populate it with mock data for demonstration purposes.

published_timetable = [
    {"day": "Monday", "timeslot": "09:00-10:00", "batch": "Computer Science - Sem 1", "subject": "Introduction to Programming", "faculty": "Dr. Alan Turing", "room": "Classroom 101"},
    {"day": "Monday", "timeslot": "10:00-11:00", "batch": "Electrical Engineering - Sem 3", "subject": "Digital Circuits", "faculty": "Dr. Nikola Tesla", "room": "Classroom 102"},
    {"day": "Tuesday", "timeslot": "11:00-12:00", "batch": "Computer Science - Sem 3", "subject": "Operating Systems", "faculty": "Dr. Alan Turing", "room": "Seminar Hall A"},
    {"day": "Tuesday", "timeslot": "14:00-15:00", "batch": "Computer Science - Sem 1", "subject": "Engineering Physics", "faculty": "Dr. Marie Curie", "room": "Classroom 101"},
    {"day": "Wednesday", "timeslot": "13:00-14:00", "batch": "Computer Science - Sem 3", "subject": "Professional Ethics", "faculty": "Dr. Socrates", "room": "Seminar Hall A"}
]

def update_published_timetable(new_timetable):
    """
    This function would be called by an admin route after a new timetable
    is successfully generated and approved, updating the public view.
    """
    global published_timetable
    published_timetable = new_timetable
    print("--- Published timetable has been updated. ---")


# Define the blueprint for public routes
public_bp = Blueprint('public_api', __name__)

@public_bp.route('/filters', methods=['GET'])
def get_filter_options():
    """
    Provides the necessary data to populate the dropdown filters on the frontend.
    
    Returns:
        JSON: A dictionary containing lists of batches, faculty, and rooms.
    """
    try:
        batches = [batch['name'] for batch in get_batches()]
        faculty = [f['name'] for f in get_faculty()]
        rooms = [room['name'] for room in get_rooms()]
        
        return jsonify({
            "batches": sorted(batches),
            "faculty": sorted(faculty),
            "rooms": sorted(rooms)
        }), 200
    except Exception as e:
        return jsonify({"message": f"An error occurred: {e}"}), 500


@public_bp.route('/timetable', methods=['GET'])
def get_public_timetable():
    """
    Fetches the timetable based on the provided query parameters.
    
    Query Params:
        type (str): The filter category ('batch', 'faculty', or 'room').
        value (str): The specific value to filter by.
        
    Returns:
        JSON: A list of timetable entries matching the filter.
    """
    filter_type = request.args.get('type')
    filter_value = request.args.get('value')

    if not filter_type or not filter_value:
        return jsonify({"message": "Missing 'type' or 'value' query parameter."}), 400
    
    if filter_type not in ['batch', 'faculty', 'room']:
        return jsonify({"message": "Invalid 'type' parameter. Must be one of: batch, faculty, room."}), 400

    if not published_timetable:
        return jsonify([]), 200 # Return empty list if no timetable is published
        
    # Filter the timetable based on the query
    results = [
        entry for entry in published_timetable 
        if entry.get(filter_type) == filter_value
    ]
    
    return jsonify(results), 200
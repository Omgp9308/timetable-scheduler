# -*- coding: utf-8 -*-
"""
public_routes.py: Publicly accessible API routes.

This blueprint handles requests that do not require authentication, such as
fetching the current published timetable or getting the list of available
batches, faculty, and rooms to populate dropdown menus.
"""

from flask import Blueprint, jsonify, request

# Import functions from our new database-aware data access layer
from data import get_batches, get_faculty, get_rooms, Timetable

# --- In-Memory Cache for the Published Timetable ---
# This is a simple cache that gets updated when a HOD approves a timetable.
# In a larger application, this could be a more robust caching layer (e.g., Redis)
# or just a direct database query.
published_timetable_cache = {
    'data': [],
    'id': None
}

def update_published_timetable(timetable_obj):
    """
    Updates the 'published_timetable_cache' with the data from the approved timetable.
    """
    global published_timetable_cache
    published_timetable_cache['data'] = timetable_obj['data']
    published_timetable_cache['id'] = timetable_obj['id']
    print(f"--- Published timetable cache updated to timetable ID {published_timetable_cache['id']}. ---")


# Define the blueprint for public routes
public_bp = Blueprint('public_api', __name__)

@public_bp.route('/filters', methods=['GET'])
def get_filter_options():
    """
    Provides the necessary data to populate the dropdown filters on the frontend.
    This now fetches data from the database across ALL departments.
    
    Returns:
        JSON: A dictionary containing lists of batches, faculty, and rooms.
    """
    try:
        # The data functions without a department_id will fetch all records
        batches = [batch['name'] for batch in get_batches()]
        faculty = [f['name'] for f in get_faculty()]
        rooms = [room['name'] for room in get_rooms()]
        
        # Using set to ensure unique names before sorting
        return jsonify({
            "batches": sorted(list(set(batches))),
            "faculty": sorted(list(set(faculty))),
            "rooms": sorted(list(set(rooms)))
        }), 200
    except Exception as e:
        print(f"Error in /filters: {e}")
        return jsonify({"message": f"An error occurred: {str(e)}"}), 500


@public_bp.route('/timetable', methods=['GET'])
def get_public_timetable():
    """
    Fetches the currently published timetable based on the provided query parameters.
    It first checks for the latest published timetable in the database, updates a simple
    in-memory cache if it's new, and then serves the filtered request from the cache.
    
    Query Params:
        type (str): The filter category ('batch', 'faculty', or 'room').
        value (str): The specific value to filter by.
        
    Returns:
        JSON: A list of timetable entries matching the filter.
    """
    global published_timetable_cache
    filter_type = request.args.get('type')
    filter_value = request.args.get('value')

    if not filter_type or not filter_value:
        return jsonify({"message": "Missing 'type' or 'value' query parameter."}), 400
    
    if filter_type not in ['batch', 'faculty', 'room']:
        return jsonify({"message": "Invalid 'type' parameter. Must be one of: batch, faculty, room."}), 400

    try:
        # Find the latest published timetable from the database
        latest_published = Timetable.query.filter_by(status='Published').order_by(Timetable.created_at.desc()).first()

        if not latest_published:
             # If nothing is published yet, return empty
            return jsonify([]), 200

        # Simple cache check: if the latest timetable in DB is not what we have in memory, update cache
        if not published_timetable_cache['data'] or published_timetable_cache.get('id') != latest_published.id:
            print("--- Stale cache detected. Updating public timetable cache from database. ---")
            published_timetable_cache['data'] = latest_published.to_dict()['data']
            published_timetable_cache['id'] = latest_published.id

        # Filter the timetable from the cache
        results = [
            entry for entry in published_timetable_cache['data']
            if entry.get(filter_type) == filter_value
        ]
        
        return jsonify(results), 200

    except Exception as e:
        print(f"Error in /timetable: {str(e)}")
        return jsonify({"message": "An error occurred while fetching the public timetable."}), 500

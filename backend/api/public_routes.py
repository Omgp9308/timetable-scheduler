# -*- coding: utf-8 -*-
"""
public_routes.py: Publicly accessible API routes.
"""

from flask import Blueprint, jsonify, request
from data import get_departments, get_batches, get_faculty, get_rooms, get_published_timetable

# This function is now in data.py and is department-specific
# from data import update_published_timetable

public_bp = Blueprint('public_api', __name__)

@public_bp.route('/departments', methods=['GET'])
def get_public_departments():
    """
    Provides a list of all departments so the user can select one.
    """
    try:
        departments = get_departments()
        return jsonify(departments), 200
    except Exception as e:
        return jsonify({"message": f"An error occurred: {e}"}), 500

@public_bp.route('/filters/<int:department_id>', methods=['GET'])
def get_filter_options(department_id):
    """
    Provides the data to populate filters for a SPECIFIC department.
    """
    try:
        batches = [batch['name'] for batch in get_batches(department_id)]
        faculty = [f['name'] for f in get_faculty(department_id)]
        rooms = [room['name'] for room in get_rooms(department_id)]
        
        return jsonify({
            "batches": sorted(batches),
            "faculty": sorted(faculty),
            "rooms": sorted(rooms)
        }), 200
    except Exception as e:
        return jsonify({"message": f"An error occurred: {e}"}), 500


@public_bp.route('/timetable', methods=['GET'])
def get_public_timetable_route():
    """
    Fetches the published timetable for a specific department based on query params.
    """
    department_id = request.args.get('department_id', type=int)
    filter_type = request.args.get('type')
    filter_value = request.args.get('value')

    if not all([department_id, filter_type, filter_value]):
        return jsonify({"message": "Missing required query parameters: department_id, type, value."}), 400
    
    if filter_type not in ['batch', 'faculty', 'room']:
        return jsonify({"message": "Invalid 'type' parameter."}), 400

    # Get the latest published timetable for the department from our data access layer
    published_timetable = get_published_timetable(department_id)
    
    if not published_timetable:
        return jsonify([]), 200
        
    # Filter the timetable based on the query
    results = [
        entry for entry in published_timetable 
        if entry.get(filter_type) == filter_value
    ]
    
    return jsonify(results), 200


# -*- coding: utf-8 -*-
"""
solver.py: The Timetable Optimization Engine

This module contains the logic for solving the timetable scheduling problem.
It uses a backtracking algorithm to solve it as a Constraint Satisfaction Problem (CSP).

The main components are:
- Variables: The individual lectures that need to be scheduled.
- Domains: The set of possible (timeslot, room) pairs for each lecture.
- Constraints: The set of rules that a valid schedule must satisfy.
"""

import random
from copy import deepcopy
from data import get_subjects, get_faculty, get_rooms, get_batches, get_timeslots, get_constraints

class TimetableSolver:
    """
    A class to encapsulate the entire timetable solving process.
    """
    def __init__(self, batches, rooms, faculty, subjects, constraints):
        self.batches = batches
        self.rooms = rooms
        self.faculty = faculty
        self.subjects = {s['id']: s for s in subjects} # Use a dict for easy lookup
        self.constraints = constraints
        self.timeslots = get_timeslots()

        # Pre-process to create a flat list of all lectures to be scheduled
        self.lectures_to_schedule = self._create_lecture_list()
        
        # Solution storage
        self.solution = None

    def _create_lecture_list(self):
        """
        Generates a flat list of every single lecture session that needs a slot.
        Each lecture is a tuple: (batch_id, subject_id).
        The number of sessions for a subject is determined by its 'credits'.
        """
        lectures = []
        for batch in self.batches:
            for subject_id in batch['subjects']:
                # Assuming 'credits' equals hours per week
                credits = self.subjects[subject_id]['credits']
                for _ in range(credits):
                    lectures.append((batch['id'], subject_id))
        
        # Randomizing the order helps the backtracking algorithm avoid getting
        # stuck in the same search path, potentially finding a solution faster.
        random.shuffle(lectures)
        return lectures

    def solve(self):
        """
        Public method to start the solving process.
        """
        initial_schedule = {} # An empty schedule
        if self._backtrack(self.lectures_to_schedule, initial_schedule):
            # Format the solution into a more user-friendly list
            return self._format_solution(self.solution)
        else:
            return None # No solution found

    def _backtrack(self, lectures, schedule):
        """
        The core recursive backtracking algorithm.
        
        Args:
            lectures (list): A list of remaining lectures to be scheduled.
            schedule (dict): The current state of the schedule. 
                             Key: (day, timeslot), Value: list of assignments
        
        Returns:
            bool: True if a solution is found, False otherwise.
        """
        # Base case: If there are no more lectures to schedule, we found a solution.
        if not lectures:
            self.solution = schedule
            return True

        # Take the next lecture to schedule
        lecture_to_schedule = lectures[0]
        remaining_lectures = lectures[1:]
        
        batch_id, subject_id = lecture_to_schedule
        
        # Iterate through all possible timeslots for this lecture
        for timeslot in self.timeslots:
            # --- Domain Pruning & Constraint Checks ---
            if self._is_valid_assignment(schedule, lecture_to_schedule, timeslot):
                # If the assignment is valid, try to find a suitable faculty and room
                
                possible_assignments = self._find_assignments(schedule, lecture_to_schedule, timeslot)
                for assignment in possible_assignments:
                    # Place the assignment in the schedule
                    day, period = timeslot
                    if timeslot not in schedule:
                        schedule[timeslot] = []
                    schedule[timeslot].append(assignment)
                    
                    # Recurse: Try to solve for the rest of the lectures
                    if self._backtrack(remaining_lectures, schedule):
                        return True # Success!

                    # Backtrack: The recursive call failed, so undo the assignment
                    schedule[timeslot].remove(assignment)
                    if not schedule[timeslot]:
                        del schedule[timeslot]

        # If we loop through all timeslots and find no valid place, trigger backtracking
        return False

    def _is_valid_assignment(self, schedule, lecture, timeslot):
        """
        Checks a set of hard constraints before attempting a full assignment.
        This helps to prune the search space early.
        """
        batch_id, subject_id = lecture
        
        # Constraint: Is the batch already busy at this time?
        for assignments in schedule.values():
            for ass in assignments:
                if ass['batch']['id'] == batch_id and ass['timeslot'] == timeslot:
                    return False
        
        # Constraint: Avoid lunch break
        if timeslot[1] == self.constraints['lunch_break_slot']:
            return False
            
        return True

    def _find_assignments(self, schedule, lecture, timeslot):
        """

        Finds all valid combinations of (faculty, room) for a given lecture and timeslot.
        """
        batch_id, subject_id = lecture
        valid_assignments = []

        batch_info = next(b for b in self.batches if b['id'] == batch_id)
        subject_info = self.subjects[subject_id]

        # Find suitable faculty
        available_faculty = [f for f in self.faculty if subject_id in f['expertise']]
        
        # Find suitable rooms
        suitable_rooms = [r for r in self.rooms if r['type'] == subject_info['type'] and r['capacity'] >= batch_info['strength']]

        for faculty in available_faculty:
            for room in suitable_rooms:
                assignment = {
                    "batch": batch_info,
                    "subject": subject_info,
                    "faculty": faculty,
                    "room": room,
                    "timeslot": timeslot
                }
                
                # --- Final Constraint Checks for this specific (faculty, room) combo ---
                is_faculty_busy = any(a['faculty']['id'] == faculty['id'] for ts_assignments in schedule.get(timeslot, []) for a in ts_assignments)
                is_room_busy = any(a['room']['id'] == room['id'] for ts_assignments in schedule.get(timeslot, []) for a in ts_assignments)

                if not is_faculty_busy and not is_room_busy:
                    valid_assignments.append(assignment)
        
        return valid_assignments

    def _format_solution(self, raw_solution):
        """
        Converts the internal schedule dictionary into a clean list for API response.
        """
        formatted = []
        for timeslot, assignments in raw_solution.items():
            day, period = timeslot
            for assignment in assignments:
                formatted.append({
                    "day": day,
                    "timeslot": period,
                    "batch": assignment['batch']['name'],
                    "subject": assignment['subject']['name'],
                    "faculty": assignment['faculty']['name'],
                    "room": assignment['room']['name'],
                })
        return formatted


# --- Public Wrapper Function ---
def generate_timetable():
    """
    The main function called by the API route. It instantiates the solver,
    runs the algorithm, and returns the result.
    """
    # 1. Load all data from the mock database
    all_batches = get_batches()
    all_rooms = get_rooms()
    all_faculty = get_faculty()
    all_subjects = get_subjects()
    all_constraints = get_constraints()

    # 2. Instantiate the solver with the data
    solver = TimetableSolver(
        batches=all_batches,
        rooms=all_rooms,
        faculty=all_faculty,
        subjects=all_subjects,
        constraints=all_constraints
    )

    # 3. Solve the problem
    solution = solver.solve()

    # 4. Return the solution
    if solution:
        return {"status": "success", "timetable": solution}
    else:
        return {"status": "failure", "message": "Could not generate a valid timetable with the given constraints."}
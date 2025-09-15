import random
from copy import deepcopy
# The data functions are now department-aware
from data import get_subjects, get_faculty, get_rooms, get_batches, get_timeslots, get_constraints

class TimetableSolver:
    """
    A class to encapsulate the entire timetable solving process.
    """
    def __init__(self, batches, rooms, faculty, subjects, constraints):
        self.batches = batches
        self.rooms = rooms
        self.faculty = faculty
        # Convert subjects list to a dict for faster lookups by ID
        self.subjects = {s['id']: s for s in subjects}
        self.constraints = constraints
        self.timeslots = get_timeslots()
        self.lectures_to_schedule = self._create_lecture_list()
        self.solution = None

    def _create_lecture_list(self):
        """
        Generates a flat list of every single lecture session that needs a slot.
        """
        lectures = []
        for batch in self.batches:
            for subject_id_str in batch['subjects']:
                # The subject IDs from the DB might be strings, ensure they match keys
                subject_id = int(subject_id_str)
                if subject_id in self.subjects:
                    credits = self.subjects[subject_id]['credits']
                    for _ in range(credits):
                        lectures.append((batch['id'], subject_id))
        
        random.shuffle(lectures)
        return lectures

    def solve(self):
        """
        Public method to start the solving process.
        """
        initial_schedule = {}
        if self._backtrack(self.lectures_to_schedule, initial_schedule):
            return self._format_solution(self.solution)
        else:
            return None

    def _backtrack(self, lectures, schedule):
        """
        The core recursive backtracking algorithm.
        """
        if not lectures:
            self.solution = schedule
            return True

        lecture_to_schedule = lectures[0]
        remaining_lectures = lectures[1:]
        
        for timeslot in self.timeslots:
            if self._is_valid_assignment(schedule, lecture_to_schedule, timeslot):
                possible_assignments = self._find_assignments(schedule, lecture_to_schedule, timeslot)
                for assignment in possible_assignments:
                    day, period = timeslot
                    if timeslot not in schedule:
                        schedule[timeslot] = []
                    schedule[timeslot].append(assignment)
                    
                    if self._backtrack(remaining_lectures, schedule):
                        return True

                    schedule[timeslot].remove(assignment)
                    if not schedule[timeslot]:
                        del schedule[timeslot]
        return False

    def _is_valid_assignment(self, schedule, lecture, timeslot):
        """
        Checks a set of hard constraints before attempting a full assignment.
        """
        batch_id, subject_id = lecture
        
        # Is the batch already busy at this time?
        for assignments_in_slot in schedule.values():
            for ass in assignments_in_slot:
                if ass['batch']['id'] == batch_id and ass['timeslot'] == timeslot:
                    return False
        
        # Avoid lunch break
        if timeslot[1] == self.constraints['lunch_break_slot']:
            return False
            
        return True

    def _find_assignments(self, schedule, lecture, timeslot):
        """
        Finds all valid combinations of (faculty, room) for a given lecture and timeslot,
        respecting all defined constraints.
        """
        batch_id, subject_id = lecture
        day, period = timeslot
        valid_assignments = []

        batch_info = next(b for b in self.batches if b['id'] == batch_id)
        subject_info = self.subjects[subject_id]

        # Find faculty who can teach this subject (expertise is a list of strings)
        available_faculty = [f for f in self.faculty if str(subject_id) in f['expertise']]
        
        # Find suitable rooms based on type and capacity.
        suitable_rooms = []
        for r in self.rooms:
            if r['capacity'] >= batch_info['strength']:
                if subject_info['type'] == 'Lab':
                    if r['type'] == 'Lab':
                        suitable_rooms.append(r)
                else: # It's a Theory class
                    suitable_rooms.append(r)


        for faculty in available_faculty:
            # --- Constraint Check: Max lectures per day for a faculty member ---
            lectures_today = sum(1 for (d, _), assignments in schedule.items() 
                                 if d == day 
                                 for a in assignments if a['faculty']['id'] == faculty['id'])
            
            if lectures_today >= self.constraints.get('max_lectures_per_day_faculty', 5): # Use .get for safety
                continue # Skip this faculty, they are at their daily limit.

            for room in suitable_rooms:
                # Check if this specific faculty or room is busy at this timeslot
                is_faculty_busy = any(a['faculty']['id'] == faculty['id'] for a in schedule.get(timeslot, []))
                is_room_busy = any(a['room']['id'] == room['id'] for a in schedule.get(timeslot, []))

                if not is_faculty_busy and not is_room_busy:
                    valid_assignments.append({
                        "batch": batch_info, "subject": subject_info,
                        "faculty": faculty, "room": room, "timeslot": timeslot
                    })
        
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
                    "day": day, "timeslot": period,
                    "batch": assignment['batch']['name'],
                    "subject": assignment['subject']['name'],
                    "faculty": assignment['faculty']['name'],
                    "room": assignment['room']['name'],
                })
        return formatted


# --- Public Wrapper Function (DEPARTMENT-AWARE) ---
def generate_timetable(department_id):
    """
    The main function called by the API route. It now accepts a department_id
    to generate a timetable for a specific department.
    """
    if department_id is None:
        return {"status": "failure", "message": "A department ID is required to generate a timetable."}
        
    # 1. Load data ONLY for the specified department
    all_batches = get_batches(department_id)
    all_rooms = get_rooms(department_id)
    all_faculty = get_faculty(department_id)
    all_subjects = get_subjects(department_id)
    all_constraints = get_constraints()

    # Basic check to ensure there is data to process
    if not all_batches or not all_subjects or not all_faculty or not all_rooms:
        return {"status": "failure", "message": "Not enough data (batches, subjects, faculty, rooms) in this department to generate a timetable."}

    # 2. Instantiate the solver with the department-specific data
    solver = TimetableSolver(
        batches=all_batches, rooms=all_rooms, faculty=all_faculty,
        subjects=all_subjects, constraints=all_constraints
    )

    # 3. Solve the problem
    solution = solver.solve()

    # 4. Return the solution
    if solution:
        return {"status": "success", "timetable": solution}
    else:
        return {"status": "failure", "message": "Could not generate a valid timetable. Check for conflicting constraints or insufficient resources (e.g., not enough faculty/rooms for the required classes)."}

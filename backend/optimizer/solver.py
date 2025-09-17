import random
from copy import deepcopy
from collections import defaultdict
from data import get_subjects, get_faculty, get_rooms, get_batches, get_timeslots, get_constraints

class TimetableSolver:
    """
    An improved timetable solver that uses heuristics and a cost function
    to find a more optimal and efficient solution.
    """
    def __init__(self, batches, rooms, faculty, subjects, constraints):
        # Convert lists to dictionaries for fast lookups by ID
        self.batches = {b['id']: b for b in batches}
        self.rooms = {r['id']: r for r in rooms}
        self.faculty = {f['id']: f for f in faculty}
        self.subjects = {s['id']: s for s in subjects}
        
        self.constraints = constraints
        self.timeslots = get_timeslots()
        
        # This will hold the best solution found so far
        self.best_solution = None
        self.lowest_cost = float('inf')

    def _get_sorted_lectures(self):
        """
        Generates a list of all lectures that need to be scheduled,
        then sorts them to prioritize the most constrained ones first.
        
        Heuristic: Subjects taught by fewer faculty members are more
        constrained and should be scheduled first. This prunes the search
        tree faster.
        """
        lectures = []
        faculty_subject_counts = defaultdict(int)

        # Count how many faculty can teach each subject
        for fac in self.faculty.values():
            for subject_id_str in fac['expertise']:
                faculty_subject_counts[int(subject_id_str)] += 1

        # Create the flat list of all individual lecture hours
        for batch in self.batches.values():
            for subject_id_str in batch['subjects']:
                subject_id = int(subject_id_str)
                if subject_id in self.subjects:
                    credits = self.subjects[subject_id]['credits']
                    for _ in range(credits):
                        lectures.append({
                            'batch_id': batch['id'],
                            'subject_id': subject_id,
                            # Lower score = higher priority
                            'priority': faculty_subject_counts.get(subject_id, 99) 
                        })
        
        # Sort lectures by priority (most constrained first)
        return sorted(lectures, key=lambda x: x['priority'])

    def solve(self):
        """
        Public method to start the solving process.
        """
        lectures_to_schedule = self._get_sorted_lectures()
        initial_schedule = defaultdict(list)
        
        if self._backtrack(lectures_to_schedule, initial_schedule):
            return self._format_solution(self.best_solution)
        else:
            return None

    def _calculate_cost(self, schedule):
        """
        Calculates the "cost" of a schedule based on soft constraints.
        A lower cost means a better timetable.
        
        Soft Constraints Penalized:
        1. Gaps in a teacher's daily schedule.
        2. Gaps in a batch's daily schedule.
        3. A teacher having more than 2 consecutive lectures.
        """
        cost = 0
        
        faculty_schedule = defaultdict(list)
        batch_schedule = defaultdict(list)
        
        # Organize schedule by faculty and batch
        for timeslot, assignments in schedule.items():
            day, period_str = timeslot
            period_index = self.timeslots.index(timeslot) % len(get_timeslots()[0][1]) # Get column index
            for assignment in assignments:
                faculty_id = assignment['faculty']['id']
                batch_id = assignment['batch']['id']
                faculty_schedule[(faculty_id, day)].append(period_index)
                batch_schedule[(batch_id, day)].append(period_index)

        # Penalty for gaps and consecutive lectures
        for schedule_type in [faculty_schedule, batch_schedule]:
            for key, periods in schedule_type.items():
                if not periods: continue
                periods.sort()
                # Penalty for gaps
                for i in range(len(periods) - 1):
                    gap = periods[i+1] - periods[i]
                    if gap > 1:
                        cost += (gap - 1) # Add 1 penalty point for each hour of gap
                
                # Penalty for more than 2 consecutive lectures
                consecutive_count = 1
                for i in range(len(periods) - 1):
                    if periods[i+1] - periods[i] == 1:
                        consecutive_count += 1
                    else:
                        if consecutive_count > 2:
                            cost += (consecutive_count - 2) * 2 # Heavier penalty for long streaks
                        consecutive_count = 1
                if consecutive_count > 2:
                    cost += (consecutive_count - 2) * 2

        return cost

    def _backtrack(self, lectures, schedule):
        """
        The core recursive backtracking algorithm.
        """
        if not lectures:
            # A solution is found, calculate its cost
            current_cost = self._calculate_cost(schedule)
            if current_cost < self.lowest_cost:
                self.lowest_cost = current_cost
                self.best_solution = deepcopy(schedule)
            # For now, we still stop at the first solution found.
            # To find the absolute best, remove this return and let it explore all paths.
            return True

        lecture_to_schedule = lectures[0]
        remaining_lectures = lectures[1:]
        
        shuffled_timeslots = random.sample(self.timeslots, len(self.timeslots))

        for timeslot in shuffled_timeslots:
            day, period = timeslot
            batch_id = lecture_to_schedule['batch_id']

            # --- HARD CONSTRAINT CHECKS ---
            # 1. Is the batch already busy at this timeslot?
            if any(a['batch']['id'] == batch_id for a in schedule[timeslot]):
                continue
            
            # 2. Is this a lunch break?
            if period == self.constraints.get('lunch_break_slot', '12:00-13:00'):
                continue

            possible_assignments = self._find_valid_assignments(schedule, lecture_to_schedule, timeslot)
            for assignment in possible_assignments:
                schedule[timeslot].append(assignment)
                
                if self._backtrack(remaining_lectures, schedule):
                    return True # Found a solution

                # Backtrack
                schedule[timeslot].pop()
        
        return False

    def _find_valid_assignments(self, schedule, lecture, timeslot):
        """
        Finds all valid combinations of (faculty, room) for a given lecture
        and timeslot, respecting all hard constraints.
        """
        batch_id, subject_id = lecture['batch_id'], lecture['subject_id']
        day, period = timeslot
        
        batch_info = self.batches.get(batch_id)
        subject_info = self.subjects.get(subject_id)
        if not batch_info or not subject_info: return []

        assignments_in_slot = schedule.get(timeslot, [])
        
        # Find faculty who can teach this subject
        available_faculty = [f for f in self.faculty.values() if str(subject_id) in f['expertise']]
        random.shuffle(available_faculty)
        
        # Find suitable rooms
        available_rooms = [r for r in self.rooms.values() if r['type'] == subject_info['type']]
        random.shuffle(available_rooms)
        
        valid_assignments = []
        
        for faculty in available_faculty:
            # HARD CONSTRAINT: Is this faculty member already busy at this timeslot?
            if any(a['faculty']['id'] == faculty['id'] for a in assignments_in_slot):
                continue
            
            # HARD CONSTRAINT: Max lectures per day for this faculty member
            lectures_today = sum(1 for (d, _), assignments in schedule.items() 
                                 if d == day for a in assignments if a['faculty']['id'] == faculty['id'])
            if lectures_today >= self.constraints.get('max_lectures_per_day_faculty', 5):
                continue

            for room in available_rooms:
                # HARD CONSTRAINT: Is this room already occupied at this timeslot?
                if any(a['room']['id'] == room['id'] for a in assignments_in_slot):
                    continue
                
                # HARD CONSTRAINT: Does the batch fit in the room?
                if batch_info['strength'] > room['capacity']:
                    continue
                    
                # If all checks pass, this is a valid assignment
                valid_assignments.append({
                    "batch": batch_info, "subject": subject_info,
                    "faculty": faculty, "room": room
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
        
    all_batches = get_batches(department_id)
    all_rooms = get_rooms(department_id)
    all_faculty = get_faculty(department_id)
    all_subjects = get_subjects(department_id)
    all_constraints = get_constraints()

    if not all([all_batches, all_subjects, all_faculty, all_rooms]):
        return {"status": "failure", "message": "Not enough data (batches, subjects, faculty, rooms) in this department to generate a timetable."}

    solver = TimetableSolver(
        batches=all_batches, rooms=all_rooms, faculty=all_faculty,
        subjects=all_subjects, constraints=all_constraints
    )

    solution = solver.solve()

    if solution:
        return {"status": "success", "timetable": solution}
    else:
        return {"status": "failure", "message": "Could not generate a valid timetable. Check for conflicting constraints or insufficient resources (e.g., not enough faculty/rooms for the required classes)."}
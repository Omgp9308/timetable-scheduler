import sys
from app import create_app
from database import db, User, Subject, Faculty, Room, Batch, Department
from data import get_subjects, get_faculty, get_rooms, get_batches, get_departments

def seed_database():
    """
    This function creates the database tables and populates them with
    initial data from your data.py file in a robust, data-driven way.
    """
    app = create_app()
    with app.app_context():
        try:
            print("Dropping all tables...")
            db.drop_all()
            print("Creating all tables...")
            db.create_all()
            print("Tables created successfully.")

            # --- Step 1: Seed Departments ---
            print("Seeding departments...")
            # Create department objects first
            departments_from_data = [Department(**dept_data) for dept_data in get_departments()]
            db.session.add_all(departments_from_data)
            # Commit them to the database so they get their auto-generated IDs
            db.session.commit()
            print("Departments seeded.")

            # --- Step 2: Loop Through Created Departments ---
            # Instead of hardcoding `department_id=1`, we now fetch the departments
            # we just created and loop through them, using their actual IDs.
            all_departments = Department.query.order_by(Department.id).all()
            for department in all_departments:
                print(f"--- Seeding data for '{department.name}' (ID: {department.id}) ---")

                # --- Seed Users for this Department ---
                # Usernames are made unique to prevent conflicts
                admin = User(username=f'admin', role='Admin', department_id=department.id)
                admin.set_password('password123')
                
                hod = User(username=f'hod_{department.id}', role='HOD', department_id=department.id)
                hod.set_password('password123')
                
                teacher = User(username=f'teacher_{department.id}', role='Teacher', department_id=department.id)
                teacher.set_password('password123')
                
                db.session.add_all([admin, hod, teacher])

                # --- Seed Other Data using the correct department.id ---
                print("Seeding subjects...")
                for s_data in get_subjects(department_id=department.id):
                    # Add the department_id to the subject data before creating the object
                    s_data['department_id'] = department.id
                    subject = Subject(**s_data)
                    db.session.add(subject)

                print("Seeding faculty...")
                for f_data in get_faculty(department_id=department.id):
                    # Continue using comma-separated strings as per your current model
                    f_data['expertise'] = ",".join(f_data['expertise'])
                    f_data['department_id'] = department.id
                    faculty = Faculty(**f_data)
                    db.session.add(faculty)

                print("Seeding rooms...")
                for r_data in get_rooms(department_id=department.id):
                    r_data['department_id'] = department.id
                    room = Room(**r_data)
                    db.session.add(room)

                print("Seeding batches...")
                for b_data in get_batches(department_id=department.id):
                    # Continue using comma-separated strings
                    b_data['subjects'] = ",".join(b_data['subjects'])
                    b_data['department_id'] = department.id
                    batch = Batch(**b_data)
                    db.session.add(batch)

            # --- Step 3: Final Commit ---
            # Commit all the users, subjects, etc., in a single transaction.
            db.session.commit()
            print("Database has been successfully seeded! 🚀")

        except Exception as e:
            # If any error occurs, print it and roll back all changes.
            # This prevents leaving the database in a broken, half-seeded state.
            print(f"\nAn error occurred during seeding: {e}", file=sys.stderr)
            traceback.print_exc() # Provides a more detailed error trace
            db.session.rollback()
            sys.exit(1) # Exit with an error code to signal failure

if __name__ == '__main__':
    # Add a traceback import for better error details if run directly
    import traceback
    seed_database()
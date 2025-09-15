from app import create_app
from database import db, User, Subject, Faculty, Room, Batch, Department
from data import get_subjects, get_faculty, get_rooms, get_batches, get_departments

def seed_database():
    """
    This function will create the database tables and populate them with
    initial data from your old data.py file.
    """
    app = create_app()
    with app.app_context():
        print("Dropping all tables...")
        db.drop_all()
        print("Creating all tables...")
        db.create_all()
        print("Tables created.")

        # --- Seed Departments ---
        print("Seeding departments...")
        for dept_data in get_departments():
            department = Department(**dept_data)
            db.session.add(department)
        db.session.commit() # Commit departments first to get their IDs

        # --- Seed Users ---
        print("Seeding users...")
        admin = User(username='admin', role='admin', department_id=1)
        admin.set_password('password123')
        
        hod = User(username='hod', role='hod', department_id=1)
        hod.set_password('password123')
        
        teacher = User(username='teacher', role='teacher', department_id=1)
        teacher.set_password('password123')
        
        db.session.add_all([admin, hod, teacher])
        
        # --- Seed Other Data from data.py (assuming for department 1) ---
        print("Seeding subjects...")
        # CORRECTED: Pass the department_id to the data functions
        for s_data in get_subjects(department_id=1):
            subject = Subject(**s_data)
            db.session.add(subject)

        print("Seeding faculty...")
        for f_data in get_faculty(department_id=1):
            f_data['expertise'] = ",".join(f_data['expertise'])
            faculty = Faculty(**f_data)
            db.session.add(faculty)

        print("Seeding rooms...")
        for r_data in get_rooms(department_id=1):
            room = Room(**r_data)
            db.session.add(room)

        print("Seeding batches...")
        for b_data in get_batches(department_id=1):
            b_data['subjects'] = ",".join(b_data['subjects'])
            batch = Batch(**b_data)
            db.session.add(batch)

        # Commit all changes to the database
        db.session.commit()
        print("Database has been successfully seeded!")

if __name__ == '__main__':
    seed_database()
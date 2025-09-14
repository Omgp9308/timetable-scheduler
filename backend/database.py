from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
import json

# Create the database instance
db = SQLAlchemy()

# --- Database Models ---

class Department(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)

    def to_dict(self):
        return {"id": self.id, "name": self.name}

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    # Define roles: 'Admin', 'HOD', 'Teacher'
    role = db.Column(db.String(20), nullable=False)
    department_id = db.Column(db.Integer, db.ForeignKey('department.id'), nullable=True) # Nullable for Admin
    department = db.relationship('Department', backref='users')

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            "id": self.id, 
            "username": self.username, 
            "role": self.role,
            "department_name": self.department.name if self.department else None
        }

class Subject(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    credits = db.Column(db.Integer, nullable=False)
    type = db.Column(db.String(50), nullable=False)
    department_id = db.Column(db.Integer, db.ForeignKey('department.id'), nullable=False)
    department = db.relationship('Department', backref='subjects')
    
    __table_args__ = (db.UniqueConstraint('name', 'department_id', name='_name_department_uc'),)

    def to_dict(self):
        return {"id": self.id, "name": self.name, "credits": self.credits, "type": self.type}

class Faculty(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    expertise = db.Column(db.String(255), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), unique=True, nullable=True)
    user = db.relationship('User', backref='faculty', uselist=False)
    department_id = db.Column(db.Integer, db.ForeignKey('department.id'), nullable=False)
    department = db.relationship('Department', backref='faculty')

    __table_args__ = (db.UniqueConstraint('name', 'department_id', name='_name_department_faculty_uc'),)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "expertise": self.expertise.split(','),
            "username": self.user.username if self.user else None
        }

class Room(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    capacity = db.Column(db.Integer, nullable=False)
    type = db.Column(db.String(50), nullable=False)
    department_id = db.Column(db.Integer, db.ForeignKey('department.id'), nullable=False)
    department = db.relationship('Department', backref='rooms')

    __table_args__ = (db.UniqueConstraint('name', 'department_id', name='_name_department_room_uc'),)

    def to_dict(self):
        return {"id": self.id, "name": self.name, "capacity": self.capacity, "type": self.type}

class Batch(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    strength = db.Column(db.Integer, nullable=False)
    subjects = db.Column(db.String(255), nullable=False)
    department_id = db.Column(db.Integer, db.ForeignKey('department.id'), nullable=False)
    department = db.relationship('Department', backref='batches')

    __table_args__ = (db.UniqueConstraint('name', 'department_id', name='_name_department_batch_uc'),)

    def to_dict(self):
        return {"id": self.id, "name": self.name, "strength": self.strength, "subjects": self.subjects.split(',')}

class Timetable(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, default='Generated Timetable')
    status = db.Column(db.String(50), nullable=False, default='Draft')
    data = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    approved_by_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    approved_by = db.relationship('User')
    department_id = db.Column(db.Integer, db.ForeignKey('department.id'), nullable=False)
    department = db.relationship('Department', backref='timetables')

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "status": self.status,
            "data": json.loads(self.data),
            "created_at": self.created_at.isoformat(),
            "approved_by": self.approved_by.username if self.approved_by else None,
            "department_name": self.department.name
        }


from flask_sqlalchemy import SQLAlchemy

# Create the database instance
db = SQLAlchemy()

# --- Database Models ---
# Each class represents a table in the database.

class Subject(db.Model):
    # The 'id' column is now an Integer and is set to auto-increment.
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, unique=True)
    credits = db.Column(db.Integer, nullable=False)
    type = db.Column(db.String(50), nullable=False) # 'Theory' or 'Lab'

    def to_dict(self):
        return {"id": self.id, "name": self.name, "credits": self.credits, "type": self.type}

class Faculty(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, unique=True)
    # Storing expertise as a simple comma-separated string of subject IDs
    expertise = db.Column(db.String(255), nullable=False)

    def to_dict(self):
        return {"id": self.id, "name": self.name, "expertise": self.expertise.split(',')}

class Room(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, unique=True)
    capacity = db.Column(db.Integer, nullable=False)
    type = db.Column(db.String(50), nullable=False) # 'Theory' or 'Lab'

    def to_dict(self):
        return {"id": self.id, "name": self.name, "capacity": self.capacity, "type": self.type}

class Batch(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, unique=True)
    strength = db.Column(db.Integer, nullable=False)
    # Storing subject IDs as a comma-separated string
    subjects = db.Column(db.String(255), nullable=False)

    def to_dict(self):
        return {"id": self.id, "name": self.name, "strength": self.strength, "subjects": self.subjects.split(',')}


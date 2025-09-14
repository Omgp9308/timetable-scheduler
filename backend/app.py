# -*- coding: utf-8 -*-
"""
app.py: Flask Application Factory
"""
import os
from flask import Flask
from flask_cors import CORS

from config import Config, DATA_DIR
from database import db
from api.public_routes import public_bp
from api.admin_routes import admin_bp
from api.auth_routes import auth_bp

def create_app(config_class=Config):
    """
    Creates and new_timetable_dataan instance of the Flask application.
    """
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    # --- Ensure the data directory exists ---
    # This is crucial for SQLite to be able to create the database file.
    os.makedirs(DATA_DIR, exist_ok=True)
    
    # Initialize extensions
    db.init_app(app)
    CORS(app, origins="*", supports_credentials=True)
    
    # Create database tables if they don't exist
    with app.app_context():
        db.create_all()
    
    # Register API Blueprints
    app.register_blueprint(public_bp, url_prefix='/api/public')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    
    @app.route('/')
    def index():
        return "<h1>Timetable Scheduler API</h1><p>Welcome! The API is up and running.</p>"
        
    return app

# Create the application instance using the factory
app = create_app()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=10000)


# -*- coding: utf-8 -*-
"""
app.py: Flask Application Factory

This file creates and configures the main Flask application.
It follows the application factory pattern, which makes the app more modular.
"""
import os
from flask import Flask
from flask_cors import CORS

from config import Config
from api.public_routes import public_bp
from api.admin_routes import admin_bp
from api.auth_routes import auth_bp
from database import db # --- NEW: Import the database instance

def create_app(config_class=Config):
    """
    Creates and configures an instance of the Flask application.
    """
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    # --- NEW: Initialize the database with the app ---
    db.init_app(app)

    # Ensure the instance folder exists
    try:
        os.makedirs(app.instance_path)
    except OSError:
        pass

    # --- NEW: Create database tables from models ---
    # This block of code will run within the app context and create
    # all the tables defined in database.py if they don't already exist.
    with app.app_context():
        db.create_all()

    # Enable Cross-Origin Resource Sharing (CORS)
    CORS(
        app,
        origins="*",
        methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        supports_credentials=True,
        allow_headers=["Content-Type", "Authorization"]
    )
    
    # Register API Blueprints
    app.register_blueprint(public_bp, url_prefix='/api/public')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    
    @app.route('/')
    def index():
        """A simple route to confirm the API is running."""
        return "<h1>Timetable Scheduler API</h1><p>Welcome! The API is up and running.</p>"
        
    return app

# Create the application instance using the factory
app = create_app()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=10000)


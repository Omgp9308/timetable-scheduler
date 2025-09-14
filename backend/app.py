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
from database import db
from api.public_routes import public_bp
from api.admin_routes import admin_bp
from api.auth_routes import auth_bp

def create_app(config_class=Config):
    """
    Creates and configures an instance of the Flask application.
    """
    app = Flask(__name__)
    
    # Load configuration from the config.py file
    app.config.from_object(config_class)
    
    # Ensure the instance folder exists for the database
    try:
        os.makedirs(app.config['DATA_DIR'])
    except OSError:
        pass # Directory already exists

    # Initialize extensions
    db.init_app(app)

    # --------------------------------------------------------------------------
    # Enable Cross-Origin Resource Sharing (CORS)
    # --------------------------------------------------------------------------
    # This is the corrected CORS setup. We explicitly list the frontend's
    # URL to ensure the browser trusts the connection.
    CORS(
        app,
        origins=["https://timetable-scheduler-mu.vercel.app", "http://localhost:3000"],
        methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        supports_credentials=True,
        allow_headers=["Content-Type", "Authorization"]
    )
    
    # Create database tables if they don't exist
    with app.app_context():
        db.create_all()

    # --------------------------------------------------------------------------
    # Register API Blueprints
    # --------------------------------------------------------------------------
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


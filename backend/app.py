# -*- coding: utf-8 -*-
"""
app.py: Flask Application Factory

This file creates and configures the main Flask application.
It follows the application factory pattern, which makes the app more modular.
"""

from flask import Flask
from flask_cors import CORS

from config import Config
from api.public_routes import public_bp
from api.admin_routes import admin_bp
from api.auth_routes import auth_bp

def create_app(config_class=Config):
    """
    Creates and configures an instance of the Flask application.
    
    Args:
        config_class: The configuration class to use.
        
    Returns:
        The configured Flask application instance.
    """
    
    app = Flask(__name__)
    
    # Load configuration from the config.py file
    app.config.from_object(config_class)
    
    # --------------------------------------------------------------------------
    # Enable Cross-Origin Resource Sharing (CORS)
    # --------------------------------------------------------------------------
    # This is necessary to allow the React frontend (running on a different domain)
    # to send requests to the Flask backend.
    # We explicitly define the allowed origins (your Vercel frontend and local dev),
    # methods, and headers to ensure preflight OPTIONS requests succeed.
    CORS(
        app,
        origins=["https://timetable-scheduler-mu.vercel.app", "http://localhost:3000"],
        methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        supports_credentials=True,
        allow_headers=["Content-Type", "Authorization"]
    )
    
    # --------------------------------------------------------------------------
    # Register API Blueprints
    # --------------------------------------------------------------------------
    # Blueprints help in organizing a group of related views and other code.
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
    # Note: Render typically uses its own web server (like Gunicorn)
    # and ignores this app.run(). Host and port settings here are for local dev.
    app.run(host="0.0.0.0", port=10000)

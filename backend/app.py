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

app = Flask(__name__)

def create_app(config_class=Config):
    """
    Creates and configures an instance of the Flask application.
    
    Args:
        config_class: The configuration class to use.
        
    Returns:
        The configured Flask application instance.
    """
    
    # Load configuration from the config.py file
    app.config.from_object(config_class)
    
    # --------------------------------------------------------------------------
    # Enable Cross-Origin Resource Sharing (CORS)
    # --------------------------------------------------------------------------
    # This is necessary to allow the React frontend (running on a different port)
    # to send requests to the Flask backend.
    CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}})
    
    # --------------------------------------------------------------------------
    # Register API Blueprints
    # --------------------------------------------------------------------------
    # Blueprints help in organizing a group of related views and other code.
    # Instead of registering views and other code directly with an application,
    # they are registered with a blueprint. Then the blueprint is registered
    # with the application when it is available in this factory function.
    
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
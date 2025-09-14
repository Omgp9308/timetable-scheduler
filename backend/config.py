# -*- coding: utf-8 -*-
"""
config.py: Configuration File

This file stores configuration variables for the Flask application.
Using a dedicated config file makes the application more organized and
easier to manage for different environments (e.g., development, production).
"""

import os

# Get the absolute path of the directory the script is in
basedir = os.path.abspath(os.path.dirname(__file__))

class Config:
    """
    Base configuration class. Contains default settings.
    """
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'a-very-secret-and-hard-to-guess-key'
    DEBUG = True
    
    # --- NEW: Database Configuration ---
    # Set the database URI. We are using SQLite here.
    # The database file will be created in the instance folder of your app.
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or \
        'sqlite:///' + os.path.join(basedir, 'instance', 'app.db')
    
    # Disable an unneeded feature of SQLAlchemy to save resources
    SQLALCHEMY_TRACK_MODIFICATIONS = False


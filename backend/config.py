# -*- coding: utf-8 -*-
"""
config.py: Configuration File

This file stores configuration variables for the Flask application.
Using a dedicated config file makes the application more organized and
easier to manage for different environments (e.g., development, production).
"""

import os

class Config:
    """
    Base configuration class. Contains default settings.
    """
    # SECRET_KEY is crucial for session management and signing cookies.
    # It should be a long, random string. os.urandom(24) is a good way to generate one.
    # For development, a simple string is fine, but this should be replaced
    # with an environment variable in a production setting.
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'a-very-secret-and-hard-to-guess-key'

    # DEBUG mode enables features useful for development, like an interactive
    # debugger and automatic reloading. This should be set to False in production.
    DEBUG = True

    # Add other configurations if needed, for example:
    # SQLALCHEMY_DATABASE_URI = 'sqlite:///site.db'
    
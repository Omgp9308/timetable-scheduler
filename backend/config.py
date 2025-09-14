# -*- coding: utf-8 -*-
"""
config.py: Configuration File
"""

import os

# Base directory of the application
basedir = os.path.abspath(os.path.dirname(__file__))

# The directory for the SQLite database. We check for a RENDER_DISK_PATH
# environment variable, which Render provides for its Disks feature.
# If not found, it defaults to a local 'instance' folder.
DATA_DIR = os.environ.get('RENDER_DISK_PATH') or os.path.join(basedir, 'instance')

class Config:
    """
    Base configuration class. Contains default settings.
    """
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'a-very-secret-and-hard-to-guess-key'
    DEBUG = True

    # Point SQLAlchemy to the correct database file location
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or \
        'sqlite:///' + os.path.join(DATA_DIR, 'app.db')
        
    SQLALCHEMY_TRACK_MODIFICATIONS = False


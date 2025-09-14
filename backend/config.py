import os

class Config:
    """
    Base configuration class. Contains default settings.
    """
    # SECRET_KEY is crucial for session management and signing cookies.
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'a-very-secret-and-hard-to-guess-key'

    # This is a good practice to set to False to avoid overhead.
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Set DEBUG mode based on an environment variable (safer for production)
    DEBUG = os.environ.get('FLASK_DEBUG') != 'production'


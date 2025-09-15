from flask import Flask
from flask_cors import CORS
import os

from config import Config
from database import db
# Import all necessary models and data functions for initial setup
from data import add_user, add_department
from database import User, Department

def create_app(config_class=Config):
    """
    Creates and configures an instance of the Flask application.
    """
    app = Flask(__name__)
    app.config.from_object(config_class)

    # --- Database Path Configuration ---
    # Use a persistent disk path if available (like on Render),
    # otherwise, use a local 'instance' folder.
    data_dir = os.environ.get('RENDER_DISK_PATH') or \
               os.path.join(os.path.dirname(os.path.abspath(__file__)), 'instance')
    os.makedirs(data_dir, exist_ok=True)
    db_uri = f"sqlite:///{os.path.join(data_dir, 'app.db')}"
    app.config['SQLALCHEMY_DATABASE_URI'] = db_uri

    # Initialize extensions
    CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)
    db.init_app(app)

    # Register API Blueprints to organize routes
    from api.public_routes import public_bp
    from api.admin_routes import admin_bp
    from api.auth_routes import auth_bp
    app.register_blueprint(public_bp, url_prefix='/api/public')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    
    @app.route('/')
    def index():
        """A simple route to confirm the API is running."""
        return "<h1>Timetable Scheduler API</h1><p>Welcome! The API is up and running.</p>"
        
    # Create database tables and initial data if they don't exist
    with app.app_context():
        db.create_all()
        
        # --- ONE-TIME INITIAL DATA CREATION ---
        # 1. Check if a default department exists
        if not Department.query.first():
            print("--- No departments found. Creating a default department. ---")
            add_department(name='Computer Science')
            add_department(name='Electrical Engineering')
            print("--- Default departments created. ---")

        # 2. Check if the admin user exists
        if not User.query.filter_by(username='admin').first():
            print("--- No admin user found. Creating default admin user. ---")
            add_user(
                username='admin',
                password='sihadminpassword', # Use this password to log in
                role='Admin'
                # Admins are not tied to a specific department
            )
            print("--- Default admin user created successfully. ---")
        
    return app

# Create the application instance using the factory
app = create_app()

if __name__ == "__main__":
    # The host and port are configured for deployment platforms like Render
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 10000)))

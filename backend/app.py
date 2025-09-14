from flask import Flask
from flask_cors import CORS
import os

from config import Config
from database import db
# We need the User model and the add_user function for the initial setup
from data import add_user
from database import User 
from api.public_routes import public_bp
from api.admin_routes import admin_bp
from api.auth_routes import auth_bp

def create_app(config_class=Config):
    """
    Creates and configures an instance of the Flask application.
    """
    app = Flask(__name__)
    app.config.from_object(config_class)

    # --- Database Path Configuration ---
    data_dir = os.environ.get('RENDER_DISK_PATH') or \
               os.path.join(os.path.dirname(os.path.abspath(__file__)), 'instance')
    os.makedirs(data_dir, exist_ok=True)
    db_uri = f"sqlite:///{os.path.join(data_dir, 'app.db')}"
    app.config['SQLALCHEMY_DATABASE_URI'] = db_uri

    # Initialize extensions
    CORS(
        app,
        resources={r"/api/*": {"origins": ["https://timetable-scheduler-mu.vercel.app", "http://localhost:3000"]}},
        supports_credentials=True
    )
    db.init_app(app)

    # Register API Blueprints
    app.register_blueprint(public_bp, url_prefix='/api/public')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    
    @app.route('/')
    def index():
        """A simple route to confirm the API is running."""
        return "<h1>Timetable Scheduler API</h1><p>Welcome! The API is up and running.</p>"
        
    # Create database tables and initial admin user
    with app.app_context():
        db.create_all()
        # --- ONE-TIME ADMIN USER CREATION ---
        # Check if there are any users in the database
        if not User.query.first():
            print("--- No users found. Creating default admin user. ---")
            # If no users exist, create the default admin
            add_user(
                username='admin',
                password='sihadminpassword', # A more secure default password
                role='Admin'
            )
            print("--- Default admin user created successfully. ---")
        
    return app

# Create the application instance using the factory
app = create_app()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 10000)))


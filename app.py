import os
from flask import Flask, render_template
from flask_sqlalchemy import SQLAlchemy
import logging
from sqlalchemy.orm import DeclarativeBase

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s [%(levelname)s] %(message)s',
    handlers=[
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)
logger.info('Starting Financial Calculator application')

# Initialize SQLAlchemy with declarative base
class Base(DeclarativeBase):
    pass

db = SQLAlchemy(model_class=Base)

# Create Flask app
app = Flask(__name__)

# Configure app
app.config.update(
    SECRET_KEY=os.environ.get("FLASK_SECRET_KEY", "financial-calculator-secret-key"),
    SQLALCHEMY_DATABASE_URI=os.environ.get("DATABASE_URL"),
    SQLALCHEMY_TRACK_MODIFICATIONS=False,
    SQLALCHEMY_ENGINE_OPTIONS={
        "pool_pre_ping": True,
        "pool_recycle": 300,
    }
)

# Initialize database
db.init_app(app)

# Create database tables
with app.app_context():
    db.create_all()
    logger.info("Database tables created successfully")

@app.route('/')
def index():
    logger.info("Rendering index page")
    return render_template('index.html')

@app.route('/emi-calculator')
def emi_calculator():
    logger.info("Rendering EMI calculator page")
    return render_template('emi_calculator.html')

# Error handlers
@app.errorhandler(404)
def not_found_error(error):
    logger.error(f"Page not found: {error}")
    return render_template('index.html'), 404

@app.errorhandler(500)
def internal_error(error):
    logger.error(f"Server error: {error}")
    db.session.rollback()
    return render_template('index.html'), 500

# Health check endpoint
@app.route('/health')
def health_check():
    return {"status": "healthy"}, 200

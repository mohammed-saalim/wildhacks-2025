import os
from flask import Flask, request, jsonify, send_from_directory
import sqlite3
import jwt
import requests
from functools import wraps

def create_app(test_config=None):
    # Create and configure the app
    app = Flask(__name__, instance_relative_config=True)

    # Base configuration
    app.config.from_mapping(
        SECRET_KEY='dev',  # Replace with a secure key in production
        DATABASE=os.path.join(app.instance_path, 'app.sqlite'),
        OKTA_ISSUER='https://dev-04106745.okta.com/oauth2/default',
        OKTA_CLIENT_ID='0oao5tp74nyYxFt0i5d7',
        OKTA_AUDIENCE='api://default'
    )

    if test_config is None:
        # Load instance config if it exists
        app.config.from_pyfile('config.py', silent=True)
    else:
        # Load test config if provided
        app.config.from_mapping(test_config)

    # Ensure instance folder exists
    try:
        os.makedirs(app.instance_path, exist_ok=True)
    except OSError:
        pass

    # SQLite database initialization
    def init_db():
        with sqlite3.connect(app.config['DATABASE']) as conn:
            conn.execute('''CREATE TABLE IF NOT EXISTS users 
                            (id INTEGER PRIMARY KEY, 
                             email TEXT UNIQUE,
                             name TEXT,
                             created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)''')

    # OAuth token validation decorator
    def require_auth(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            token = request.headers.get('Authorization', None)
            if not token or not token.startswith('Bearer '):
                return jsonify({'error': 'No valid token'}), 401
            token = token.split(' ')[1]
            try:
                jwks_url = f"{app.config['OKTA_ISSUER']}/.well-known/jwks.json"
                jwks = requests.get(jwks_url).json()
                header = jwt.get_unverified_header(token)
                key = next(k for k in jwks['keys'] if k['kid'] == header['kid'])
                public_key = jwt.algorithms.RSAAlgorithm.from_jwk(key)
                payload = jwt.decode(token, public_key, algorithms=['RS256'],
                                    audience=app.config['OKTA_AUDIENCE'], issuer=app.config['OKTA_ISSUER'])
                request.okta_user = payload
            except Exception as e:
                return jsonify({'error': 'Invalid token', 'details': str(e)}), 401
            return f(*args, **kwargs)
        return decorated

    # Serve React frontend
    @app.route('/')
    def landing():
        return send_from_directory('../interview-ai-frontend/public', 'index.html')

    # Serve static files (for React)
    @app.route('/<path:path>')
    def static_files(path):
        return send_from_directory('../interview-ai-frontend/public', path)

    # API endpoint to get/store user info after login
    @app.route('/api/user', methods=['GET', 'POST'])
    @require_auth
    def user_info():
        email = request.okta_user.get('email', 'unknown@example.com')
        name = request.okta_user.get('name', '')
        with sqlite3.connect(app.config['DATABASE']) as conn:
            if request.method == 'POST':
                # Check if user exists
                cursor = conn.execute('SELECT id FROM users WHERE email = ?', (email,))
                user = cursor.fetchone()

                if user:
                    # Update existing user
                    conn.execute('UPDATE users SET name = ? WHERE email = ?',
                               (name, email))
                    user_id = user[0]
                else:
                    # Create new user
                    cursor = conn.execute('INSERT INTO users (email, name) VALUES (?, ?)',
                                        (email, name))
                    user_id = cursor.lastrowid
                conn.commit()
            else:
                # GET request - just fetch user info
                cursor = conn.execute('SELECT id, name FROM users WHERE email = ?', (email,))
                user = cursor.fetchone()
                if user:
                    user_id, name = user
                else:
                    user_id = None
                    name = ''

        return jsonify({
            'user_id': user_id,
            'email': email,
            'name': name
        })

    # Initialize the database
    with app.app_context():
        init_db()

    return app

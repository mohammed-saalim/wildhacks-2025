from fastapi import FastAPI, UploadFile, File, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
import numpy as np
import cv2
from fer import FER
import uuid
import os
import shutil
import sqlite3
import jwt
import requests
from functools import wraps
from datetime import datetime

app = FastAPI()

# CORS for frontend dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# FER Emotion detector
detector = FER()

# Uploads directory setup
UPLOAD_DIR = "uploads/videos"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# SQLite DB setup
DB_PATH = "instance/app.sqlite"
os.makedirs("instance", exist_ok=True)

def init_db():
    with sqlite3.connect(DB_PATH) as conn:
        conn.execute('''CREATE TABLE IF NOT EXISTS users 
                        (id INTEGER PRIMARY KEY, 
                         email TEXT UNIQUE,
                         name TEXT,
                         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)''')

@app.on_event("startup")
def startup_event():
    init_db()

# Auth0 settings
OKTA_ISSUER = 'https://dev-04106745.okta.com/oauth2/default'
OKTA_CLIENT_ID = '0oao5tp74nyYxFt0i5d7'
OKTA_AUDIENCE = 'api://default'

def require_auth(request: Request):
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise Exception("Missing or invalid Authorization header")
    token = auth_header.split(" ")[1]
    try:
        jwks_url = f"{OKTA_ISSUER}/.well-known/jwks.json"
        jwks = requests.get(jwks_url).json()
        unverified_header = jwt.get_unverified_header(token)
        key = next(k for k in jwks['keys'] if k['kid'] == unverified_header['kid'])
        public_key = jwt.algorithms.RSAAlgorithm.from_jwk(key)
        payload = jwt.decode(token, public_key, algorithms=['RS256'], audience=OKTA_AUDIENCE, issuer=OKTA_ISSUER)
        return payload
    except Exception as e:
        raise Exception(f"Token validation failed: {str(e)}")

@app.get("/api/user")
def get_user(request: Request):
    try:
        payload = require_auth(request)
        email = payload.get("email")
        name = payload.get("name", "")
        with sqlite3.connect(DB_PATH) as conn:
            cursor = conn.execute("SELECT id, name FROM users WHERE email = ?", (email,))
            user = cursor.fetchone()
            if user:
                user_id, name = user
            else:
                user_id = None
        return {"user_id": user_id, "email": email, "name": name}
    except Exception as e:
        return JSONResponse(status_code=401, content={"error": str(e)})

@app.post("/api/user")
def post_user(request: Request):
    try:
        payload = require_auth(request)
        email = payload.get("email")
        name = payload.get("name", "")
        with sqlite3.connect(DB_PATH) as conn:
            cursor = conn.execute("SELECT id FROM users WHERE email = ?", (email,))
            user = cursor.fetchone()
            if user:
                conn.execute("UPDATE users SET name = ? WHERE email = ?", (name, email))
                user_id = user[0]
            else:
                cursor = conn.execute("INSERT INTO users (email, name) VALUES (?, ?)", (email, name))
                user_id = cursor.lastrowid
            conn.commit()
        return {"user_id": user_id, "email": email, "name": name}
    except Exception as e:
        return JSONResponse(status_code=401, content={"error": str(e)})

@app.get("/")
def home():
    return {"message": "Interview AI backend is running 🎤"}

@app.post("/upload-video/")
async def upload_video(video: UploadFile = File(...)):
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    filename = f"interview_{timestamp}.webm"
    filepath = os.path.join(UPLOAD_DIR, filename)
    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(video.file, buffer)
    return {"video_url": f"http://localhost:8000/videos/{filename}"}

@app.post("/analyze-emotion/")
async def analyze_emotion(video: UploadFile = File(...)):
    contents = await video.read()
    filename = f"{uuid.uuid4()}.jpg"
    with open(os.path.join(UPLOAD_DIR, filename), "wb") as f:
        f.write(contents)

    nparr = np.frombuffer(contents, np.uint8)
    frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    results = detector.detect_emotions(frame)

    if not results:
        return {
            "candidate_present": False,
            "emotion_scores": {},
            "stress_level": 0.0,
            "is_confused": False,
            "is_confident": False,
            "focus_score": 0.0
        }

    largest = max(results, key=lambda r: r["box"][2] * r["box"][3])
    emotions = largest["emotions"]

    stress_level = emotions.get("angry", 0) + emotions.get("fear", 0) + emotions.get("sad", 0)
    is_confused = emotions.get("fear", 0) > 0.3 or emotions.get("sad", 0) > 0.3
    is_confident = emotions.get("happy", 0) > 0.5 or emotions.get("neutral", 0) > 0.6
    focus_score = 1.0

    return {
        "candidate_present": True,
        "emotion_scores": emotions,
        "stress_level": round(stress_level, 2),
        "is_confused": is_confused,
        "is_confident": is_confident,
        "focus_score": round(focus_score, 2)
    }

app.mount("/videos", StaticFiles(directory=UPLOAD_DIR), name="videos")

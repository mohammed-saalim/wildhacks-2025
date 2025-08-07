from fastapi import FastAPI, UploadFile, File, Request, Depends, HTTPException
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
import requests
from functools import wraps
from datetime import datetime
from pydantic import BaseModel
from pymongo import MongoClient
from bson import ObjectId
import bcrypt
from jose import jwt  # ✅ For FastAPI login/register JWT
import jwt as okta_jwt  # ✅ For Okta auth only
from dotenv import load_dotenv



load_dotenv()

# MongoDB setup
client = MongoClient(os.getenv("MONGO_URI"))
db = client["inview"]
users_collection = db["users"]

JWT_SECRET = os.getenv("JWT_SECRET")
backend_base_url = os.getenv("REACT_APP_BACKEND_URL", "http://localhost:8000")


class UserRegister(BaseModel):
    name: str
    email: str
    username: str
    password: str
    domain: str = ""
    skills: list[str] = []
    certifications: list[str] = []

class UserLogin(BaseModel):
    usernameOrEmail: str
    password: str

app = FastAPI()

# CORS for frontend dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://wildhacks-git-main-callhimsaalims-projects.vercel.app",
        "https://wildhacks-hnwbfa1iv-callhimsaalims-projects.vercel.app",
        "https://wildhacks-mu.vercel.app",
        "https://hackdepaul-mockmate.vercel.app/"
        "https://wildhacks-callhimsaalims-projects.vercel.app"
    ],
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
        unverified_header = okta_jwt.get_unverified_header(token)
        key = next(k for k in jwks['keys'] if k['kid'] == unverified_header['kid'])
        public_key = jwt.algorithms.RSAAlgorithm.from_jwk(key)
        payload = okta_jwt.decode(token, public_key, algorithms=['RS256'], audience=OKTA_AUDIENCE, issuer=OKTA_ISSUER)
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

@app.post("/api/auth/register")
def register(user: UserRegister):
    if users_collection.find_one({"$or": [{"email": user.email}, {"username": user.username}]}):
        raise HTTPException(status_code=400, detail="User already exists")

    hashed_pw = bcrypt.hashpw(user.password.encode('utf-8'), bcrypt.gensalt())
    user_dict = user.dict()
    user_dict["password"] = hashed_pw
    users_collection.insert_one(user_dict)

    return {"message": "Registered successfully"}


@app.post("/api/auth/login")
def login(user: UserLogin):
    db_user = users_collection.find_one({
        "$or": [{"email": user.usernameOrEmail}, {"username": user.usernameOrEmail}]
    })

    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    if not bcrypt.checkpw(user.password.encode('utf-8'), db_user["password"]):
        raise HTTPException(status_code=400, detail="Invalid credentials")

    token = jwt.encode({"id": str(db_user["_id"])}, JWT_SECRET, algorithm="HS256")

    return {
        "token": token,
        "user": {
            "_id": str(db_user["_id"]),
            "name": db_user["name"],
            "email": db_user["email"],
            "username": db_user["username"],
            "domain": db_user.get("domain", ""),
            "skills": db_user.get("skills", []),
            "certifications": db_user.get("certifications", [])
        }
    }

@app.get("/api/auth/me")
def get_profile(request: Request):
    auth_header = request.headers.get("Authorization")
    print("🚨 Incoming header:", auth_header)

    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing token")

    token = auth_header.split(" ")[1]
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        print("✅ Token payload:", payload)

        user = users_collection.find_one({"_id": ObjectId(payload["id"])})
        print("👤 MongoDB User:", user)

        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        return {
            "_id": str(user["_id"]),
            "name": user["name"],
            "email": user["email"],
            "username": user["username"],
            "domain": user.get("domain", ""),
            "skills": user.get("skills", []),
            "certifications": user.get("certifications", [])
        }
    except jwt.exceptions.InvalidTokenError as e:
        print("❌ JWT decode error:", str(e))
        raise HTTPException(status_code=403, detail="Invalid token")


@app.post("/upload-video/")
async def upload_video(video: UploadFile = File(...)):
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    filename = f"interview_{timestamp}.webm"
    filepath = os.path.join(UPLOAD_DIR, filename)
    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(video.file, buffer)
    return {"video_url": f"{backend_base_url}/videos/{filename}"}

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


# Application ID AA00EJC75J
# MockMate 🎙️

MockMate is a smart AI-powered interview preparation platform that provides personalized questions, emotion analysis, and feedback to help candidates improve their performance.

🟣 **App is Live at**: [https://wildhacks-mu.vercel.app](https://wildhacks-mu.vercel.app)  
📝 **Submitted for DePaul University HackDepaul 20205 and secured the first prize and also the prize for Most technically Impressive project**


## Certificate for First Prize and Most technically Impressive project


![WhatsApp Image 2025-06-19 at 4 06 19 PM](https://github.com/user-attachments/assets/cc2b204c-e35d-469d-88b2-2eb05aedef24)



![WhatsApp Image 2025-06-19 at 4 05 55 PM](https://github.com/user-attachments/assets/e3184267-3bd7-4804-b562-24f4f46489ff)



---

## 💻 Tech Stack

- **Frontend**: React  
- **Backend**: FastAPI  
- **Database**: MongoDB Atlas  
- **LLM API**: Gemini (Google AI)
- **Elevenlabs** : AI Voice
- **End to End Testing**: Cypress

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/mohammed-saalim/inview.git
cd inview
```

---

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Create a `.env` file in the `frontend` folder:

```
REACT_APP_BACKEND_URL=https://your-render-backend-url.onrender.com
```

---

### 3. Backend Setup

```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Create a `.env` file in the `backend` folder:

```
MONGO_URI=your_mongo_connection_string
JWT_SECRET=your_secret
BACKEND_URL=https://your-render-backend-url.onrender.com
```

Run the backend locally:

```bash
uvicorn main:app --host=0.0.0.0 --port=8000
```

---





## Cypress Tests
![Cypress Tests](https://github.com/YOUR_USERNAME/YOUR_REPO/actions/workflows/cypress.yml/badge.svg)


## 🙋 Author

**Mohammed Saalim Kartapillai**  
🔗 [GitHub](https://github.com/mohammed-saalim) | [LinkedIn](https://www.linkedin.com/in/mohammed-saalim/)

---


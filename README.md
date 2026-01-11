# TaskFit 🚀

**TaskFit** is an intelligent career assistant that helps engineers stop guessing and start knowing if they are a fit for a job. 

Instead of matching keywords, TaskFit uses **AI** to extract concrete, execution-level tasks from a Job Description and assesses your actual ability to perform them. It transforms the overwhelming "Requirements" section into a clear, actionable checklist.

## ✨ Key Features

### 1. 🧩 Atomic Task Extraction
Paste any Job Description or upload a PDF/DOCX file. TaskFit's AI agent analyzes the text to identify 8-15 core technical actions you will actually perform on the job, filtering out generic fluff.

### 2. 📄 CV-Driven Auto-Assessment
Upload your Resume/CV alongside the JD. The AI acts as an impartial recruiter, analyzing your history against the extracted tasks to **predict your competency score** (0-2) for each item, saving you time.

### 3. 📊 Gap Analysis & Fit Score
Get a real-time **Job Fit Score** based on your task ratings.
- **Strong Fit (80%+)**: Apply immediately.
- **Possible Fit (60-79%)**: Good match, but be ready to learn.
- **Stretch Role (<40%)**: Significant upskilling needed.
*The app explicitly lists your **Skill Gaps** so you know exactly what to study.*

### 4. ✍️ Tailored Cover Letter Generator
Found a job you like? Click **"Draft Cover Letter"**. 
TaskFit generates a highly personalized letter that:
- Hooks the reader with your specific, verified strengths.
- Frames your identified gaps with a "growth mindset" narrative.
- Is ready to copy/share immediately.

---

## 🛠 Tech Stack

### Frontend (User Experience)
- **Framework**: React Native + Expo (Managed Workflow)
- **Language**: TypeScript
- **Styling**: NativeWind (Tailwind CSS)
- **Navigation**: Expo Router (File-based routing)
- **File Handling**: Expo Document Picker & FileSystem

### Backend (Intelligence)
- **API**: FastAPI (Python) - High performance, easy async support.
- **AI Engine**: OpenAI API (GPT-3.5/4) with custom system prompts.
- **Database**: SQLAlchemy ORM (SQLite for local / PostgreSQL ready).
- **Document Parsing**: `pypdf` (PDF) and `python-docx` (Word).

---

## 🚀 Setup Instructions

### Backend
1. Navigate to `/backend`.
2. Create virtual env: `python -m venv venv` && `source venv/bin/activate`.
3. Install reqs: `pip install -r requirements.txt`.
4. Run: `uvicorn main:app --reload --host 0.0.0.0 --port 8000`.

### Frontend
1. Navigate to `/frontend`.
2. Install deps: `npm install`.
3. Run: `npx expo start`.
4. Scan QR code with Expo Go (Android/iOS).

---

## 🔮 Future Roadmap
- [ ] User Authentication & Cloud Sync
- [ ] "Interview Coach": Generate usage questions based on identified Gaps.
- [ ] "My Pipeline": Kanban board of saved jobs and application status.
- [ ] Browser Extension for 1-click analysis from LinkedIn/Indeed.

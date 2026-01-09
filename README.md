# TaskFit MVP

TaskFit is a candidate-first app that helps job seekers evaluate whether they can actually do a job by matching them against real tasks instead of vague requirements.

## Tech Stack

### Frontend
- **Framework**: React Native + Expo (Managed Workflow)
- **Language**: TypeScript
- **Routing**: Expo Router
- **Styling**: NativeWind (Tailwind CSS)

### Backend
- **Framework**: FastAPI (Python)
- **Database**: PostgreSQL (or SQLite for local dev)
- **ORM**: SQLAlchemy
- **AI**: OpenAI API (Mocked fallback available)

## Setup Instructions

### Prerequisites
- Node.js & npm
- Python 3.9+
- OpenAI API Key (Optional)

### Backend Setup
1. Navigate to `backend`:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run the server:
   ```bash
   export OPENAI_API_KEY="your-key-here" # Optional
   uvicorn main:app --reload
   ```
   Server runs at `http://localhost:8000`.

### Frontend Setup
1. Navigate to `frontend`:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the app:
   ```bash
   npm run ios   # For iOS Simulator
   npm run android # For Android Emulator
   ```

## Configuration
- **API URL**: If running on Android Emulator, the backend is accessed via `10.0.2.2`. On iOS, `localhost`. Modify `frontend/services/api.ts` if testing on physical devices.

## Post-MVP TODOs
- [ ] Add User Accounts & Authentication (Auth0 or Firebase)
- [ ] Persist assessment history per user
- [ ] Improve AI Prompt with few-shot examples
- [ ] Add "Apply Now" link if match is > 80%
- [ ] Add Resume Upload & Parsing

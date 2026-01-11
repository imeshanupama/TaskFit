import json
import os
import openai
from schemas import TaskCreate

# Mock data for fallback
MOCK_TASKS = [
    {"description": "Design a relational database schema for a user management system.", "category": "Backend", "difficulty": "Medium"},
    {"description": "Implement a RESTful API using FastAPI with JWT authentication.", "category": "Backend", "difficulty": "Medium"},
    {"description": "Build a responsive frontend using React and Tailwind CSS.", "category": "Frontend", "difficulty": "Medium"},
    {"description": "Deploy the application to AWS using Docker containers.", "category": "DevOps", "difficulty": "Hard"},
    {"description": "Write unit and integration tests to ensure 80% code coverage.", "category": "Testing", "difficulty": "Medium"},
    {"description": "Optimize SQL queries for performance improvements.", "category": "Database", "difficulty": "Hard"},
    {"description": "Collaborate with product managers to define feature requirements.", "category": "Soft Skills", "difficulty": "Easy"},
    {"description": "Debug production issues using logging and monitoring tools.", "category": "Maintenance", "difficulty": "Hard"},
]

def extract_tasks_from_description(description: str, cv_text: str = None) -> list[TaskCreate]:
    api_key = os.getenv("OPENAI_API_KEY")
    
    if not api_key:
        print("No OpenAI API Key found. Using mock data.")
        # Mock logic: if "Python" in CV and task has "Python", score 2.
        tasks = [TaskCreate(**t) for t in MOCK_TASKS]
        if cv_text:
             for t in tasks:
                 # Simple heuristic for mock
                 if t.category.lower() in cv_text.lower():
                     t.predicted_score = 2
                 else:
                     t.predicted_score = 0
        return tasks

    openai.api_key = api_key
    
    system_prompt = """
    You are an expert technical recruiter and engineering manager. 
    Your goal is to extract 8-15 concrete, atomic, and assessable technical tasks from a job description.
    Ignore generic requirements like "good communication". Focus on what they will actually DO.
    
    If a CANIDATE CV context is provided, also PREDICT the candidate's ability score for each task based on their experience:
    - 2: Strong evidence in CV (e.g. "Used Python for 5 years" vs Task "Write Python")
    - 1: Partial evidence or transferrable skill
    - 0: No evidence
    
    Output must be a JSON object with a key "tasks" containing a list of objects.
    Each object must have:
    - description: string (The task)
    - category: string (e.g., Backend, Frontend, CI/CD, System Design)
    - difficulty: string (Easy, Medium, Hard)
    - predicted_score: integer (0, 1, 2) [Optional, only if CV provided]
    
    Example JSON:
    {
      "tasks": [
        {"description": "Write a Python script", "category": "Scripting", "difficulty": "Easy", "predicted_score": 2}
      ]
    }
    """

    user_content = f"Job Description:\n{description}"
    if cv_text:
        user_content += f"\n\nCandidate CV:\n{cv_text}"

    try:
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_content}
            ],
            temperature=0.0
        )
        
        content = response.choices[0].message.content
        data = json.loads(content)
        # Handle potential extra fields dynamically
        tasks_out = []
        for t in data.get("tasks", []):
             # Ensure strict pydantic mapping
             task_obj = TaskCreate(
                 description=t['description'],
                 category=t.get('category'),
                 difficulty=t.get('difficulty')
             )
             if 'predicted_score' in t:
                 # We need to add this field to Pydantic first
                 setattr(task_obj, 'predicted_score', t['predicted_score'])
             tasks_out.append(task_obj)
        return tasks_out

    except Exception as e:
        print(f"Error calling LLM: {e}")
        return [TaskCreate(**t) for t in MOCK_TASKS]

def generate_cover_letter(job_description: str, strengths: list[str], gaps: list[str]) -> str:
    api_key = os.getenv("OPENAI_API_KEY")
    
    if not api_key:
        return """[MOCK COVER LETTER]
Dear Hiring Manager,

I am writing to express my strong interest in this position. Based on the job description, my background in {strengths} aligns perfectly with your needs.

While I have less experience with {gaps}, I am a fast learner and eager to upskill in these areas.

Sincerely,
Candidate"""

    openai.api_key = api_key
    
    system_prompt = """
    You are an expert career coach and professional copywriter.
    Write a compelling, personalized cover letter for a candidate applying to the provided Job Description.
    
    Guidelines:
    1. Hook the reader immediately.
    2. Explicitly mention the candidate's confirmed STRENGTHS as proof of value.
    3. Briefly acknowledge the GAPS but frame them positively (e.g., "eager to expand my expertise in...").
    4. Keep it concise (under 300 words).
    5. return ONLY the body of the email/letter. No placeholders like [Your Name] unless necessary.
    """

    user_content = f"""
    JOB DESCRIPTION:
    {job_description[:2000]}...

    CANDIDATE STRENGTHS (Verified):
    {", ".join(strengths)}

    CANDIDATE GAPS (To learn):
    {", ".join(gaps)}
    """

    try:
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_content}
            ],
            temperature=0.7
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"Error calling LLM for Cover Letter: {e}")
        return "Error generating cover letter."

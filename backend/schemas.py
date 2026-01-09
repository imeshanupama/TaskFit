from pydantic import BaseModel
from typing import List, Optional

class TaskBase(BaseModel):
    description: str
    category: Optional[str] = None
    difficulty: Optional[str] = None

class TaskCreate(TaskBase):
    pass

class Task(TaskBase):
    id: str
    job_id: str
    predicted_score: Optional[int] = None # New field

    class Config:
        from_attributes = True

class JobResponse(BaseModel):
    job_id: str
    tasks: List[Task]

class AssessmentItem(BaseModel):
    task_id: str
    score: int 

class AssessmentRequest(BaseModel):
    job_id: str
    assessments: List[AssessmentItem]

class FitResultResponse(BaseModel):
    fit_score: float
    category: str
    strengths: List[str]
    gaps: List[str]

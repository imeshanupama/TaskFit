from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
import models
import schemas

router = APIRouter(prefix="/assessments", tags=["assessments"])

@router.post("/", response_model=schemas.FitResultResponse)
def submit_assessments(payload: schemas.AssessmentRequest, db: Session = Depends(get_db)):
    if not payload.assessments:
        raise HTTPException(status_code=400, detail="No assessments provided")

    job_id = payload.job_id
    
    # Save assessments
    total_score = 0
    max_score = len(payload.assessments) * 2
    
    strengths = []
    gaps = []

    for a in payload.assessments:
        # Check if already exists? For MVP just add new or update
        # We will insert new for simplicity of log
        db_assessment = models.Assessment(task_id=a.task_id, score=a.score)
        db.add(db_assessment)
        total_score += a.score
        
        # Fetch task details for report
        task = db.query(models.Task).filter(models.Task.id == a.task_id).first()
        if task:
            if a.score == 2:
                strengths.append(task.description)
            elif a.score == 0:
                gaps.append(task.description)

    # Calculate Fit
    fit_percentage = (total_score / max_score) * 100 if max_score > 0 else 0
    
    category = "Not a Fit (Yet)"
    if fit_percentage >= 80:
        category = "Strong Fit"
    elif fit_percentage >= 60:
        category = "Possible Fit"
    elif fit_percentage >= 40:
        category = "Stretch Role"

    summary = f"You scored {int(fit_percentage)}%. You are a {category}."

    # Save Fit Result
    db_result = models.FitResult(
        job_id=job_id,
        fit_score=fit_percentage,
        category=category,
        summary=summary
    )
    db.add(db_result)
    db.commit()

    return schemas.FitResultResponse(
        fit_score=fit_percentage,
        category=category,
        strengths=strengths,
        gaps=gaps
    )

@router.get("/results/{job_id}", response_model=List[schemas.FitResultResponse]) # Simplified for MVP
def get_results(job_id: str, db: Session = Depends(get_db)):
    results = db.query(models.FitResult).filter(models.FitResult.job_id == job_id).all()
    # In a real app we'd map this better, but for MVP just sending last or list
    # We will just return the list for now
    out = []
    for r in results:
        out.append(schemas.FitResultResponse(
            job_id=r.job_id,
            fit_score=r.fit_score,
            category=r.category,
            summary=r.summary,
            strengths=[], # stored separately or re-calculated
            gaps=[]
        ))
    return out

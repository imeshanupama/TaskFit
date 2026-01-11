from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas
from services.ai_service import generate_cover_letter

router = APIRouter(prefix="/generator", tags=["generator"])

@router.post("/cover-letter", response_model=schemas.CoverLetterResponse)
def create_cover_letter(request: schemas.CoverLetterRequest, db: Session = Depends(get_db)):
    # 1. Fetch Job
    job = db.query(models.Job).filter(models.Job.id == request.job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    # 2. Generate Letter
    letter = generate_cover_letter(job.raw_description, request.strengths, request.gaps)
    
    return schemas.CoverLetterResponse(cover_letter=letter)

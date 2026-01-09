from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas
from services.ai_service import extract_tasks_from_description
import io
import pypdf
import docx

router = APIRouter(prefix="/jobs", tags=["jobs"])

def extract_text_from_pdf(file_bytes):
    pdf = pypdf.PdfReader(io.BytesIO(file_bytes))
    text = ""
    for page in pdf.pages:
        text += page.extract_text() or ""
    return text

def extract_text_from_docx(file_bytes):
    doc = docx.Document(io.BytesIO(file_bytes))
    text = ""
    for para in doc.paragraphs:
        text += para.text + "\n"
    return text

@router.post("/", response_model=schemas.JobResponse)
def create_job(
    raw_description: str = Form(None),
    file: UploadFile = File(None),
    cv_file: UploadFile = File(None), 
    db: Session = Depends(get_db)
):
    final_description = raw_description or ""

    # Process Description File
    if file:
        content = file.file.read()
        if file.filename.lower().endswith(".pdf"):
            final_description += "\n" + extract_text_from_pdf(content)
        elif file.filename.lower().endswith(".docx"):
            final_description += "\n" + extract_text_from_docx(content)
        else:
            final_description += "\n" + content.decode("utf-8", errors="ignore")
    
    if not final_description.strip():
        raise HTTPException(status_code=400, detail="Description or file required")

    # Process CV File
    cv_text = None
    if cv_file:
        cv_content = cv_file.file.read()
        if cv_file.filename.lower().endswith(".pdf"):
             cv_text = extract_text_from_pdf(cv_content)
        elif cv_file.filename.lower().endswith(".docx"):
             cv_text = extract_text_from_docx(cv_content)
        else:
             cv_text = cv_content.decode("utf-8", errors="ignore")

    # 1. Save Job
    db_job = models.Job(raw_description=final_description)
    db.add(db_job)
    db.commit()
    db.refresh(db_job)

    # 2. Extract Tasks (with optional CV)
    extracted_tasks = extract_tasks_from_description(final_description, cv_text)
    
    # 3. Save Tasks
    for t in extracted_tasks:
        db_task = models.Task(
            job_id=db_job.id,
            description=t.description,
            category=t.category,
            difficulty=t.difficulty,
            predicted_score=getattr(t, 'predicted_score', None)
        )
        db.add(db_task)
        
    db.commit()
    db.refresh(db_job)

    # Convert to response format
    return schemas.JobResponse(
        job_id=db_job.id,
        tasks=[schemas.Task(
            id=t.id, 
            job_id=t.job_id, 
            description=t.description, 
            category=t.category, 
            difficulty=t.difficulty,
            predicted_score=t.predicted_score
        ) for t in db_job.tasks]
    )

@router.get("/{job_id}", response_model=schemas.JobResponse) # Fixed Schema
def get_job(job_id: str, db: Session = Depends(get_db)):
    job = db.query(models.Job).filter(models.Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    return schemas.JobResponse(
        job_id=job.id,
        tasks=[schemas.Task(
            id=t.id, 
            job_id=t.job_id, 
            description=t.description, 
            category=t.category, 
            difficulty=t.difficulty,
            predicted_score=t.predicted_score
        ) for t in job.tasks]
    )

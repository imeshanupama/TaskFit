import uuid
from sqlalchemy import Column, String, Integer, Float, ForeignKey, Text, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class Job(Base):
    __tablename__ = "jobs"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    raw_description = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    tasks = relationship("Task", back_populates="job")
    fit_results = relationship("FitResult", back_populates="job")

class Task(Base):
    __tablename__ = "tasks"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    job_id = Column(String, ForeignKey("jobs.id"))
    description = Column(Text, nullable=False)
    category = Column(String, nullable=True)
    difficulty = Column(String, nullable=True) # e.g. "Hard", "Medium"
    predicted_score = Column(Integer, nullable=True) # 0, 1, 2

    job = relationship("Job", back_populates="tasks")
    assessments = relationship("Assessment", back_populates="task")

class Assessment(Base):
    __tablename__ = "assessments"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    task_id = Column(String, ForeignKey("tasks.id"))
    score = Column(Integer, nullable=False) # 0, 1, 2

    task = relationship("Task", back_populates="assessments")

class FitResult(Base):
    __tablename__ = "fit_results"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    job_id = Column(String, ForeignKey("jobs.id"))
    fit_score = Column(Float, nullable=False)
    summary = Column(Text, nullable=True)
    category = Column(String, nullable=True) # Strong, Possible, Stretch, Not Yet

    job = relationship("Job", back_populates="fit_results")

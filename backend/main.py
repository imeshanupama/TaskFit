from fastapi import FastAPI
from database import engine, Base
from routers import jobs, assessments, generator
from fastapi.middleware.cors import CORSMiddleware
import models

# Create tables (simple migration substitute for MVP)
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# Allow CORS for Expo
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(jobs.router)
app.include_router(assessments.router)
app.include_router(generator.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to TaskFit API"}

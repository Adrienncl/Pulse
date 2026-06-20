"""
Simple test script for Zero Employee Studio OS backend
Tests the API endpoints without external dependencies
"""

from fastapi import FastAPI
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import uuid

# Simple in-memory storage
projects = {}

app = FastAPI()

class ProjectCreate(BaseModel):
    client_brief: str
    initial_budget: float = 1000.0
    currency: str = "USD"

@app.get("/")
def root():
    return {"name": "Zero Employee Studio OS", "status": "running"}

@app.post("/api/projects/start")
def start_project(project_create: ProjectCreate):
    project_id = f"proj_{uuid.uuid4().hex[:8]}"
    now = datetime.now().isoformat()
    
    project = {
        "id": project_id,
        "client_brief": project_create.client_brief,
        "status": "started",
        "initial_budget": project_create.initial_budget,
        "currency": project_create.currency,
        "created_at": now,
        "updated_at": now
    }
    
    projects[project_id] = project
    return project

@app.get("/api/projects/{project_id}")
def get_project(project_id: str):
    if project_id not in projects:
        return {"error": "Not found"}
    return projects[project_id]

if __name__ == "__main__":
    import uvicorn
    print("Starting Zero Employee Studio OS backend...")
    uvicorn.run(app, host="0.0.0.0", port=8000)

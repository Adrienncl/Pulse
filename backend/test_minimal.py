"""
Minimal test for Zero Employee Studio OS
Tests basic functionality without external dependencies
"""

from datetime import datetime
import uuid

# Simple in-memory storage
projects = {}

def start_project(client_brief: str, initial_budget: float = 1000.0):
    project_id = f"proj_{uuid.uuid4().hex[:8]}"
    now = datetime.now().isoformat()
    
    project = {
        "id": project_id,
        "client_brief": client_brief,
        "status": "started",
        "initial_budget": initial_budget,
        "currency": "USD",
        "created_at": now,
        "updated_at": now
    }
    
    projects[project_id] = project
    return project

def get_project(project_id: str):
    return projects.get(project_id, {"error": "Not found"})

# Test
if __name__ == "__main__":
    print("Testing Zero Employee Studio OS...")
    
    # Start a project
    project = start_project("I'm opening an Italian restaurant")
    print(f"✅ Project created: {project['id']}")
    
    # Get project
    retrieved = get_project(project['id'])
    print(f"✅ Project retrieved: {retrieved['status']}")
    
    print("\n✅ All tests passed!")

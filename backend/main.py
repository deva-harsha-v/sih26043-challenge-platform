from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from db.database import engine, Base
from models import user, organization, university, challenge, team, submission, skill
from routes import auth, challenges

# Initialize tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="SIH26043 Challenge Platform API",
    description="Backend services for SIH26043 challenge submission, team formation, and role-based management.",
    version="0.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(challenges.router)

@app.get("/")
def read_root():
    return {"message": "SIH26043 Challenge Platform API is running"}

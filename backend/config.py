import os
from pydantic_settings import BaseSettings if os.getenv("USE_PYDANTIC_V2") else object

class Settings:
    PROJECT_NAME: str = "SIH26043 Challenge Platform"
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://sih_user:sih_password@localhost:5432/sih_challenge_db")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "supersecretjwtkeychangeinproduction")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))

settings = Settings()

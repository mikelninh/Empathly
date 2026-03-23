"""
App configuration loaded from .env file.

LEARNING NOTE:
- pydantic-settings reads env vars and .env files automatically
- Type annotations enforce types (e.g. str, int)
- Gives you a single place for all config — no scattered os.getenv() calls
"""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    openrouter_api_key: str = ""
    default_model: str = "meta-llama/llama-3.3-70b-instruct"
    database_url: str = "sqlite:///./gefuehle.db"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()

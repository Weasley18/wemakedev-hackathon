import os
from pydantic import BaseSettings
from decouple import config
from typing import Dict, List, Optional

class Settings(BaseSettings):
    # API Settings
    API_V1_STR: str = "/api"
    PROJECT_NAME: str = "Threat-Seeker AI"
    
    # Security Settings
    SECRET_KEY: str = config("SECRET_KEY", default="supersecretkey")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = config("ACCESS_TOKEN_EXPIRE_MINUTES", default=30, cast=int)
    
    # LLM Settings
    GEMINI_API_KEY: str = config("GEMINI_API_KEY", default="")
    DEFAULT_LLM_MODEL: str = config("DEFAULT_LLM_MODEL", default="gemini-1.5-pro")
    
    # Data Source Settings
    SPLUNK_HOST: str = config("SPLUNK_HOST", default="")
    SPLUNK_PORT: int = config("SPLUNK_PORT", default=8089, cast=int)
    SPLUNK_USERNAME: str = config("SPLUNK_USERNAME", default="")
    SPLUNK_PASSWORD: str = config("SPLUNK_PASSWORD", default="")
    
    ELASTIC_HOST: str = config("ELASTIC_HOST", default="http://localhost:9200")
    ELASTIC_USERNAME: str = config("ELASTIC_USERNAME", default="")
    ELASTIC_PASSWORD: str = config("ELASTIC_PASSWORD", default="")
    
    # Advanced Settings
    ENABLE_HYPOTHESIS_GENERATION: bool = config("ENABLE_HYPOTHESIS_GENERATION", default=True, cast=bool)
    MAX_QUERIES_PER_PLAN: int = config("MAX_QUERIES_PER_PLAN", default=10, cast=int)
    MAX_RESULTS_PER_QUERY: int = config("MAX_RESULTS_PER_QUERY", default=1000, cast=int)
    THREAT_INTEL_SOURCES: str = config("THREAT_INTEL_SOURCES", default="")
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True
        
        @classmethod
        def customise_sources(cls, init_settings, env_settings, file_secret_settings):
            # Try .env first, then fallback to env.example if .env doesn't exist
            if not os.path.isfile(".env") and os.path.isfile("env.example"):
                env_settings.env_file = "env.example"
            return (init_settings, env_settings, file_secret_settings)

settings = Settings()

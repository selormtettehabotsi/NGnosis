from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    # Application
    app_env: str = "development"
    app_host: str = "0.0.0.0"
    app_port: int = 8000
    secret_key: str = "change-me-in-production"

    # Database
    database_url: str = "sqlite:///./data/gnosis.db"

    # Vector Store
    chroma_persist_dir: str = "./data/chroma"

    # Uploads
    upload_dir: str = "./data/uploads"
    max_upload_size_mb: int = 50

    # Anthropic
    anthropic_api_key: str = ""
    claude_model: str = "claude-sonnet-4-6"

    # CORS
    frontend_url: str = "http://localhost:5173"

    # MCP
    mcp_server_host: str = "0.0.0.0"
    mcp_server_port: int = 8001

    @property
    def max_upload_size_bytes(self) -> int:
        return self.max_upload_size_mb * 1024 * 1024

    @property
    def is_development(self) -> bool:
        return self.app_env == "development"


@lru_cache
def get_settings() -> Settings:
    return Settings()

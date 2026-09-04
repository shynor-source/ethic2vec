"""Application settings loaded from environment variables."""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Backend configuration."""

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    firebase_credentials_path: str = "secrets/serviceAccountKey.json"
    assets_base_url: str = (
        "https://raw.githubusercontent.com/shynor-source/ethic2vec/main/cloud-assets"
    )


settings = Settings()

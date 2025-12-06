"""
Configuration Module for NBA Injury Risk Prediction Application

This module centralizes all configuration settings for the application,
making it easy to manage different environments (development, production)
and update API endpoints without modifying the core application code.

Educational Note:
-----------------
Configuration management is a best practice in software development because it:
1. Separates concerns - keeps config separate from business logic
2. Makes the app more maintainable - all settings in one place
3. Enhances security - sensitive data stored in environment variables
4. Enables multiple environments - easy to switch between dev/prod settings
"""

import os
from dotenv import load_dotenv

# Load environment variables from .env file
# This allows us to store sensitive configuration in a file that won't be committed to git
load_dotenv()


class Config:
    """
    Base configuration class containing all application settings.

    This class uses environment variables with sensible defaults for flexibility.
    Students can modify these settings either by:
    1. Creating a .env file (recommended for sensitive data)
    2. Setting environment variables in their shell
    3. Modifying the default values here (for non-sensitive settings)
    """

    # ============================================================================
    # Flask Application Settings
    # ============================================================================

    # Secret key for Flask session management
    # In production, this should be a long, random string stored as an environment variable
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key-change-in-production")

    # Debug mode - should be False in production
    DEBUG = os.getenv("FLASK_DEBUG", "True").lower() == "true"

    # Server host - 0.0.0.0 allows external connections, 127.0.0.1 is local only
    HOST = os.getenv("FLASK_HOST", "0.0.0.0")

    # Server port - the port on which the Flask application will run
    PORT = int(os.getenv("FLASK_PORT", 4000))

    # ============================================================================
    # MLflow / Databricks Configuration
    # ============================================================================

    # Databricks authentication token
    # IMPORTANT: Never commit this token to version control!
    # Set this in your .env file or as an environment variable
    DATABRICKS_TOKEN = os.getenv("DATABRICKS_TOKEN")

    # MLflow model serving endpoint URL
    # This is the URL where your deployed NBA injury model is hosted
    # Update the environment variable MLFLOW_ENDPOINT_URL on Render if needed.
    MLFLOW_ENDPOINT_URL = os.getenv(
        "MLFLOW_ENDPOINT_URL",
        "https://dbc-01cfc608-1a13.cloud.databricks.com/serving-endpoints/nba_injury_pred_rf/invocations",
    )

    # Request timeout in seconds for API calls to the MLflow endpoint
    REQUEST_TIMEOUT = int(os.getenv("REQUEST_TIMEOUT", 30))

    # ============================================================================
    # Model Configuration
    # ============================================================================

    # Expected feature names that the model accepts.
    # This list must match exactly what your trained Databricks model expects.
    # These are the numeric features used in the NBA injury risk model.
    MODEL_FEATURES = [
        "AGE",                  # Player age
        "PLAYER_HEIGHT_INCHES", # Player height (inches)
        "PLAYER_WEIGHT",        # Player weight (lbs)
        "USG_PCT",              # Usage percentage
        "AVG_SEC_PER_TOUCH",    # Average seconds per touch
        "AVG_DRIB_PER_TOUCH",   # Average dribbles per touch
        "ELBOW_TOUCHES",        # Elbow touches per game
        "POST_TOUCHES",         # Post touches per game
        "PAINT_TOUCHES",        # Paint touches per game
    ]

    # ============================================================================
    # Application Metadata
    # ============================================================================

    # Application name and version for display purposes
    APP_NAME = os.getenv("APP_NAME", "NBA Injury Risk Predictor")
    APP_VERSION = os.getenv("APP_VERSION", "1.0.0")

    # ============================================================================
    # Validation Methods
    # ============================================================================

    @classmethod
    def validate_config(cls):
        """
        Validates that all required configuration variables are set.

        This method should be called on application startup to ensure
        that the application has all necessary configuration to run properly.

        Returns:
            tuple: (is_valid: bool, error_messages: list)
        """
        errors = []

        # Check for required Databricks token
        if not cls.DATABRICKS_TOKEN:
            errors.append(
                "DATABRICKS_TOKEN is not set. Please set it in your .env file or as an environment variable."
            )

        # Check for required MLflow endpoint URL
        if not cls.MLFLOW_ENDPOINT_URL:
            errors.append(
                "MLFLOW_ENDPOINT_URL is not set. Please configure your MLflow endpoint URL."
            )

        # Validate that endpoint URL is a valid HTTPS URL
        if cls.MLFLOW_ENDPOINT_URL and not cls.MLFLOW_ENDPOINT_URL.startswith("https://"):
            errors.append(
                "MLFLOW_ENDPOINT_URL should use HTTPS for security. Current URL: "
                + cls.MLFLOW_ENDPOINT_URL
            )

        return len(errors) == 0, errors

    @classmethod
    def print_config_status(cls):
        """
        Prints the current configuration status to the console.

        Sensitive values (like tokens) are masked for security.
        """
        print("\n" + "=" * 70)
        print("NBA INJURY PREDICTION APP - CONFIGURATION STATUS")
        print("=" * 70)
        print(f"App Name: {cls.APP_NAME}")
        print(f"Version: {cls.APP_VERSION}")
        print(f"Debug Mode: {cls.DEBUG}")
        print(f"Host: {cls.HOST}")
        print(f"Port: {cls.PORT}")
        print("-" * 70)
        print("MLflow Configuration:")
        print(f"Endpoint URL: {cls.MLFLOW_ENDPOINT_URL}")
        print(
            f"Token Set: {'Yes (***hidden***)' if cls.DATABRICKS_TOKEN else 'No (NOT SET!)'}"
        )
        print(f"Request Timeout: {cls.REQUEST_TIMEOUT}s")
        print("-" * 70)
        print(f"Model Features: {', '.join(cls.MODEL_FEATURES)}")
        print("=" * 70 + "\n")


class DevelopmentConfig(Config):
    """Development-specific configuration."""
    DEBUG = True


class ProductionConfig(Config):
    """
    Production-specific configuration.

    Inherits from Config and overrides settings specific to production deployment.
    Production config should prioritize security and performance.
    """
    DEBUG = False

    @classmethod
    def validate_config(cls):
        is_valid, errors = super().validate_config()

        # Additional production-specific validations
        if cls.SECRET_KEY == "dev-secret-key-change-in-production":
            errors.append(
                "SECRET_KEY is using the default development value. "
                "Please set a secure random value in production."
            )

        return len(errors) == 0, errors


# Configuration dictionary for easy access to different config classes
config_by_name = {
    "development": DevelopmentConfig,
    "production": ProductionConfig,
    "default": DevelopmentConfig,
}


def get_config(config_name: str = "default"):
    """
    Returns the appropriate configuration class based on the environment.

    Args:
        config_name (str): The name of the configuration ('development', 'production', or 'default')

    Returns:
        Config: The configuration class for the specified environment
    """
    return config_by_name.get(config_name, DevelopmentConfig)

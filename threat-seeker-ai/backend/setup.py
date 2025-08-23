from setuptools import setup, find_packages

setup(
    name="threat-seeker-ai",
    version="1.0.0",
    packages=find_packages(),
    install_requires=[
        "fastapi==0.95.2",
        "uvicorn==0.22.0",
        "langchain==0.0.267",
        "google-generativeai==0.3.2",
        "langchain-google-genai==0.0.6",
        "pydantic==1.10.8",
        "python-dotenv==1.0.0",
        "python-jose[cryptography]==3.3.0",
        "passlib[bcrypt]==1.7.4",
        "python-multipart==0.0.6",
        "requests==2.31.0",
        "six>=1.16.0",
        "elasticsearch==8.8.0",
        "python-decouple==3.8",
    ],
    python_requires=">=3.8",
)

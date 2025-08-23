#!/bin/bash
echo "Setting up environment..."
pip3 install wheel setuptools six

echo "Installing main requirements..."
pip3 install -e .

echo "Starting application..."
uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}

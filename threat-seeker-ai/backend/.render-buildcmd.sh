#!/bin/bash
# Install essential build dependencies first
pip3 install wheel setuptools six

# Install the project in development mode
pip3 install -e .

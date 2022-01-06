#!/bin/bash

# Setup venv

source venv/bin/activate


#Flask setup and run

export FLASK_APP=server
flask run --port 5005

# Build and serve react form

yarn build 
serve -s build -l 3000
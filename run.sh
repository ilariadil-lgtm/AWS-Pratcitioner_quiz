#!/bin/bash

# Activate virtual environment
source venv/bin/activate

# Run Flask application
# Verify if app.py exists, if not, create a dummy one or warn
if [ ! -f "app.py" ]; then
    echo "app.py not found! Please ensure the backend is implemented."
    exit 1
fi

export FLASK_APP=app.py
export FLASK_ENV=development
flask run

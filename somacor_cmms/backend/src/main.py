#!/usr/bin/env python
import os
import sys
import django
from django.core.wsgi import get_wsgi_application

# Add the parent directory to the Python path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Set the Django settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cmms_project.settings')

# Setup Django
django.setup()

# Get the WSGI application
application = get_wsgi_application()

# For compatibility with deployment systems that expect a Flask-like app
app = application

if __name__ == '__main__':
    from django.core.management import execute_from_command_line
    execute_from_command_line(sys.argv)


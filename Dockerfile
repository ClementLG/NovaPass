# 1. Use an official, lightweight Python image as a base
FROM python:3.10-slim

# 2. Set the working directory inside the container
WORKDIR /app

# 3. Copy the dependency file
# This is copied before the rest of the code to leverage Docker's cache.
# If this file doesn't change, Docker won't need to reinstall dependencies.
COPY requirements.txt .

# 4. Install the dependencies
RUN pip install --no-cache-dir -r requirements.txt

# 5. Copy the rest of the application code
COPY . .

# 6. Expose the port the application will use
EXPOSE 5000

# 7. Define the command to run the application with Gunicorn
# "app:create_app()" points to the factory function in app/__init__.py
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "app:create_app()"]
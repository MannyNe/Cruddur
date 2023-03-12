# Build Stage
# Start from a minimalistic Python image and copy requirements.txt
FROM python:3.10-slim-buster AS builder
WORKDIR /backend-flask
COPY requirements.txt .

# Install required packages
RUN pip install --no-cache-dir -r requirements.txt

# Production Stage
# Start from a minimalistic Python image
FROM python:3.10-slim-buster

# Set the working directory to /app
WORKDIR /backend-flask

# Copy the installed packages from the builder stage
COPY --from=builder /usr/local/lib/python3.10/site-packages /usr/local/lib/python3.10/site-packages

# Copy the current directory contents into the container at /app
COPY . .

# Expose the port the application will be running on
EXPOSE ${PORT}

# Define environment variables
ENV FLASK_APP=app.py \
    FLASK_ENV=development

# Run the command to start Flask
CMD [ "bash", "./init-backend.sh" ]
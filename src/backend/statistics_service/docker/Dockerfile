FROM python:3.11

RUN apt-get update && apt-get install -y postgresql-client

WORKDIR /app

COPY docker/requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY ../statistics_service /app

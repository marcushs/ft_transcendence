FROM python:3 

RUN apt-get update && apt-get install -y postgresql-client

WORKDIR /app

COPY docker/requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt
RUN pip install django-two-factor-auth[phonenumbers]
RUN pip install PyJWT
RUN pip install pyotp
RUN pip install pika

COPY ../auth_service /app
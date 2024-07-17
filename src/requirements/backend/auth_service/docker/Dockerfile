FROM python:3 

RUN apt-get update && apt-get install -y postgresql-client

WORKDIR /app

COPY docker/requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt
#two factor
RUN pip install pyotp django-two-factor-auth[phonenumbers]
#jwt
RUN pip install PyJWT
#rabbitMQ
RUN pip install pika

COPY ../auth_service /app
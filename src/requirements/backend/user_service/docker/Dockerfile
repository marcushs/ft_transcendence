FROM python:3 

RUN apt-get update && apt-get install -y postgresql-client

WORKDIR /app

COPY docker/requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt
#rabbitMQ
RUN pip install pika
#web socket
RUN pip install channels channels_rabbitmq daphne
COPY ../user_service /app

FROM python:3 

RUN apt-get update && apt-get install -y postgresql-client

WORKDIR /app

COPY docker/requirements.txt .

RUN python -m pip install -U channels["daphne"]

RUN pip install --no-cache-dir -r requirements.txt

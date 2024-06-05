FROM python:3 

RUN apt-get update \
    && apt-get install -y postgresql-client

WORKDIR /ft_transcendence

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY ./ft_transcendence .

CMD ["python3", "manage.py", "runserver", "0.0.0.0:8000"]

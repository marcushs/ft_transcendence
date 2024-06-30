FROM python:3 

RUN apt-get update \
    && apt-get install -y postgresql-client

WORKDIR /ft_transcendence

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt
RUN pip install django-two-factor-auth[phonenumbers]
RUN pip install PyJWT
RUN pip install pyotp

COPY ./ft_transcendence .

# CMD ["sh", "-c", "python3 manage.py migrate && python3 manage.py create_superuser --noinput && python3 manage.py runserver 0.0.0.0:8000"]

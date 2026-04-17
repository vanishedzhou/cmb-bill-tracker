FROM python:3.13-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt gunicorn

COPY . .

EXPOSE 5002

CMD ["gunicorn", "-w", "2", "-b", "0.0.0.0:5002", "--timeout", "300", "app:app"]

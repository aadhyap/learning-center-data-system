FROM python:3.12-slim

WORKDIR /app

COPY Docker/requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY backend/main.py .
COPY backend/db.py .
COPY backend/auth.py .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
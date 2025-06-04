# Multistage : build front + run FastAPI + serve React
FROM node:18-alpine AS frontend
WORKDIR /app
COPY Client/package*.json ./Client/
RUN cd Client && npm ci
COPY Client ./Client
RUN cd Client && npm run build

FROM python:3.11-slim
WORKDIR /app
COPY Server/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY Server /app
COPY --from=frontend /app/Client/dist /app/app/static

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]

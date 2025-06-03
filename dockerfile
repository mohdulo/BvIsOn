#####################################################################
# 1) BUILD FRONT-END (React / Vite)                                 #
#####################################################################
FROM node:20-alpine AS frontend-builder

# Outils requis par node-gyp (sass, sharp, etc.)
RUN apk add --no-cache python3 make g++

# 1-a) Copie + install
WORKDIR /app/Client
COPY Client/package*.json ./
RUN npm ci --silent

# 1-b) Build Vite
COPY Client/ .
RUN npm run build

#####################################################################
# 2) RUNTIME BACK-END (FastAPI + modèle)                            #
#####################################################################
FROM python:3.10-slim AS runtime

ENV PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PORT=8080

WORKDIR /app

# Dépendances système minimales (gcc utile pour psycopg2, etc.)
RUN apt-get update \
 && apt-get install -y --no-install-recommends build-essential gcc \
 && rm -rf /var/lib/apt/lists/*

# ----- back-end -----
COPY Server/ ./Server

# ----- assets front -----
COPY --from=frontend-builder /app/Client/dist ./Client/dist

# ----- install deps Python -----
RUN python -m pip install --upgrade pip \
 && pip install -r Server/requirements.txt

EXPOSE 8080

# Point d’entrée FastAPI — adapte le chemin si besoin
CMD ["uvicorn", "Server.main:app", "--host", "0.0.0.0", "--port", "8080"]

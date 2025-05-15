FROM python:3.11.2-slim

WORKDIR /app

# Créer un utilisateur non-root sécurisé
RUN adduser \
    --disabled-password \
    --gecos "" \
    --home "/nonexistent" \
    --shell "/sbin/nologin" \
    --no-create-home \
    --uid "10001" \
    appuser

# Installer les dépendances système
RUN apt-get update && apt-get install -y \
    gcc \
    build-essential \
    libffi-dev \
    libssl-dev \
    && rm -rf /var/lib/apt/lists/*

# Installer les dépendances Python
COPY requirements.txt .
RUN python -m pip install --upgrade pip
RUN python -m pip install -r requirements.txt

# Copier tout le projet dans l'image
COPY . .

# Définir la commande de lancement
CMD ["python3", "app/main.py"]

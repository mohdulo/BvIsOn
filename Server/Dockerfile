FROM python:3.11.2-slim

WORKDIR /app


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
COPY  . . 

RUN echo "📂 Contenu dans /app :" && ls -la /app

# Définir la commande de lancement
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]


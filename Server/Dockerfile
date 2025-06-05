# ✅ Image de base Python
FROM python:3.11.2

# Dossier de travail dans le conteneur
WORKDIR /app
RUN rm -f ./models/pipeline.pkl

# ✅ Installer les dépendances système nécessaires
RUN apt-get update && apt-get install -y \
    gcc \
    build-essential \
    libffi-dev \
    libssl-dev \
    default-libmysqlclient-dev \
    # netcat \
    && rm -rf /var/lib/apt/lists/*

# ✅ Copier uniquement requirements.txt en premier
# Cela permet de tirer parti du cache Docker si le code change mais pas les dépendances
COPY ./requirements.txt ./
COPY ./app/models/pipeline.pkl ./app/models/pipeline.pkl


# ✅ Installer les dépendances Python
RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# ✅ Copier ensuite tout le code source
COPY . .

# ✅ Ouvrir le port exposé par FastAPI
EXPOSE 8000

# ✅ Commande de démarrage (production-ready)
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]


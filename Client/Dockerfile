# Étape 1 : Build avec Vite
FROM node:20 AS builder

# Crée un répertoire de travail
WORKDIR /app

# Copie les fichiers package pour tirer parti du cache Docker
COPY package*.json ./

# Installer les dépendances sans scripts postinstall problématiques
ENV PUPPETEER_SKIP_DOWNLOAD=true
RUN npm ci --unsafe-perm

# Copie le reste des fichiers
COPY . .

# Build du projet Vite
RUN npm run build
# Étape 2 : Image NGINX légère pour servir l'app
FROM nginx:alpine

# Supprime les fichiers HTML par défaut de NGINX
RUN rm -rf /usr/share/nginx/html/*

# Copie le build depuis l'étape précédente
COPY --from=builder /app/dist /usr/share/nginx/html

# (Optionnel) Configuration NGINX personnalisée
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose le port utilisé par NGINX
EXPOSE 80

# Commande par défaut
CMD ["nginx", "-g", "daemon off;"]
# Étape 1 : build Vite
FROM node:20 AS builder

WORKDIR /app
COPY . .

RUN npm install && npm run build

# Étape 2 : NGINX pour servir les fichiers
FROM nginx:alpine

# Supprimer la config par défaut de NGINX
RUN rm -rf /usr/share/nginx/html/*

# Copier les fichiers buildés
COPY --from=builder /app/dist /usr/share/nginx/html

# Copier une config nginx si besoin
# COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

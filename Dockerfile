# VITE_API_BASE_URL is baked into the frontend at build time.

FROM node:24-alpine AS builder
WORKDIR /src

COPY package*.json ./
RUN npm ci
COPY . ./

ARG VITE_API_BASE_URL=/
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN npm run build

FROM docker.io/nginxinc/nginx-unprivileged:1.31-alpine
COPY --from=builder /src/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Nginx listens on 8080 inside the container.
EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]

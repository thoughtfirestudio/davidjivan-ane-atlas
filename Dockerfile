# Multi-stage: build the Vite app, then serve dist with nginx.
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
# SPA fallback so deep links resolve to index.html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80

# Stage 1: Сборка React
FROM node:20-alpine AS build

WORKDIR /app

# Копируем зависимости
COPY package*.json ./
RUN npm install

# Копируем весь проект и собираем React
COPY . .
RUN npm run build

# Stage 2: Nginx
FROM nginx:1.28-alpine

# Удаляем дефолтные файлы
RUN rm -rf /usr/share/nginx/html/*

# Копируем кастомный конфиг
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Копируем сборку React
COPY --from=build /app/dist /usr/share/nginx/html

# Экспонируем порт
EXPOSE 81

# Запуск Nginx
CMD ["nginx", "-g", "daemon off;"]

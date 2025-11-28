# todo

- ❌ переписать тест у Users.jsx, HealthCheck.jsx, SystemStatistics.jsx, Search.jsx

- ❌ Настроить страницу Search.jsx подключиться и настроить API

- ❌ рефакторинг кода, почистить, вынести стили и цвета

- ❌ придумать функционал, при котором загруженный файл на странице UploadFiles.jsx попадал на сервер → парсился → возвращался обратно на фронт

- ✅ исправить логику прогресс бара, баг с закрытием 

```
# Остановить старый контейнер
docker stop k101_admin_front

# Удалить его (чтобы не мешал имя)
docker rm k101_admin_front

# Пересобрать образ (если Dockerfile в текущей папке)
docker build -t k101_admin_front .

# Запустить новый контейнер
docker run -d -p 4302:81 --name k101_admin_front k101_admin_front

http://192.168.0.79:4302

```

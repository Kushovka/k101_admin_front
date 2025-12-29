# K101AdminFront (React + Vite)


## Local development

Install dependencies and start the local development server:

```bash
npm install
npm run dev

(http://localhost:5173)
```

## Build for production

```bash
npm run build
```

## Launching production via Docker + Nginx

// копирование проекта из локалки в ubunutu powershell

```bash
scp -r "C:\путь\к\проекту\k101_user_front" kirill@192.168.0.45:~/projects/
scp -r "C:\путь\к\проекту\k101_admin_front" kirill@192.168.0.45:~/projects/
```

// пересборка образа на сервере

```bash
cd ~/projects/k101_user_front
docker build --no-cache -t k101_user_front_react .

cd ~/projects/k101_admin_front
docker build --no-cache -t k101_admin_front_react .
```

// перезпуск контейнеров

```bash
docker rm -f k101_user_front_react
docker rm -f k101_admin_front_react

docker run -d -p 4300:80 --name k101_user_front_react k101_user_front_react
docker run -d -p 4301:80 --name k101_admin_front_react k101_admin_front_react
```

// на всякий фикс ошибки с vite (на примере с k101_user_front)

```bash
username@devops:~/projects/k101_user_front$ ls -la node_modules/.bin/vite

-rw-rw-r-- 1 username username 381 Dec  5 16:55 node_modules/.bin/vite

username@devops:~/projects/k101_user_front$ chmod +x node_modules/.bin/vite

```


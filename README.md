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

```bash
docker build -t k101_admin_front .
docker stop k101_admin_front
docker rm k101_admin_front
docker run -d -p 4302:81 --name k101_admin_front k101_admin_front

(http://192.168.0.79:4302 or http://localhost:4302)
```

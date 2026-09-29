# Biblioteca personal

Segundo proyecto de la ruta. Cada persona registra una cuenta, entra con JWT y lleva sus libros. El listado se cachea en Redis y el login se frena tras varios fallos.

## Tecnologías de la ruta

Además de React, Tailwind, JavaScript, npm, Git y Node.js:

- API REST en `/api/auth` y `/api/books`
- PostgreSQL, con el esquema en `server/sql/schema.sql` (el servidor lo aplica al arrancar)
- JWT en el header `Authorization: Bearer`
- Redis: caché de `GET /api/books` (60 segundos) y tope de 5 intentos de login cada 15 minutos

Docker Compose solo levanta Postgres y Redis. No hay Linux, AWS, Monit, GitHub Actions, Ansible ni Terraform.

## Requisitos

Node.js 22 o superior y Docker.

## Arranque

Desde esta carpeta:

```bash
docker compose up -d
```

Copia el entorno si todavía no existe `server/.env`:

```bash
cp server/.env.example server/.env
```

En una terminal:

```bash
cd server
npm install
npm test
npm run dev
```

En otra:

```bash
cd client
npm install
npm run dev
```

Abre http://localhost:5174. La API escucha en http://localhost:3002.

## Qué probar

1. Crea una cuenta e inicia sesión.
2. Agrega un libro, cámbialo de estado y bórralo.
3. Cierra sesión y vuelve a entrar: los libros siguen en Postgres.
4. Prueba una contraseña incorrecta de al menos 8 caracteres cinco veces: el sexto intento responde 429.

El secreto `JWT_SECRET` del ejemplo solo sirve en local. Cámbialo si publicas el servidor.

## Git y GitHub

```bash
git add .
git commit -m "Biblioteca con Postgres, JWT y Redis"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/02-biblioteca.git
git push -u origin main
```

No subas `server/.env`. Ya está en `.gitignore`.

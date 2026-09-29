import './env.js'
import cors from 'cors'
import express from 'express'
import { checkPassword, hashPassword, publicUser, requireAuth, signToken } from './auth.js'
import { initDb, pool } from './db.js'
import { connectRedis, redis } from './redis.js'
import { validateBook, validateLogin, validateRegister } from './validators.js'

for (const key of ['DATABASE_URL', 'REDIS_URL', 'JWT_SECRET']) {
  if (!process.env[key]) {
    console.error(`Falta ${key} en server/.env`)
    process.exit(1)
  }
}

const app = express()
const port = Number(process.env.PORT || 3002)
const LOGIN_LIMIT = 5
const LOGIN_WINDOW_SECONDS = 15 * 60
const BOOKS_CACHE_SECONDS = 60

app.use(cors())
app.use(express.json())

function route(handler) {
  return (req, res, next) => {
    Promise.resolve(handler(req, res)).catch((error) => {
      if (error.status) return res.status(error.status).json({ error: error.message })
      if (error.code === '23505') return res.status(409).json({ error: 'Ese correo ya está registrado' })
      next(error)
    })
  }
}

function booksKey(userId) {
  return `books:${userId}`
}

function loginKey(email) {
  return `login:${email}`
}

async function readBooks(userId) {
  const key = booksKey(userId)
  const cached = await redis.get(key)
  if (cached) return JSON.parse(cached)

  const { rows } = await pool.query(
    `SELECT id, title, author, status, note, created_at
     FROM books
     WHERE user_id = $1
     ORDER BY created_at DESC`,
    [userId],
  )
  await redis.set(key, JSON.stringify(rows), 'EX', BOOKS_CACHE_SECONDS)
  return rows
}

async function forgetBooks(userId) {
  await redis.del(booksKey(userId))
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true })
})

app.post(
  '/api/auth/register',
  route(async (req, res) => {
    const input = validateRegister(req.body)
    const passwordHash = await hashPassword(input.password)
    const { rows } = await pool.query(
      `INSERT INTO users (email, password_hash, name)
       VALUES ($1, $2, $3)
       RETURNING id, email, name`,
      [input.email, passwordHash, input.name],
    )
    const user = publicUser(rows[0])
    res.status(201).json({ token: signToken(user), user })
  }),
)

app.post(
  '/api/auth/login',
  route(async (req, res) => {
    const input = validateLogin(req.body)
    const key = loginKey(input.email)
    const attempts = Number((await redis.get(key)) || 0)
    if (attempts >= LOGIN_LIMIT) {
      return res.status(429).json({ error: 'Demasiados intentos. Espera 15 minutos.' })
    }

    const { rows } = await pool.query('SELECT id, email, name, password_hash FROM users WHERE email = $1', [
      input.email,
    ])
    const user = rows[0]
    const matches = user ? await checkPassword(input.password, user.password_hash) : false
    if (!matches) {
      await redis.multi().incr(key).expire(key, LOGIN_WINDOW_SECONDS).exec()
      return res.status(401).json({ error: 'Correo o contraseña incorrectos' })
    }

    await redis.del(key)
    const publicProfile = publicUser(user)
    res.json({ token: signToken(publicProfile), user: publicProfile })
  }),
)

app.get(
  '/api/me',
  requireAuth,
  route(async (req, res) => {
    const { rows } = await pool.query('SELECT id, email, name FROM users WHERE id = $1', [req.user.id])
    if (!rows[0]) return res.status(401).json({ error: 'No autenticado' })
    res.json(publicUser(rows[0]))
  }),
)

app.get(
  '/api/books',
  requireAuth,
  route(async (req, res) => {
    res.json(await readBooks(req.user.id))
  }),
)

app.post(
  '/api/books',
  requireAuth,
  route(async (req, res) => {
    const book = validateBook(req.body)
    const { rows } = await pool.query(
      `INSERT INTO books (user_id, title, author, status, note)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, title, author, status, note, created_at`,
      [req.user.id, book.title, book.author, book.status, book.note],
    )
    await forgetBooks(req.user.id)
    res.status(201).json(rows[0])
  }),
)

app.patch(
  '/api/books/:id',
  requireAuth,
  route(async (req, res) => {
    const bookId = Number(req.params.id)
    if (!Number.isInteger(bookId)) return res.status(400).json({ error: 'Libro no válido' })
    const book = validateBook(req.body)
    const { rows } = await pool.query(
      `UPDATE books
       SET title = $1, author = $2, status = $3, note = $4
       WHERE id = $5 AND user_id = $6
       RETURNING id, title, author, status, note, created_at`,
      [book.title, book.author, book.status, book.note, bookId, req.user.id],
    )
    if (!rows[0]) return res.status(404).json({ error: 'Libro no encontrado' })
    await forgetBooks(req.user.id)
    res.json(rows[0])
  }),
)

app.delete(
  '/api/books/:id',
  requireAuth,
  route(async (req, res) => {
    const bookId = Number(req.params.id)
    if (!Number.isInteger(bookId)) return res.status(400).json({ error: 'Libro no válido' })
    const { rowCount } = await pool.query('DELETE FROM books WHERE id = $1 AND user_id = $2', [bookId, req.user.id])
    if (!rowCount) return res.status(404).json({ error: 'Libro no encontrado' })
    await forgetBooks(req.user.id)
    res.status(204).end()
  }),
)

app.use((error, _req, res, _next) => {
  console.error(error)
  res.status(500).json({ error: 'Error interno' })
})

async function waitForServices() {
  let lastError
  for (let attempt = 1; attempt <= 30; attempt += 1) {
    try {
      await initDb()
      await connectRedis()
      return
    } catch (error) {
      lastError = error
      console.log(`Esperando Postgres y Redis (${attempt}/30)`)
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }
  }
  throw lastError
}

waitForServices()
  .then(() => {
    app.listen(port, () => {
      console.log(`API de la biblioteca en http://localhost:${port}`)
    })
  })
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })

import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const ROUNDS = 10

export function signToken(user) {
  return jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' })
}

export function hashPassword(password) {
  return bcrypt.hash(password, ROUNDS)
}

export function checkPassword(password, passwordHash) {
  return bcrypt.compare(password, passwordHash)
}

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : ''
  if (!token) return res.status(401).json({ error: 'No autenticado' })

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET)
    next()
  } catch {
    res.status(401).json({ error: 'Sesión inválida o vencida' })
  }
}

export function publicUser(row) {
  return { id: row.id, email: row.email, name: row.name }
}

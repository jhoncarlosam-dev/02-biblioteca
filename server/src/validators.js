const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const BOOK_STATUSES = ['quiero-leer', 'leyendo', 'leido']

export function problem(message) {
  const error = new Error(message)
  error.status = 400
  return error
}

export function requiredText(value, label, max) {
  if (typeof value !== 'string' || !value.trim()) throw problem(`${label} es obligatorio`)
  const text = value.trim()
  if (text.length > max) throw problem(`${label} supera ${max} caracteres`)
  return text
}

export function normalizeEmail(value) {
  if (typeof value !== 'string') throw problem('El correo no es válido')
  const email = value.trim().toLowerCase()
  if (!EMAIL.test(email)) throw problem('El correo no es válido')
  return email
}

export function requiredPassword(value) {
  if (typeof value !== 'string' || value.length < 8) {
    throw problem('La contraseña debe tener al menos 8 caracteres')
  }
  if (value.length > 72) throw problem('La contraseña es demasiado larga')
  return value
}

export function cleanStatus(status) {
  if (!BOOK_STATUSES.includes(status)) throw problem('Estado de lectura no válido')
  return status
}

export function cleanNote(value) {
  if (value == null || value === '') return ''
  return requiredText(value, 'La nota', 500)
}

export function validateRegister(body) {
  return {
    name: requiredText(body?.name, 'El nombre', 80),
    email: normalizeEmail(body?.email),
    password: requiredPassword(body?.password),
  }
}

export function validateLogin(body) {
  return {
    email: normalizeEmail(body?.email),
    password: requiredPassword(body?.password),
  }
}

export function validateBook(body) {
  return {
    title: requiredText(body?.title, 'El título', 160),
    author: requiredText(body?.author, 'El autor', 120),
    status: cleanStatus(body?.status || 'quiero-leer'),
    note: cleanNote(body?.note),
  }
}

import { TOKEN_KEY } from './constants.js'

async function request(path, { token, ...options } = {}) {
  const headers = { 'Content-Type': 'application/json', ...options.headers }
  const saved = token ?? localStorage.getItem(TOKEN_KEY)
  if (saved) headers.Authorization = `Bearer ${saved}`

  const response = await fetch(path, { ...options, headers })
  if (response.status === 204) return null

  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    const error = new Error(data.error || 'No se pudo completar la solicitud')
    error.status = response.status
    throw error
  }
  return data
}

export function register(body) {
  return request('/api/auth/register', { method: 'POST', body: JSON.stringify(body), token: '' })
}

export function login(body) {
  return request('/api/auth/login', { method: 'POST', body: JSON.stringify(body), token: '' })
}

export function me() {
  return request('/api/me')
}

export function listBooks() {
  return request('/api/books')
}

export function createBook(book) {
  return request('/api/books', { method: 'POST', body: JSON.stringify(book) })
}

export function updateBook(id, book) {
  return request(`/api/books/${id}`, { method: 'PATCH', body: JSON.stringify(book) })
}

export function deleteBook(id) {
  return request(`/api/books/${id}`, { method: 'DELETE' })
}

import { useEffect, useState } from 'react'
import { createBook, deleteBook, listBooks, login, me, register, updateBook } from './api.js'
import AuthPanel from './components/AuthPanel.jsx'
import BookForm from './components/BookForm.jsx'
import BookList from './components/BookList.jsx'
import { TOKEN_KEY } from './constants.js'

const EMPTY = { title: '', author: '', status: 'quiero-leer', note: '' }

export default function App() {
  const [user, setUser] = useState(null)
  const [ready, setReady] = useState(false)
  const [books, setBooks] = useState([])
  const [loadingBooks, setLoadingBooks] = useState(false)
  const [draft, setDraft] = useState(EMPTY)
  const [editingId, setEditingId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) {
      setReady(true)
      return
    }
    me()
      .then((profile) => setUser(profile))
      .catch(() => localStorage.removeItem(TOKEN_KEY))
      .finally(() => setReady(true))
  }, [])

  useEffect(() => {
    if (!user) return
    let active = true
    setLoadingBooks(true)
    listBooks()
      .then((data) => {
        if (active) setBooks(data)
      })
      .catch((err) => {
        if (active) setError(err.message)
      })
      .finally(() => {
        if (active) setLoadingBooks(false)
      })
    return () => {
      active = false
    }
  }, [user])

  async function handleAuth(mode, form) {
    const result = mode === 'register' ? await register(form) : await login(form)
    localStorage.setItem(TOKEN_KEY, result.token)
    setUser(result.user)
    setError('')
  }

  function handleLogout() {
    localStorage.removeItem(TOKEN_KEY)
    setUser(null)
    setBooks([])
    setDraft(EMPTY)
    setEditingId(null)
  }

  function handleChange(event) {
    const { name, value } = event.target
    setDraft((current) => ({ ...current, [name]: value }))
  }

  function resetDraft() {
    setDraft(EMPTY)
    setEditingId(null)
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSaving(true)
    setError('')
    try {
      if (editingId) await updateBook(editingId, draft)
      else await createBook(draft)
      resetDraft()
      setBooks(await listBooks())
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  function handleEdit(book) {
    setEditingId(book.id)
    setDraft({ title: book.title, author: book.author, status: book.status, note: book.note || '' })
  }

  async function handleDelete(id) {
    setError('')
    try {
      await deleteBook(id)
      if (editingId === id) resetDraft()
      setBooks(await listBooks())
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="min-h-screen text-emerald-950">
      <header className="border-b border-emerald-950/10 bg-[#f4faf6]">
        <div className="mx-auto flex max-w-6xl flex-wrap items-end justify-between gap-4 px-5 py-8 sm:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-800/70">
              Ruta fullstack · proyecto 2
            </p>
            <h1 className="mt-2 font-serif text-4xl sm:text-5xl">Biblioteca personal</h1>
          </div>
          {user ? (
            <div className="flex items-center gap-3 text-sm">
              <span>{user.name}</span>
              <button type="button" onClick={handleLogout} className="rounded-full bg-emerald-950 px-3 py-1.5 text-emerald-50">
                Salir
              </button>
            </div>
          ) : null}
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
        {!ready ? <p>Cargando sesión…</p> : null}
        {ready && !user ? (
          <div className="mx-auto max-w-md">
            <AuthPanel onSuccess={handleAuth} />
          </div>
        ) : null}
        {user ? (
          <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
            <BookForm
              draft={draft}
              editing={Boolean(editingId)}
              saving={saving}
              onChange={handleChange}
              onSubmit={handleSubmit}
              onCancel={resetDraft}
            />
            <section>
              <h2 className="mb-4 font-serif text-2xl">Estante</h2>
              {error ? (
                <p role="alert" className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">
                  {error}
                </p>
              ) : null}
              <BookList books={books} loading={loadingBooks} onEdit={handleEdit} onDelete={handleDelete} />
            </section>
          </div>
        ) : null}
      </main>
    </div>
  )
}

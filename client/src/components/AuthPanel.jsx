import { useState } from 'react'

const EMPTY = { name: '', email: '', password: '' }

export default function AuthPanel({ onSuccess }) {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState(EMPTY)
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)

  function handleChange(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSending(true)
    setError('')
    try {
      await onSuccess(mode, form)
      setForm(EMPTY)
    } catch (err) {
      setError(err.message)
    } finally {
      setSending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-emerald-950/10">
      <div className="flex gap-2 text-sm">
        <button
          type="button"
          onClick={() => setMode('login')}
          className={`rounded-full px-3 py-1 ${mode === 'login' ? 'bg-emerald-950 text-emerald-50' : 'text-emerald-900'}`}
        >
          Entrar
        </button>
        <button
          type="button"
          onClick={() => setMode('register')}
          className={`rounded-full px-3 py-1 ${mode === 'register' ? 'bg-emerald-950 text-emerald-50' : 'text-emerald-900'}`}
        >
          Crear cuenta
        </button>
      </div>
      <h2 className="mt-4 font-serif text-3xl text-emerald-950">{mode === 'login' ? 'Tu estante' : 'Nueva cuenta'}</h2>
      {mode === 'register' ? (
        <>
          <label className="mt-4 block text-sm font-semibold" htmlFor="name">
            Nombre
          </label>
          <input
            id="name"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            className="mt-1 w-full rounded-lg border border-emerald-950/20 px-3 py-2"
          />
        </>
      ) : null}
      <label className="mt-4 block text-sm font-semibold" htmlFor="email">
        Correo
      </label>
      <input
        id="email"
        name="email"
        type="email"
        autoComplete="username"
        value={form.email}
        onChange={handleChange}
        required
        className="mt-1 w-full rounded-lg border border-emerald-950/20 px-3 py-2"
      />
      <label className="mt-4 block text-sm font-semibold" htmlFor="password">
        Contraseña
      </label>
      <input
        id="password"
        name="password"
        type="password"
        autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
        minLength={8}
        value={form.password}
        onChange={handleChange}
        required
        className="mt-1 w-full rounded-lg border border-emerald-950/20 px-3 py-2"
      />
      {error ? (
        <p role="alert" className="mt-3 text-sm text-red-800">
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={sending}
        className="mt-5 rounded-lg bg-emerald-900 px-4 py-2 text-sm font-semibold text-emerald-50 disabled:opacity-60"
      >
        {sending ? 'Enviando…' : mode === 'login' ? 'Entrar' : 'Registrarme'}
      </button>
    </form>
  )
}

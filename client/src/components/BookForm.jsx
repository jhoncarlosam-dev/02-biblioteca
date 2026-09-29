import { STATUSES } from '../constants.js'

export default function BookForm({ draft, editing, saving, onChange, onSubmit, onCancel }) {
  return (
    <form onSubmit={onSubmit} className="rounded-2xl bg-[#f7fbf8] p-5 ring-1 ring-emerald-950/10">
      <h2 className="font-serif text-2xl text-emerald-950">{editing ? 'Editar libro' : 'Agregar libro'}</h2>
      <label className="mt-4 block text-sm font-semibold" htmlFor="title">
        Título
      </label>
      <input
        id="title"
        name="title"
        value={draft.title}
        onChange={onChange}
        required
        maxLength={160}
        className="mt-1 w-full rounded-lg border border-emerald-950/20 bg-white px-3 py-2"
      />
      <label className="mt-4 block text-sm font-semibold" htmlFor="author">
        Autor
      </label>
      <input
        id="author"
        name="author"
        value={draft.author}
        onChange={onChange}
        required
        maxLength={120}
        className="mt-1 w-full rounded-lg border border-emerald-950/20 bg-white px-3 py-2"
      />
      <label className="mt-4 block text-sm font-semibold" htmlFor="status">
        Estado
      </label>
      <select
        id="status"
        name="status"
        value={draft.status}
        onChange={onChange}
        className="mt-1 w-full rounded-lg border border-emerald-950/20 bg-white px-3 py-2"
      >
        {STATUSES.map((status) => (
          <option key={status.id} value={status.id}>
            {status.label}
          </option>
        ))}
      </select>
      <label className="mt-4 block text-sm font-semibold" htmlFor="note">
        Nota
      </label>
      <textarea
        id="note"
        name="note"
        value={draft.note}
        onChange={onChange}
        maxLength={500}
        rows={3}
        className="mt-1 w-full rounded-lg border border-emerald-950/20 bg-white px-3 py-2"
      />
      <div className="mt-5 flex gap-2">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-emerald-900 px-4 py-2 text-sm font-semibold text-emerald-50 disabled:opacity-60"
        >
          {saving ? 'Guardando…' : editing ? 'Guardar cambios' : 'Agregar'}
        </button>
        {editing ? (
          <button type="button" onClick={onCancel} className="px-3 text-sm text-emerald-900">
            Cancelar
          </button>
        ) : null}
      </div>
    </form>
  )
}

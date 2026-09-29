import { STATUS_LABEL } from '../constants.js'

const TONE = {
  'quiero-leer': 'bg-stone-200 text-stone-800',
  leyendo: 'bg-amber-100 text-amber-950',
  leido: 'bg-emerald-200 text-emerald-950',
}

export default function BookList({ books, loading, onEdit, onDelete }) {
  if (loading) return <p className="text-emerald-900/70">Cargando el estante…</p>

  if (books.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-emerald-950/20 px-5 py-10 text-center text-emerald-900/70">
        Todavía no hay libros. Agrega el primero.
      </p>
    )
  }

  return (
    <ul className="grid gap-4">
      {books.map((book) => (
        <li key={book.id}>
          <article className="rounded-2xl bg-white p-5 ring-1 ring-emerald-950/10">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="font-serif text-2xl text-emerald-950">{book.title}</h3>
                <p className="text-emerald-900/80">{book.author}</p>
              </div>
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${TONE[book.status]}`}>
                {STATUS_LABEL[book.status] || book.status}
              </span>
            </div>
            {book.note ? <p className="mt-3 whitespace-pre-wrap text-stone-600">{book.note}</p> : null}
            <div className="mt-4 flex gap-3 text-sm">
              <button type="button" onClick={() => onEdit(book)} className="font-semibold text-emerald-900">
                Editar
              </button>
              <button type="button" onClick={() => onDelete(book.id)} className="text-stone-500">
                Eliminar
              </button>
            </div>
          </article>
        </li>
      ))}
    </ul>
  )
}

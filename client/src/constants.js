export const STATUSES = [
  { id: 'quiero-leer', label: 'Quiero leer' },
  { id: 'leyendo', label: 'Leyendo' },
  { id: 'leido', label: 'Leído' },
]

export const STATUS_LABEL = Object.fromEntries(STATUSES.map((status) => [status.id, status.label]))

export const TOKEN_KEY = 'biblioteca_token'

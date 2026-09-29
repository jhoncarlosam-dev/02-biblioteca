import { test } from 'node:test'
import assert from 'node:assert/strict'
import { normalizeEmail, requiredPassword, validateBook } from '../src/validators.js'

test('normaliza el correo', () => {
  assert.equal(normalizeEmail('  Ana@Mail.com '), 'ana@mail.com')
})

test('rechaza un correo sin dominio', () => {
  assert.throws(() => normalizeEmail('ana'), /correo/i)
})

test('exige una contraseña de 8 caracteres', () => {
  assert.throws(() => requiredPassword('corta'), /8 caracteres/)
})

test('acepta un libro con estado por defecto', () => {
  const book = validateBook({ title: '  El túnel ', author: 'Sábato' })
  assert.deepEqual(book, {
    title: 'El túnel',
    author: 'Sábato',
    status: 'quiero-leer',
    note: '',
  })
})

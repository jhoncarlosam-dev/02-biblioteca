import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import pg from 'pg'

const schemaPath = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'sql', 'schema.sql')

export const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })

export async function initDb() {
  const sql = await readFile(schemaPath, 'utf8')
  await pool.query(sql)
}

import PouchDB from "../lib/MemPouch"
import { Storage } from "../domain/storage"

let db: PouchDB.Database<Storage> | null = null

export default () => {

  if (db == null) {
    const db_name = process.env.STORAGE_DB_NAME
    const username = process.env.STORAGE_DB_USER
    const password = process.env.STORAGE_DB_PASS
    db = new PouchDB<Storage>(db_name, {
      auth: { username, password }
    })
  }
  return db
}
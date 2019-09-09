import PouchDB from "./_pouch"
import { Storage } from "../lib/repo_database"

const db = new PouchDB<Storage>('cake', {
  auth: {
    username: "admin",
    password: "Ty7dB2GJ69h9"
  }
})

export default db
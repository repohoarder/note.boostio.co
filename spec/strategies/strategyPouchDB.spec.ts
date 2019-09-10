import * as StrategyPouchDB from "../../lib/strategyPouchDB"
import PouchDBCore from "pouchdb-core"
import PouchDBMemoryAdapter from "pouchdb-adapter-memory"
import PouchDBFind from "pouchdb-find"
import { Storage } from "../../domain/storage"
import { isOk, e_unwrap, isErr } from "../../lib/result"

const PouchDB = PouchDBCore
  .plugin(PouchDBMemoryAdapter)
  .plugin(PouchDBFind)

let count = 0
const createDB = () => new PouchDB<Storage>(`test_db_${count++}`, { adapter: "memory" })

describe("storage registry", () => {

  test('it creates storage', async () => {
    const db = createDB()
    const create = StrategyPouchDB.createStorageFactory(db)
    const [ ok ] = await create('userId')
    expect(ok).toBe(true)
  })

  test("creates and then gets", async () => {
    const db = createDB()
    const create = StrategyPouchDB.createStorageFactory(db)
    const get_uid = StrategyPouchDB.getStorageFactory(db)
    const created = await create('userId')
    expect(isOk(created)).toBe(true)

    const fetched = await get_uid(e_unwrap(created))
    expect(isOk(fetched)).toBe(true)
  })

  test("it returns Err if doesn't exist", async () => {
    const db = createDB()
    const get_uid = StrategyPouchDB.getStorageFactory(db)

    const result = await get_uid("storageId")
    expect(isErr(result)).toBe(true)
  })

})
import RepoDBFactory, { Storage } from "../lib/repo_database"
import PouchDBCore from "pouchdb-core"
import PouchDBMemoryAdapter from "pouchdb-adapter-memory"
import PouchDBFind from "pouchdb-find"

const PouchDB = PouchDBCore
  .plugin(PouchDBMemoryAdapter)
  .plugin(PouchDBFind)

let count = 0
const createDB = () => new PouchDB<Storage>(`test_db_${count++}`, { adapter: "memory" })

describe("storage registry", () => {

  test('it creates storage', async () => {
    const db = createDB()
    const [ create ] = await RepoDBFactory(db, "secret")
    const [ ok ] = await create('userId', 'repoId')
    expect(ok).toBe(true)
  })

  test("creates and then gets", async () => {
    const db = createDB()
    const [ create, get_uid ] = await RepoDBFactory(db, "secret")
    const [ result, puid ] = await create('userId', 'repoId')
    expect(result).toBe(true)

    const [ ok, guid ] = await get_uid("userId", "repoId")
    expect(ok).toBe(true)
    expect(guid).toEqual(puid)
  })

  test("it returns None if doesn't exist", async () => {
    const db = createDB()
    const get_uid = (await RepoDBFactory(db, "secret"))[1]

    const [ ok ] = await get_uid("userId", "repoId")
    expect(ok).toBe(false)
    
  })

})
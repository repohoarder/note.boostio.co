import createStorageHandler from "../../api/handlers/createStorage"
import MemPouch from "../../lib/MemPouch"
import { Storage, CreateStorageStrategy } from "../../domain/storage"
import * as PouchDBStrategy from "../../lib/strategyPouchDB"

function createStrategy(name: string): [ PouchDB.Database<Storage>, CreateStorageStrategy ] {
  const db = new MemPouch<Storage>(name)
  return [db, PouchDBStrategy.createStorageFactory(db)]
}


describe("create handler", () => {

  test("it creates a storage record", async () => {
    const [ db, strategy ] = createStrategy('create-test')
    const [ statusCode, response ] = await createStorageHandler(strategy, "userId")
    
    expect(statusCode).toEqual(200)
    expect(response).toHaveProperty("created")
    expect(typeof response.created).toBe('string')
    return expect(db.get(response.created)).resolves.not.toThrow()
  })

})
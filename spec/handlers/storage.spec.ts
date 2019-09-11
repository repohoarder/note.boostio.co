import { RequestListener } from 'http'
import { parse } from 'url'
import storagesHandlerFactory from '../../api/handlers/storagesHandler'
import MemPouchDB from '../../lib/MemPouch'
import { GetStorageStrategy } from '../../domain/storage'
import { Ok } from '../../lib/result'
import { testHandler } from './test-serve'

jest.useFakeTimers()

function createEndpoint(id: string = "storageId"): RequestListener {
  const mockStrategy: GetStorageStrategy = async id => Ok({ _id: id, user: "userId" })
  return storagesHandlerFactory(mockStrategy, MemPouchDB)
}

describe("storages endpoint", () => {

  test("opens database", async () => {
    await testHandler(createEndpoint(), async url => {
      const storageId = "storageId"
      const db = new MemPouchDB(`${url}/api/users/1/storages/${storageId}/db`, { adapter: 'http' })
      const info = await db.info()
      expect(info.db_name).toEqual(storageId)
    })
  })

  test("puts & gets document", async () => {
    await testHandler(createEndpoint(), async url => {
      const db = new MemPouchDB(`${url}/api/users/1/storages/2/db`, { adapter: 'http' })
      const created = await db.put({ _id: "docId", body: "body" })
      expect(created.ok).toBe(true)

      const got = await db.get(created.id)
      expect(got._id).toEqual(created.id)
    })
  })

  test("_rev_docs", async () => {
    await testHandler(createEndpoint("rev-docs-test"), async url => {

    })
  })

  test("sync", async done => {
    await testHandler(createEndpoint("sync-test"), async url => {
      const local_db = new MemPouchDB("local")
      const remote_db = new MemPouchDB(`${url}/api/users/1/storages/2/db`, { adapter: "http" })
     
      const mockCallback = jest.fn((...args) => console.log(args))

      const sync = local_db.sync(remote_db, {
        retry: true,
        live: true
      }, mockCallback)
        .on('change', () => done())
        .on('error', mockCallback)

      const put = await remote_db.put({ _id: "doc2", body: "body" })
      console.log(put)
      console.log(await local_db.get(put.id))
      sync.cancel()
      expect(mockCallback).toBeCalled()
    })
  })

})
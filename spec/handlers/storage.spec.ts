import { RequestListener } from 'http'
import { parse } from 'url'
import storagesHandlerFactory from '../../api/handlers/storagesHandler'
import MemPouchDB from '../../lib/MemPouch'
import { GetStorageStrategy } from '../../domain/storage'
import { Ok } from '../../lib/result'
import { testHandler } from './test-serve'

jest.useFakeTimers()

function createEndpoint(id: string = "storageId"): RequestListener {
  return (req, res) => {
    const mockStrategy: GetStorageStrategy = async id => Ok({ _id: id, user: "userId" })
    let route = ""
    if (req.url != null) {
      const url = parse(req.url)
      route = url.pathname != null && url.pathname !== "//" ? url.pathname : ""
      while (route.startsWith("/")) {
        route = route.substr(1)
      }
    }
    req.url = `/?storageId=${id}&route=/${route}`
    if (id === "sync-test") {
      console.log(req.method, req.url)
    }
    storagesHandlerFactory(mockStrategy, MemPouchDB)(req, res)
  }
}

describe("storages endpoint", () => {

  test("opens database", async () => {
    await testHandler(createEndpoint(), async url => {
      const db = new MemPouchDB(url, { adapter: 'http' })
      const info = await db.info()
      expect(info.db_name).toEqual("storageId")
    })
  })

  test("puts & gets document", async () => {
    await testHandler(createEndpoint(), async url => {
      const db = new MemPouchDB(url, { adapter: 'http' })
      const created = await db.put({ _id: "docId", body: "body" })
      expect(created.ok).toBe(true)

      const got = await db.get(created.id)
      expect(got._id).toEqual(created.id)
    })
  })

  test("sync", async () => {
    await testHandler(createEndpoint("sync-test"), async url => {
      const local_db = new MemPouchDB("local")
      const remote_db = new MemPouchDB(url, { adapter: "http" })
     
      const mockCallback = jest.fn((...args) => console.log(args))

      const sync = local_db.sync(remote_db, {
        retry: true,
        live: true
      }, mockCallback)
        .on('change', mockCallback)
        .on('error', mockCallback)

      const put = await local_db.put({ _id: "doc2", body: "body" })
      expect(mockCallback).toBeCalled()
    })
  })

})
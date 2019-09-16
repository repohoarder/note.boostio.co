import { RequestListener } from 'http'
import expressPouchDBHandler from '../../api/handlers/expressPouchHandler'
import PouchDB from '../../lib/MemPouch'
import { GetStorageStrategy } from '../../domain/storage'
import { Ok } from '../../lib/result'
import { testHandler } from './test-serve'

process.on('warning', e => console.warn(e.stack));

jest.useFakeTimers()
jest.setTimeout(30000)

const MemPouchDB = PouchDB.defaults({ adapter: "memory" })


function createEndpoint(): RequestListener {
  const mockStrategy: GetStorageStrategy = async id => Ok({ _id: id, user: "userId" })
  return expressPouchDBHandler(mockStrategy, { host: "egs" })
}

function TestDB(url: string, storageId: string) {
  const db = new MemPouchDB(`${url}/api/users/1/storages/${storageId}/db`, { adapter: 'http' })
  return db
}

describe("express-pouch handler", () => {

  test("it creates database", async () => {
    await testHandler(createEndpoint(), async url => {
      const storageId = "storage-id"
      const db = TestDB(url, storageId)
      const info = await db.info()
      expect(info.db_name).toEqual(storageId)
    })
  })

  test("it posts & gets document", async () => {
    await testHandler(createEndpoint(), async url => {
      const storageId = "storage-id"
      const db = TestDB(url, storageId)
      const created = await db.post({ body: "body" })
      expect(created.ok).toBe(true)

      const got = await db.get(created.id)
      expect(got._id).toEqual(created.id)
    })
  })

  test("it syncs to remote", async () => {
    await testHandler(createEndpoint(), async url => {
      const storageId = "storage-id"
      const local_db = new MemPouchDB("local-db")
      const remote_db = TestDB(url, storageId)
     

      const put = await local_db.post({ body: "body" })
      await new Promise(resolve => local_db.sync(remote_db, {}, resolve))
      
      const from_remote = await remote_db.get(put.id)
      expect(from_remote._id).toEqual(put.id)
    })
  })

  test("it live syncs to remote: push", async () => {
    await testHandler(createEndpoint(), async url => {
      const storageId = "storage-id"
      const local_db = new MemPouchDB("local-db")
      const remote_db = TestDB(url, storageId)
     
      let putId = "none"
      const result = await new Promise<PouchDB.Replication.SyncResult<any>>(async resolve => {
        const syncHandler = local_db.sync(remote_db, { live: true })
          .on('paused', () => {
            syncHandler.cancel()
            throw new Error("Unexpectedly paused")
          })
          .on('error', () => {
            syncHandler.cancel()
            throw new Error("Sync error")
          })
          .on('change', info => {
            syncHandler.cancel()
            resolve(info)
          })
        putId = (await local_db.post({ body: "body" })).id
      })
      
      expect(result.direction).toEqual("push")
      const from_remote = await remote_db.get(putId)
      expect(from_remote._id).toEqual(putId)
    })
  })

  test("it live syncs to remote: pull", async () => {
    await testHandler(createEndpoint(), async url => {
      const storageId = "storage-id"
      const local_db = new MemPouchDB("local-db")
      const remote_db = TestDB(url, storageId)
     
      let putId = "none"
      const result = await new Promise<PouchDB.Replication.SyncResult<any>>(async resolve => {
        const syncHandler = local_db.sync(remote_db, { live: true })
          .on('paused', () => {
            syncHandler.cancel()
            throw new Error("Unexpectedly paused")
          })
          .on('error', () => {
            syncHandler.cancel()
            throw new Error("Sync error")
          })
          .on('change', info => {
            syncHandler.cancel()
            resolve(info)
          })
        putId = (await remote_db.post({ body: "body" })).id
      })
      // remote db push aswell?
      expect(result.direction).toEqual("pull")
      const from_local = await local_db.get(putId)
      expect(from_local._id).toEqual(putId)
    })
  })

})
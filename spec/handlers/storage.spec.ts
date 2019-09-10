import listen from 'test-listen'
import http from 'http'
import { storagesHandlerFactory } from '../../api/storages'
import { NowRequest, NowResponse } from '@now/node'
import PouchDB from '../../lib/MemPouch'
import { GetStorageStrategy } from '../../domain/storage'
import { Ok } from '../../lib/result'


function createEndpoint() {
  return http.createServer((req, res) => {
    const strategy: GetStorageStrategy = async id => Ok({ _id: id, user: "userId" })
    storagesHandlerFactory(strategy, PouchDB)(req as NowRequest, res as NowResponse)
  })
}

describe("storages endpoint", () => {

  test("opens database", async () => {
    const url = await listen(createEndpoint())
    const db = new PouchDB(`${url}/userId/storages/storageId/db`, { adapter: 'http' })
    console.log(await db.info())
  })

})
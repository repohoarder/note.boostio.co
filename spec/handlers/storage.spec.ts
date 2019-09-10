import listen from 'test-listen'
import http, { RequestListener } from 'http'
import { parse } from 'url'
import storagesHandlerFactory from '../../api/handlers/storagesHandler'
import MemPouchDB from '../../lib/MemPouch'
import { GetStorageStrategy } from '../../domain/storage'
import { Ok } from '../../lib/result'
import got from 'got'
import { testHandler } from './test-serve'


function createEndpoint(): RequestListener {
  return (req, res) => {
    const mockStrategy: GetStorageStrategy = async id => Ok({ _id: id, user: "userId" })
    const url = {pathname: "", ...parse(req.url || "")}
    req.url = `/?storageId=storageId&route=${url.pathname}`
    storagesHandlerFactory(mockStrategy, MemPouchDB)(req, res)
  }
}

describe("storages endpoint", () => {

  test("opens database", async () => {
    await testHandler(createEndpoint(), async url => {
      console.log(url)
      //const db = new PouchDB(`${url}/users/userId/storages/storageId/db`, { adapter: 'http' })
      const result = await got(`${url}`)
      expect(result).toEqual({})
    }) 
    
  })

})
import PouchDB from "pouchdb-node"
import ExpressPouch from "express-pouchdb"
import MemoryAdapter from "pouchdb-adapter-memory"

import { NowRequest, NowResponse } from '@now/node'

PouchDB.plugin(MemoryAdapter)
PouchDB.defaults({
  adapter: "memory"
})

export default (request: NowRequest, response: NowResponse) => {
  const pouchApi = ExpressPouch(PouchDB)
  pouchApi(request, response)
}

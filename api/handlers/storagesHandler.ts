import ExpressPouch from "express-pouchdb"
import * as Storage from "../../domain/storage"
import { isErr, unwrapErr, unwrapOk } from "../../lib/result"
import { IncomingMessage, ServerResponse } from "http"
import getQuery from "../../lib/querySelector"
import { send } from "micro"
import PouchDB from "../../lib/MemPouch"
import express from "express"

const app = ExpressPouch(PouchDB)


export default (strategy: Storage.GetStorageStrategy, pouch: PouchDB.Static) =>
  async (req: IncomingMessage, res: ServerResponse) => {
    const getStorage = Storage.getStorage(strategy)

    // can be undefined?
    let { storageId, route, top } = getQuery(req)

    if (top != null) {
      req.url = "/"
      app(req, res)
    }

    storageId = Array.isArray(storageId) ? storageId[0] : storageId
    route = Array.isArray(route) ? route[0] : route

    const result = await getStorage(storageId)
    if (isErr(result)) {
      send(res, 404, {error: unwrapErr(result)})
    } else {
      // memoized based on pouch?
      const storage = unwrapOk(result)
      req.url = `/${storage._id}${route}`
      app(req, res)
  }
}
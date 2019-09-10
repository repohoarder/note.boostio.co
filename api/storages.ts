import ExpressPouch from "express-pouchdb"
import { NowRequest, NowResponse } from '@now/node'
import express from "express"
import PouchDB from "../lib/MemPouch"
import StorageDB from "./storageDB"
import * as PouchDBStrategy from "../lib/strategyPouchDB"
import * as Storage from "../domain/storage"
import { attachHelpers } from "../lib/customResHelpers"
import { isErr, unwrapErr, unwrapOk } from "../lib/result"

export const storagesHandlerFactory = (strategy: Storage.GetStorageStrategy, pouch: PouchDB.Static) => async (req: NowRequest, res: NowResponse) => {
  const getStorage = Storage.getStorage(strategy)

  // can be undefined?
  const { repoId, route } = req.query
  const storageId = Array.isArray(repoId) ? repoId[0] : repoId

  const result = await getStorage(storageId)
  if (isErr(result)) {
    res.status(404).json({
      error: unwrapErr(result)
    })
  } else {
    // memoized based on pouch?
    const app = express()
    app.use("/db", ExpressPouch(pouch))
    const storage = unwrapOk(result)
    req.url = `/db/${storage._id}${route}`
    app(req, res)
  }
}

// PROXY TO /db/:uniqueName route, otherwise either all DBs will be named db OR requires an extra
// route param (/api/:user/storages/:repo/db/:dbname)
export default async (req: NowRequest, res: NowResponse) => {
  // attach the now.sh helpers apart from body-parser
  // body-parser causes errors with express-pouch
  attachHelpers(req, res)
  const app = storagesHandlerFactory(PouchDBStrategy.getStorageFactory(StorageDB()), PouchDB)
  app(req, res)
}






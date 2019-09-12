import ExpressPouch from "express-pouchdb"
import * as Storage from "../../domain/storage"
import { isErr, unwrapErr, unwrapOk } from "../../lib/result"
import { IncomingMessage, ServerResponse } from "http"
import getQuery from "../../lib/querySelector"
import { send } from "micro"
import PouchDB from "../../lib/MemPouch"

const app = ExpressPouch(PouchDB)

interface DBInfo {
  userId?: string 
  storageId?: string,
  command?: string
}

export default (strategy: Storage.GetStorageStrategy) =>
  async (req: IncomingMessage, res: ServerResponse) => {
    const getStorage = Storage.getStorage(strategy)
    //console.log("\nRecieved ---\n", req.url, "\n")
    // can be undefined?
    let { storageId, command } = parseUrl(req.url || "")

    const result = await getStorage(storageId || "")
    if (isErr(result)) {
      send(res, 404, {error: unwrapErr(result)})
      return
    } else {
      // memoized based on pouch?
      const storage = unwrapOk(result)
      req.url = storageId != null ? `/${storage._id}${command}` : "/"
      app(req, res)
  }
}

const regex = new RegExp(/\/api\/users\/(?<userId>[^/]+)\/storages\/(?<storageId>[^/]+)\/db(?<command>.*)/);
function parseUrl(url: string): DBInfo {
  const exec = regex.exec(url)
  if (exec == null || exec.groups == null) {
    return {}
  }
  return exec.groups
}
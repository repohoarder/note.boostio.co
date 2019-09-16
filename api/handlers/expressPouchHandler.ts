import ExpressPouch from "express-pouchdb"
import * as Storage from "../../domain/storage"
import { isErr, unwrapErr, unwrapOk } from "../../lib/result"
import { IncomingMessage, ServerResponse } from "http"
import { send } from "micro"
import PouchDB from "../../lib/MemPouch"
import HttpPouchDB from "http-pouchdb"
import urlParser from "../../lib/requestInfoParser"


// Has to be defined outside or replicator already set errors are thrown
const app = ExpressPouch(PouchDB, {
  logPath: "/tmp/log.txt",
  overrideMode: {
    // NECESSARY - Disables _security routes
    // auto security routes run requests before http database name is resolved causing
    // 'calling method x on null' errors due to wonky URL parsing.
    exclude: ['routes/security']
  },
})

interface RemoteConfig {
  host: string
  auth?: {
    username: string,
    password: string
  }
}

export default (strategy: Storage.GetStorageStrategy, remote?: RemoteConfig) => {

  // if a remote DB settings, use remote, otherwise use memory
  // possible memory leak on listeners?
  if (remote != null) {
    const RemotePouch = HttpPouchDB(
      PouchDB,
     `https://${remote.host}/`,
     {
      auth: remote.auth,
      adapter: "https",
    })
    app.setPouchDB(RemotePouch)
  }
  
  return async (req: IncomingMessage, res: ServerResponse) => {
      const getStorage = Storage.getStorage(strategy)
      
      let { storageId, command } = urlParser(req.url || "")

      if (storageId == null) {
        send(res, 404, { error: "Storage ID must be present" })
      }

      const result = await getStorage(storageId || "")
      if (isErr(result)) {
        send(res, 404, {error: unwrapErr(result)})
        return
      } else {
        const storage = unwrapOk(result)
        try {
          req.url = storageId != null ? `/${storage._id}${command}` : "/"
          app(req, res)
        } catch (error) {
          send(res, 500, { error: error.message })
        }
    }
  }
}


import ExpressPouch from "express-pouchdb"
import * as Storage from "../../domain/storage"
import { isErr, unwrapErr, unwrapOk } from "../../lib/result"
import { IncomingMessage, ServerResponse } from "http"
import { send } from "micro"
import PouchDB from "../../lib/MemPouch"
import HttpPouchDB from "http-pouchdb"


interface DBInfo {
  userId?: string 
  storageId?: string,
  command?: string
}

const RemotePouch = HttpPouchDB(
  PouchDB,
 `https://${process.env.PROXY_HOST}/`,
 {
  auth: {
    username: process.env.PROXY_USER,
    password: process.env.PROXY_PASSWORD
  },
  adapter: "https",
})

// Has to be defined outside or replicator already set errors are thrown
// memoized style function?
const app = ExpressPouch(RemotePouch, {
  logPath: "/tmp/log.txt",
  overrideMode: {
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

  // if a remote DB is set, use it. otherwise use memory
  if (remote != null) {

  }
  
  return async (req: IncomingMessage, res: ServerResponse) => {
      const getStorage = Storage.getStorage(strategy)
      
      let { storageId, command } = parseUrl(req.url || "")

      const result = await getStorage(storageId || "")
      if (isErr(result)) {
        send(res, 404, {error: unwrapErr(result)})
        return
      } else {
        // memoized based on pouch?
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

const regex = new RegExp(/\/api\/users\/([^/]+)\/storages\/([^/]+)\/db(.*)/);
function parseUrl(url: string): DBInfo {
  const exec = regex.exec(url)
  if (exec == null) {
    return {}
  }
  return { storageId: exec[2], userId: exec[1], command: exec[3]  }
}

import * as Storage from "../../domain/storage";
import { IncomingMessage, ServerResponse } from "http";
import { send } from "micro"
import { isErr, unwrapErr, unwrapOk } from "../../lib/result"
import httpProxy from "http-proxy"
import path from "path"
import fs from "fs"

interface DBInfo {
  userId?: string 
  storageId?: string,
  command?: string
}

interface ProxyAddress {
  host: string
  protocol?: string
  auth?: string
  port?: string
}


//proxy.on('proxyReq', (proxyReq) => proxyReq.setHeader('host', 'couchdb.crumpets.dev'))
//proxy.on('proxyRes', (proxyRs) => console.log(proxyRs.rawHeaders))

export default (strategy: Storage.GetStorageStrategy, { host, protocol = "http", port, auth }: ProxyAddress) => {
  const proxy = httpProxy.createProxyServer({
    target: { protocol, host, port },
    auth,
    headers: { host }
  })
  return async (req: IncomingMessage, res: ServerResponse) => {
    const getStorage = Storage.getStorage(strategy)

    let { storageId, command } = parseUrl(req.url || "")
    const result = await getStorage(storageId || "")
    if (isErr(result)) {
      send(res, 404, {error: unwrapErr(result)})
    } else {
      const storage = unwrapOk(result)
      req.url = `/${storage._id}${command}`
      try {
        proxy.web(req, res, {}, e => send(res, 500, { error: e.message }))
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
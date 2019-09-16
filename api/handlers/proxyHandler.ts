import * as Storage from "../../domain/storage";
import { IncomingMessage, ServerResponse } from "http";
import { send } from "micro"
import { isErr, unwrapErr, unwrapOk } from "../../lib/result"
import httpProxy from "http-proxy"
import urlParser from "../../lib/requestInfoParser"

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

    let { storageId, command } = urlParser(req.url || "")
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

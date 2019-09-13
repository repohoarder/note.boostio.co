import PouchDB from "../lib/MemPouch"
import StorageDB from "./storageDB"
import * as PouchDBStrategy from "../lib/strategyPouchDB"
import { IncomingMessage, ServerResponse } from "http"
import storagesHandlerFactory from "./handlers/expressPouchHandler"
import proxyHandler from "./handlers/proxyHandler"
import { send } from "micro"

const host = process.env.PROXY_HOST
const user = process.env.PROXY_USER
const pass = process.env.PROXY_PASSWORD
const protocol = process.env.PROXY_PROTOCOL || "https"

export default async (req: IncomingMessage, res: ServerResponse) => {

  if (host == null || user == null || pass == null) {
    send(res, 500, { error: "server configuration error" })
    return
  }

  const handler = storagesHandlerFactory(
    PouchDBStrategy.getStorageFactory(StorageDB()),
    { host, auth: { username: user, password: pass } }
  )

  //const handler = proxyHandler(
  //  PouchDBStrategy.getStorageFactory(StorageDB()),
  //  {
  //    host,
  //    auth: `${user}:${pass}`,
  //    protocol
  //  }
  //)
  handler(req, res)
}

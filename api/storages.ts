import StorageDB from "./storageDB"
import * as PouchDBStrategy from "../lib/strategyPouchDB"
import { IncomingMessage, ServerResponse } from "http"
import expressPouchHandlerFactory from "./handlers/expressPouchHandler"
import { send } from "micro"

const host = process.env.PROXY_HOST
const user = process.env.PROXY_USER
const pass = process.env.PROXY_PASSWORD

export default async (req: IncomingMessage, res: ServerResponse) => {

  if (host == null || user == null || pass == null) {
    send(res, 500, { error: "server configuration error" })
    return
  }

  // CORS
  if (req.method === "OPTIONS") {
    console.log("OPTIONS!!!!")
    send(res, 200)
  }

  const handler = expressPouchHandlerFactory(
    PouchDBStrategy.getStorageFactory(StorageDB()),
    { host, auth: { username: user, password: pass } }
  )

  handler(req, res)
}

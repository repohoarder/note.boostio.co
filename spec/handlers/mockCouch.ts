import ExpressPouch from "express-pouchdb"
import express from "express"
import { Server } from 'net'
import PouchDB from "../../lib/MemPouch"

let server: Server | null = null;

function createServer(port: number) {
  const app = express()
  app.use(ExpressPouch(PouchDB))
  return new Promise( resolve => {
      server = app.listen(port, resolve)
  })
}

function destroyServer() {
  return new Promise(resolve => {
    if (server != null) {
      server.close(resolve)
      server = null
    } else {
      resolve()
    }
  })
}

export default {
  create: createServer,
  destroy: destroyServer
}
import PouchDB from "../lib/MemPouch"
import StorageDB from "./storageDB"
import * as PouchDBStrategy from "../lib/strategyPouchDB"
import { IncomingMessage, ServerResponse } from "http"
import storagesHandlerFactory from "./handlers/storagesHandler"


// PROXY TO /db/:uniqueName route, otherwise either all DBs will be named db OR requires an extra
// route param (/api/:user/storages/:repo/db/:dbname)
export default async (req: IncomingMessage, res: ServerResponse) => {
  // attach the now.sh helpers apart from body-parser
  // body-parser causes errors with express-pouch
  const app = storagesHandlerFactory(PouchDBStrategy.getStorageFactory(StorageDB()), PouchDB)
  app(req, res)
}






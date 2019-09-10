import StorageDB from "./storageDB"
import * as PouchDBStrategy from "../lib/strategyPouchDB"
import createStorageHandler from "./handlers/createStorage"
import { IncomingMessage, ServerResponse } from 'http'
import qetQuery from "../lib/querySelector"
import { send } from "micro"


export default async (req: IncomingMessage, res: ServerResponse) => {

  let { userId } = qetQuery(req)
  if (Array.isArray(userId)) {
    userId = userId[0]
  }

  const [status, response] = await createStorageHandler(PouchDBStrategy.createStorageFactory(StorageDB()), userId)
  send(res, status, response)
}
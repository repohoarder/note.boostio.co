import { NowRequest, NowResponse } from '@now/node'
import StorageDB from "./storageDB"
import * as PouchDBStrategy from "../lib/strategyPouchDB"
import createStorageHandler from "./handlers/createStorage"


export default async (req: NowRequest, res: NowResponse) => {

  let { userId } = req.query
  if (Array.isArray(userId)) {
    userId = userId[0]
  }

  const [status, response] = await createStorageHandler(PouchDBStrategy.createStorageFactory(StorageDB()), userId)
  res
    .status(status)
    .json(response)
}
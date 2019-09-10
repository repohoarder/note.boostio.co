import * as Storage from "../../domain/storage"
import { isErr, unwrapOk, unwrapErr } from '../../lib/result'

export default async (strategy: Storage.CreateStorageStrategy, userId: string): Promise<[number, any]> => {

  const createStorage = Storage.createStorage(strategy)
  const result = await createStorage(userId)
  
  if (isErr(result)) {
    return [ 500, { error: unwrapErr(result) } ]
  } else {
    return [ 200, { created: unwrapOk(result) } ]
  }
}
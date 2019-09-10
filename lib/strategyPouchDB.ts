// create_db(userId, repoId) -> 
// get_database_uid(userId, repoId) -> Result<Maybe<UID>>
import uuid from "uuid"
import { Storage, CreateStorageStrategy, GetStorageStrategy, StorageErrors, StorageGetErrors } from "../domain/storage"
import { Err, Ok } from "./result"

type Factory<A extends any[], T> = (...args: A) => T

export const createStorageFactory: Factory<[PouchDB.Database<Storage>], CreateStorageStrategy> = db => async userId => {
  try {
    const created = await db.put({
      _id: `st${uuid()}`,
      user: userId
    })

    if (!created.ok) {
      return Err({ type: StorageErrors.DB_CONNECTION_ERROR, message: "An Error occured while storing database info" })
    }

    return Ok(created.id)

  } catch(e) {
    const err: Error = e
    switch (err.name) {
      case "not_found":
        return Err({ type: StorageErrors.DB_CONNECTION_ERROR, message: err.message })
      case "unauthorized":
        return Err({ type: StorageErrors.AUTH_ERROR, message: err.message })
      default: 
        return Err({ type: StorageErrors.ERROR, message: err.message })
    }
  } 
}


export const getStorageFactory: Factory<[PouchDB.Database<Storage>],  GetStorageStrategy> = db => async id => {
  
  // got back to Result<Maybe<UID>, string> check error for missing and responsd None
  try {
    const found = await db.get(id)
    return Ok(found)
  } catch(e) {
    const err: Error = e
    switch (err.name) {
      case "not_found":
        return Err({ type: StorageGetErrors.NOT_FOUND, message: err.message })
      case "unauthorized":
        return Err({ type: StorageErrors.AUTH_ERROR, message: err.message })
      default: 
        return Err({ type: StorageErrors.ERROR, message: err.message })
    }
  }
}

// create_db(userId, repoId) -> 
// get_database_uid(userId, repoId) -> Result<Maybe<UID>>
import crypto from "crypto"

type UID = string

type Err<T> = [false, T]
type Ok<T> = [true, T]

export type Result<T, E> = Ok<T> | Err<E>

type Some<T> = [true, T]
type None<T> = [false, null]

type Factory<A extends any[], T> = (...args: A) => T

export type Maybe<T> = Some<T> | None<T>

export interface Storage {
  _id: UID
}


type CreateDB = (userId: string, repoId: string) => Promise<Result<UID, string>>
const create_db: Factory<[PouchDB.Database<Storage>, IdHasher], CreateDB> = (db, hash)=> async (userId, repoId) => {
  try {
    const created = await db.put({
      _id: hash(userId, repoId)
    })

    if (!created.ok) {
      [false, "An Error occured while storing database info"]
    }

    return [true, created.id]

  } catch(e) {
    const err: Error = e
    return [false, err.message]
  }
}

type GetDbUid = (userId: string, repoId: string) => Promise<Result<UID, string>>
const get_database_uid: Factory<[PouchDB.Database<Storage>, IdHasher],  GetDbUid> = (db, hasher) => async (userId, repoId) => {
  
  // got back to Result<Maybe<UID>, string> check error for missing and responsd None
  try {
    const found = await db.get(hasher(userId, repoId))
    return [true, found._id]
  } catch(e) {
    const err: Error = e
    return [false, err.message]
  }
}

type IdHasher = (userId: string, repoId: string) => string
const hashIds: Factory<[string], IdHasher> = secret => (userId, repoId) => {
  return crypto.createHmac('sha256', secret)
    .update(`${userId}${repoId}`)
    .digest('base64')
}

export default async (db: PouchDB.Database<Storage>, secret: string): Promise<[CreateDB, GetDbUid]> => {
  return [ create_db(db, hashIds(secret)), get_database_uid(db, hashIds(secret)) ]
}
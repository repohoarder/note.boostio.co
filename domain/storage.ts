import { Result } from "../lib/result"

export interface Storage {
  _id: string,
  user: string
}

export enum StorageErrors {
  ERROR = "Database Error",
  DB_CONNECTION_ERROR = "Connection Error",
  AUTH_ERROR = "Authentication Error"
}

export enum StorageCreateErrors {
  ALREADY_EXISTS = "Conflict Error"
}

export enum StorageGetErrors {
  NOT_FOUND = "Not Found"
}

// define possible errors not found etc
export interface StorageError<T> {
  type: T | StorageErrors,
  message: string
}

export type CreateStorageStrategy = (userId: string) => Promise<Result<string, StorageError<StorageCreateErrors>>>
export type GetStorageStrategy = (repoId: string) => Promise<Result<Storage, StorageError<StorageGetErrors>>>

export const createStorage = (strategy: CreateStorageStrategy) => (userId: string) => {
  const storage = strategy(userId)
  // business logic
  // - creation restrictions etc
  // - transforms
  return storage
}

export const getStorage = (strategy: GetStorageStrategy) => (storageId: string) => {
  const storage = strategy(storageId)
  // business logic
  // - access restrictions
  // - user has auth (accept user param?)
  // - transforms
  return storage
}


type Err<T> = [false, T]
type Ok<T> = [true, T]

export type Result<T, E> = Ok<T> | Err<E>

export function Err<T>(error: T): Err<T> {
  return [false, error]
}

export function Ok<T>(data: T): Ok<T> {
  return [true, data]
}

export function isErr<T, E>(result: Result<T, E>): result is Err<E> {
  return result[0] === false
}

export function isOk<T, E>(result: Result<T, E>): result is Ok<T> {
  return result[0]
}

export function unwrapOk<T>(ok: Ok<T>): T {
  return ok[1]
}
export function unwrapErr<E>(err: Err<E>): E {
  return err[1]
}
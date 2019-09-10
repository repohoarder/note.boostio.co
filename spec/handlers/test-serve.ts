import http from 'http'
import listen from 'test-listen'
import { RequestListener } from 'http'

export type TestHandlerCallback = (url: string) => void

export async function testHandler(
  handler: RequestListener,
  testCallback: TestHandlerCallback
): Promise<void> {
  const server = new http.Server(handler)

  const url = await listen(server)
  try {
    await testCallback(url)
  } catch (error) {
    throw error
  } finally {
    server.close()
  }
}
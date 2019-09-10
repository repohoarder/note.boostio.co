import http from "http"
import { AddressInfo } from "net"

export default (handler: any) => new Promise<string>((resolve, reject) => {
  const srv = http.createServer(handler)
  srv.on('error', reject)

  srv.listen(() => {
    const {port} = srv.address() as AddressInfo
    resolve(`http://localhost:${port}`)
  })
})

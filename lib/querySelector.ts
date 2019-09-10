import { ParsedUrlQuery, parse } from 'querystring'
import { parse as urlParse } from 'url'
import { IncomingMessage } from 'http'


export default (req: IncomingMessage, single: boolean = true): ParsedUrlQuery => {
  if (req.url == null) {
    return {}
  }
  const parsed = urlParse(req.url)
  return parsed.query != null ? parse(parsed.query) : {}
}
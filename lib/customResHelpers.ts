import { NowRequest, NowResponse,NowRequestQuery } from '@now/node'

// helpers taken from now-node
// https://github.com/zeit/now/blob/canary/packages/now-node/src/helpers.ts

export function attachHelpers(req: NowRequest, res: NowResponse) {
  res.status = statusCode => status(res, statusCode);
  res.send = body => send(req, res, body);
  res.json = jsonBody => json(req, res, jsonBody);

  setLazyProp<NowRequestQuery>(req, 'query', getQueryParser(req));
}

function getQueryParser({ url = '/' }: NowRequest) {
  return function parseQuery(): NowRequestQuery {
    const { URL } = require('url');
    // we provide a placeholder base url because we only want searchParams
    const params = new URL(url, 'https://n').searchParams;

    const query: { [key: string]: string | string[] } = {};
    for (const [key, value] of params) {
      query[key] = value;
    }

    return query;
  };
}

function send(req: NowRequest, res: NowResponse, body: any): NowResponse {
  let chunk: unknown = body;
  let encoding: 'utf8' | undefined;

  switch (typeof chunk) {
    // string defaulting to html
    case 'string':
      if (!res.getHeader('content-type')) {
        res.setHeader('content-type', 'text/html');
      }
      break;
    case 'boolean':
    case 'number':
    case 'object':
      if (chunk === null) {
        chunk = '';
      } else if (Buffer.isBuffer(chunk)) {
        if (!res.getHeader('content-type')) {
          res.setHeader('content-type', 'application/octet-stream');
        }
      } else {
        return json(req, res, chunk);
      }
      break;
  }

  // write strings in utf-8
  if (typeof chunk === 'string') {
    encoding = 'utf8';

    // reflect this in content-type
    const type = res.getHeader('content-type');
    if (typeof type === 'string') {
      res.setHeader('content-type', setCharset(type, 'utf-8'));
    }
  }

  // populate Content-Length
  let len: number | undefined;
  if (chunk !== undefined) {
    if (Buffer.isBuffer(chunk)) {
      // get length of Buffer
      len = chunk.length;
    } else if (typeof chunk === 'string') {
      if (chunk.length < 1000) {
        // just calculate length small chunk
        len = Buffer.byteLength(chunk, encoding);
      } else {
        // convert chunk to Buffer and calculate
        const buf = Buffer.from(chunk, encoding);
        len = buf.length;
        chunk = buf;
        encoding = undefined;
      }
    } else {
      throw new Error(
        '`body` is not a valid string, object, boolean, number, Stream, or Buffer'
      );
    }

    if (len !== undefined) {
      res.setHeader('content-length', len);
    }
  }

  // populate ETag
  let etag: string | undefined;
  if (
    !res.getHeader('etag') &&
    len !== undefined &&
    (etag = createETag(chunk, encoding))
  ) {
    res.setHeader('etag', etag);
  }

  // strip irrelevant headers
  if (204 === res.statusCode || 304 === res.statusCode) {
    res.removeHeader('Content-Type');
    res.removeHeader('Content-Length');
    res.removeHeader('Transfer-Encoding');
    chunk = '';
  }

  if (req.method === 'HEAD') {
    // skip body for HEAD
    res.end();
  } else if (encoding) {
    // respond with encoding
    res.end(chunk, encoding);
  } else {
    // respond without encoding
    res.end(chunk);
  }

  return res;
}

function json(req: NowRequest, res: NowResponse, jsonBody: any): NowResponse {
  const body = JSON.stringify(jsonBody);

  // content-type
  if (!res.getHeader('content-type')) {
    res.setHeader('content-type', 'application/json; charset=utf-8');
  }

  return send(req, res, body);
}

function status(res: NowResponse, statusCode: number): NowResponse {
  res.statusCode = statusCode;
  return res;
}

function setCharset(type: string, charset: string) {
  const { parse, format } = require('content-type');
  const parsed = parse(type);
  parsed.parameters.charset = charset;
  return format(parsed);
}

function createETag(body: any, encoding: 'utf8' | undefined) {
  const etag = require('etag');
  const buf = !Buffer.isBuffer(body) ? Buffer.from(body, encoding) : body;
  return etag(buf, { weak: true });
}

function setLazyProp<T>(req: NowRequest, prop: string, getter: () => T) {
  const opts = { configurable: true, enumerable: true };
  const optsReset = { ...opts, writable: true };

  Object.defineProperty(req, prop, {
    ...opts,
    get: () => {
      const value = getter();
      // we set the property on the object to avoid recalculating it
      Object.defineProperty(req, prop, { ...optsReset, value });
      return value;
    },
    set: value => {
      Object.defineProperty(req, prop, { ...optsReset, value });
    },
  });
}
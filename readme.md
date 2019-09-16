# Storage Server

## Running

Run functions locally `npm run dev` (uses now.sh now dev)

Requires env variables -
- `STORAGE_DB_NAME={database name (url) for couchdb style database for user / storage meta}`
- `STORAGE_DB_USER={user for above db}`
- `STORAGE_DB_PASS={password for above db}`
- `PROXY_HOST={host (excluding protocol) of couchdb style http endpoints. e.g xxxxx-xxxxx.cloudantnosqldb.appdomain.cloud}`
- `PROXY_USER={user for PROXY_HOST db}`
- `PROXY_PASSWORD={passowrd for PROXY_HOST db}`

Deploying with environment variables must be done with `now secrets`. [Guide](https://zeit.co/docs/now-cli/#commands/secrets)

Test `npm run test`

## Notes

- `express-pouchdb` app seems unable to be dynamically created due to PouchDB setup errors on repeat setup
- `http-pouchdb` can be set with `app.setPouchDB()` dynamically however sometimes causes listener limit warnings. Possible memory leak.
- CORS not currently working with now.sh
- `express-pouchdb` security routes (`routes/security`) must be disabled due to firing before host prefix is added. This causes a non url to be force parsed as a url and leads to method calls on null errors.
    - possibly forkable and fixable?
    - CouchDB based security is unavailable but as I think auth is handled on the proxy it should be no problem

# Storage Server

Deployable with `now` or `now dev -d`

- Must have PouchDB built without `leveldown`
- DB route must not use `bodyParser` middleware
    - now.json build config { "src": .., "dest": .., "config": { "helpers": false }  }
    - "helpers": false must be a BOOLEAN! Ignore the documentation that has it as a string "false"
- Severless functions are stateless so UserData database is currently a CouchDB instance running on my own domain
- Routes to have single PouchDB database instance endpoint on /api/:userId/storages/:repoId/db is annoying
    - MUST now.sh rewrite to file -> consume ids -> generate unique DB name -> proxy to /db/:uniqueDBname
    - now doesn't seem to allow chained proxying
    - proxying within express seems to not work, rewriting url to /db/:uniqueName mostly errors
    - seems necessary to rewrite the url in the exported function and then pass to an express instance

### NEW FLOW

(storages/:storageId, not repo from different place)
=> POST .../storages -> no body for now, registers and generates UUID
=> endpoint .../storages/:storageId -> endpoing exists -> serve
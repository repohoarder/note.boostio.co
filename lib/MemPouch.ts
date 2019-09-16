import PouchDBCore from 'pouchdb-core'
import PouchDBMemoryAdapter from 'pouchdb-adapter-memory'
import PouchDBHttpAdapter from 'pouchdb-adapter-http'
import PouchDBReplication from 'pouchdb-replication'

const PouchDB = PouchDBCore
  .plugin(PouchDBReplication)
  .plugin(PouchDBMemoryAdapter)
  .plugin(PouchDBHttpAdapter)
  

export default PouchDB
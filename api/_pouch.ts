import PouchDBCore from 'pouchdb-core'
import PouchDBMemoryAdapter from 'pouchdb-adapter-memory'
import PouchDBMapReduce from 'pouchdb-mapreduce'
import PouchDBReplication from 'pouchdb-replication'
import PouchDBHttpAdapter from 'pouchdb-adapter-http'
import PouchDBFind from 'pouchdb-find'

const PouchDB = PouchDBCore
  .plugin(PouchDBMemoryAdapter)
  .plugin(PouchDBHttpAdapter)
  .plugin(PouchDBMapReduce)
  .plugin(PouchDBReplication)
  .plugin(PouchDBFind)

PouchDB.defaults({
  adapter: "memory",
})

export default PouchDB
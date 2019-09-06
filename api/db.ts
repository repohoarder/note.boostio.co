import ExpressPouch from "express-pouchdb"
import { NowRequest, NowResponse } from '@now/node'
import express from "express"
import cors from "cors"
import PouchDBCore from 'pouchdb-core'
import PouchDBMemoryAdapter from 'pouchdb-adapter-memory'
import PouchDBMapReduce from 'pouchdb-mapreduce'
import PouchDBHttpAdapter from 'pouchdb-adapter-http'
import PouchDBReplication from 'pouchdb-replication'
import PouchDBFind from 'pouchdb-find'

const PouchDB = PouchDBCore
  .plugin(PouchDBMemoryAdapter)
  .plugin(PouchDBHttpAdapter)
  .plugin(PouchDBMapReduce)
  .plugin(PouchDBReplication)
  .plugin(PouchDBFind)

PouchDB.defaults({
  adapter: "memory"
})

const app = express()
app.use(cors({
  credentials: true
}))
app.use((req, res, next) => {
  console.log(req.params)
  return ExpressPouch(PouchDB)(req, res)
})

export default (request: NowRequest, response: NowResponse) => {
  return app(request, response)
}
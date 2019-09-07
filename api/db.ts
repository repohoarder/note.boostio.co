import ExpressPouch from "express-pouchdb"
import { NowRequest, NowResponse } from '@now/node'
import express from "express"
import PouchDB from "./_pouch"
import UserDB from "./userDB"
import querystring from "querystring"

const app = express()

app.use("/db/:dbname", async (req, res, next) =>{
  const { dbname } = req.params
  
  try {
    await UserDB.get(dbname)
    next()
  } catch(e) {
    res.status(404).json(e)
  }
  
})

app.use("/db", ExpressPouch(PouchDB))

// PROXY TO /db/:uniqueName route, otherwise either all DBs will be named db OR requires an extra
// route param (/api/:user/storages/:repo/db/:dbname)
export default async (request: NowRequest, response: NowResponse) => {
  // needs more null checks
  const [ url, query ] = request.url != null ? request.url.split("?") : ["",""]
  const { boostId, repoId } = querystring.parse(query)
  const split = url.split("db")
  request.url = `/db/${boostId}:${repoId}${split[1]}`
  return app(request, response)
}
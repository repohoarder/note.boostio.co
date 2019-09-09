import ExpressPouch from "express-pouchdb"
import { NowRequest, NowResponse } from '@now/node'
import express from "express"
import PouchDB from "./_pouch"
import UserDB from "./userDB"
import querystring from "querystring"
import StorageRegisteryFactory from "../lib/repo_database"
import { attachHelpers } from "../lib/customResHelpers"

const app = express()
app.use("/db", ExpressPouch(PouchDB))

// PROXY TO /db/:uniqueName route, otherwise either all DBs will be named db OR requires an extra
// route param (/api/:user/storages/:repo/db/:dbname)
export default async (req: NowRequest, res: NowResponse) => {
  attachHelpers(req, res)

  // needs more null checks
  const { boostId, repoId, route } = req.query
  const userId = Array.isArray(boostId) ? boostId[0] : boostId
  const repositoryId = Array.isArray(repoId) ? repoId[0] : repoId

  const getUid = (await StorageRegisteryFactory(UserDB, "secret"))[1]
  const [ ok, uid_or_err ] = await getUid(userId, repositoryId)
  if (!ok) {
    res.status(404).json({
      error: uid_or_err
    })
    return
  }

  req.url = `/db/${uid_or_err}${route}`
  console.log(req.url)
  app(req, res)
  return
}






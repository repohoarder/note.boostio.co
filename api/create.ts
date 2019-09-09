import { NowRequest, NowResponse } from '@now/node'
import UserDB from "./userDB"
import RepoDBFactory from "../lib/repo_database"


export default async (req: NowRequest, res: NowResponse) => {

  if (req.body == null) {
    res.status(503).json({error: "no body"})
  }

  const { userId, repoId } = req.body
  if (userId == null || repoId == null) {
    res.status(503).json({ error: "some error" })
  }

  const [ createDb ] = await RepoDBFactory(UserDB, "secret")
  const [ ok, uuid ] = await createDb(userId, repoId)

  if (!ok) {
    res.status(500).json({
      error: uuid
    })
  }

  res.json({
    uuid
  })
}
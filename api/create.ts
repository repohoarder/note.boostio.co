import { NowRequest, NowResponse } from '@now/node'
import UserDB from "./userDB"


export default async (req: NowRequest, res: NowResponse) => {

  if (req.body == null) {
    return res.status(503).json({error: "no body"})
  }

  const { userId, repoId } = req.body
  if (userId == null || repoId == null) {
    return res.status(503).json({ error: "some error" })
  }

  let created;
  try {
    created = await UserDB.put({
      _id: `${userId}:${repoId}`,
      user: userId,
      repo: repoId
    })
  } catch(e) {
    return res.json(e)
  }

  if (created != null && created.ok) {
    return res.json({ created: created.id })
  } else {
    return res.json({ error: "failed to create" })
  }
}
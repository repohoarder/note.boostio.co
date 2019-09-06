import { NowRequest, NowResponse } from '@now/node'

export default (request: NowRequest, response: NowResponse) => {
  
  return response.json(request.query)
}

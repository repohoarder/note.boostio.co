
interface RequestParams {
  userId?: string 
  storageId?: string,
  command?: string
}

const regex = new RegExp(/\/api\/users\/([^/]+)\/storages\/([^/]+)\/db(.*)/);
export default (url: string): RequestParams => {
  const exec = regex.exec(url)
  if (exec == null) {
    return {}
  }
  return { storageId: exec[2], userId: exec[1], command: exec[3]  }
}
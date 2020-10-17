import Http from '../plugins/service/http'
import client from '../plugins/service/http/client/uni'

export default function (serviceName) {
  const service = require(`../plugins/service/core/${serviceName}`)
  return service(new Http(client))
}

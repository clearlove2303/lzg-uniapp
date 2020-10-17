/**
 * http request widget
 *
 * request options:
 * {
 *   name: api id,
 *   url: request url,
 *   data: request data,
 *   method: request method,
 *   headers: request headers,
 *   params: params set for uri
 * }
 */
function Http(client) {
  this.request = client
}

const methods = ['get', 'post', 'patch', 'put', 'delete', 'head']
methods.forEach((item) => {
  Http.prototype[item] = function (options) {
    const newOptions = Object.assign(options, {
      method: item.toUpperCase()
    })
    return this.request(newOptions)
  }
})

export default Http

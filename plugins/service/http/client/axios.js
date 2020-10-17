import axios from 'axios'
import Cookies from 'js-cookie'

import { getApi } from '../util'

const querystring = require('querystring')

// 配置默认请求地址
axios.defaults.baseURL = process.env.VUE_APP_APIHOST
axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded' // 配置默认请求头

/* eslint-disable no-param-reassign */
axios.interceptors.response.use(
  (response) => {
    if (response.data) {
      if (response.data.error_code && response.data.error_code !== 'SUCCESS') {
        throw new Error(response.data.message)
      }
    }
    return response
  },
  (error) => { // 拦截响应res,并做一些错误处理
    if (error && error.response) {
      switch (error.response.status) {
        case 400:
          error.message = '找不到页面(400)'
          break
        case 401:
          error.message = '未授权，请重新登录(401)'
          break
        case 403:
          error.message = '拒绝访问(403)'
          break
        case 404:
          error.message = '请求出错(404)'
          break
        case 408:
          error.message = '请求超时(408)'
          break
        case 500:
          error.message = '服务器错误(500)'
          break
        case 501:
          error.message = '服务未实现(501)'
          break
        case 502:
          error.message = '网络错误(502)'
          break
        case 503:
          error.message = '服务不可用(503)'
          break
        case 504:
          error.message = '网络超时(504)'
          break
        case 505:
          error.message = 'HTTP版本不受支持(505)'
          break
        default:
          error.message = `连接出错(${error.response.status})!`
      }
    } else {
      error.message = '连接服务器出错'
    }

    return Promise.reject(error) // 返回请求失败错误信息
  }
)

/**
 * Send http request
 * @param  {Object}   options  request options
 */
export default function (options) {
  const {
    name,
    url,
    data,
    method,
    headers,
    params
  } = options
  const api = getApi(name, params)
  let { uri } = api

  if ((method === 'GET' || method === 'HEAD') && data) {
    uri += `?${querystring.stringify(data)}`
  }

  if (method === 'GET' && url) {
    if (uri.indexOf('?') > -1) {
      uri += `&${url}`
    } else {
      uri += `?${url}`
    }
  }

  // add app query in url
  if (uri.indexOf('?') > -1) {
    uri += '&app=web'
  } else {
    uri += '?app=web'
  }

  const sOptions = {
    method: method && method.toUpperCase(),
    url: uri,
    headers: headers || {}
  }

  if (sOptions.method !== 'GET' && data) {
    sOptions.data = querystring.stringify(data)
  }

  if (sOptions.headers['Content-Type'] === 'application/json') {
    sOptions.data = data
  }

  if (api.auth === 'required' || api.auth === 'optional') {
    const token = Cookies.get('token')

    if (token) {
      sOptions.headers.Authorization = `Bearer ${token}`
    } else if (api.auth === 'required') {
      return Promise.reject(new Error('Unauthorized request'))
    } else {
      // nothing to do
    }
  }

  return axios(sOptions)
}

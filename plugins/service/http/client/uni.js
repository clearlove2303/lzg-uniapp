import jwt from '../../../jwt/core';
import { getApi } from '../util';
import md5 from 'js-md5'

const config = {
  // 接口主机地址
  baseUrl: process.env.NODE_ENV === 'development' ?
    'http://api.lxtest.laixuejigou.com/' : 'https://api.laixue.com/',

  // 请求默认参数
  options: {
    data: {},
    header: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    method: 'GET',
    dataType: 'json',
    responseType: 'text',
    success() {},
    fail() {},
    complete() {},
  },
  interceptor: {
    request: (options, api, Vue) => {
      if (api) {
        if (api.auth === 'required' || api.auth === 'optional') {
          let user = null;
          user = jwt.user();

          if (user !== null) {
            options.header['Authorization'] = `Bearer ${user.token}`;
          } else {
            if (api.auth === 'required') {
              return false;
            }
          }
        }
      }

      options.data = Object.assign({
        app: 'uniapp'
      }, options.data);

      return true;
    },
    response: (response) => {
      const statusCode = response.statusCode;
      let message = null;
      switch (statusCode) {
        case 200:
          break;

        case 400:
          message = '请求出错(400)'
        break
        case 401:
          message = '未授权，请重新登录(401)'
        break
        case 403:
          message = '拒绝访问(403)'
        break
        case 404:
          message = '找不到资源(404)'
        break
        case 408:
          message = '请求超时(408)'
        break
        case 500:
          message = '服务器错误(500)'
        break
        case 501:
          message = '服务未实现(501)'
        break
        case 502:
          message = '网络错误(502)'
        break
        case 503:
          message = '服务不可用(503)'
        break
        case 504:
          message = '网络超时(504)'
        break
        case 505:
          message = 'HTTP版本不受支持(505)'
        break
        default:
          message = `网络不给力，请稍后再试(${statusCode})!`
        break;
      }

      if (message !== null) {
        showToast(message);
      }

      return response;
    },
  }
};

function showToast(message) {
  uni.showToast({
    title: message,
    icon: 'none',
  });
}

function setStorage(key, value) {
  const time = new Date().getTime() + 3000;
  const data = {response: value, expires: time};
  uni.setStorage({key, data});
}

function getStorage(key) {
  try {
    const data = uni.getStorageSync(key);

    if (data == '' || new Date().getTime() > data.expires) {
      return false;
    }

    return data;
  } catch (e) {
    console.log(e)
  }
}

/**
 * Send http request
 * @param  {Object}   options  request options
 */
export default function (options) {
  const { name, params } = options;
  const api = getApi(name, params);

  if (api !== null) {
    delete options.name;
    delete options.params;
    options.url = config.baseUrl + api.uri;
  }

  const storagekey = md5(JSON.stringify(options));
  if (options.method == 'GET') {
    const res = getStorage(storagekey);
    if (res) {
      return new Promise((resolve) => {
        resolve(res.response);
      })
    }
  }

  return new Promise((resolve, reject) => {
    options.complete = (response) => {
      const statusCode = response.statusCode;
      let newResponse = response;

      if (typeof config.interceptor.response === 'function') {
        newResponse = config.interceptor.response(newResponse);
      }

      if (statusCode == 200) {
        if (options.method == 'GET') {
          setStorage(storagekey, newResponse)
        }
        resolve(newResponse);
      } else {
        reject(newResponse);
      }
    };

    const newOptions = Object.assign({}, config.options, options);

    if (typeof config.interceptor.request === 'function') {
      if (config.interceptor.request(newOptions, api) === false) {
        const message = '令牌无效，请重新登录';
        showToast(message);

        reject({
          message,
        });
      }
    }

    uni.request(newOptions);
  });
}

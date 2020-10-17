import pathToRegexp from 'path-to-regexp';
import apis from './apis';

/**
 * Get api object by name. URI will be replaced by data and params
 * @param  {String} name    Api name
 * @param  {Object} params  Request params
 * @return {Object}
 */
export function getApi(name, params) {
  if (!name) {
    return null;
  }
  let api = apis[name];
  let uri = api.uri;

  let keys = [];
  pathToRegexp(uri, keys);

  if (keys.length > 0) {
    keys.forEach((key) => {
      if (!params[key.name]) {
        throw new Error(`API name: ${name}. You are using dynamic params but ${key.name} not existed in your params`);
      }

      uri = uri.replace(`:${key.name}`, params[key.name] || 'undefined');
    });
  }

  return {
    uri,
    auth: api.auth,
  };
}

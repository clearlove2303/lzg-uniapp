import JWT from './core';

JWT.install = function (Vue) {
  Vue.prototype.$jwt = JWT;
}

export default JWT;

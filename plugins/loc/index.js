import Loc from './core';

Loc.install = function (Vue) {
  Vue.prototype.$loc = Loc;
}

export default Loc;
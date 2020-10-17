/**
 * 缓存组件注册
 *
 * @copyright 上海来学网教育科技有限公司
 * @author ltan
 */
import Cache from './core';

Cache.install = function (Vue) {
  Vue.prototype.$cache = Cache;
}

export default Cache;

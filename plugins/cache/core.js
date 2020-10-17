/**
 * 缓存操作类
 *
 * @copyright 上海来学网教育科技有限公司
 * @author ltan
 */

import keys from './keys';

export default {
  /**
   * 读取缓存
   * @param {String} key 缓存键
   * @param  {...any} stocks 可选参数，缓存键的替换值
   */
  get(key, ...stocks) {
    const cacheKey = this.getCacheKey(key, ...stocks);

    try {
      return uni.getStorageSync(cacheKey);
    } catch (error) {
      console.log(error);
      return '';
    }
  },

  /**
   * 设置缓存
   * @param {String} key   缓存键
   * @param {Any} value 缓存值
   * @param {Array} stocks   可选参数，缓存键的替换值
   */
  set(key, value, ...stocks) {
    if (!value) {
      return;
    }
    const data = JSON.stringify(value);
    // 为了不影响性能，如果字符串大于100KB则返回
    const byteSize = Uint8Array.from(data).byteLength;
    if (byteSize > 102400) {
      return;
    }

    const cacheKey = this.getCacheKey(key, ...stocks);

    // 存储缓存大小
    if (uni.getStorageSync(cacheKey) === '') {
      let cacheSize = uni.getStorageSync(keys.cacheSize);
      if (!cacheSize) {
        cacheSize = byteSize;
      } else {
        cacheSize = parseInt(cacheSize, 10);
        cacheSize += byteSize;
      }

      uni.setStorage({
        key: keys.cacheSize,
        data: cacheSize
      });
    }

    uni.setStorage({
      key: cacheKey,
      data: value,
      success: () => {
        // 存储缓存键
        const date = new Date();
        const field = cacheKey.substr(0, cacheKey.indexOf('-'));
        let cacheKeys = uni.getStorageSync(keys[field].cacheKeys);
        if (!cacheKeys) {
          cacheKeys = {};
        }
        cacheKeys[cacheKey] = date.getTime() / 1000;

        uni.setStorage({
          key: keys[field].cacheKeys,
          data: cacheKeys,
        });
      },
    });
  },

  /**
   * 删除缓存
   * @param {String} key 缓存键
   * @param  {...any} stocks 可选参数，缓存键的替换值
   */
  remove(key, ...stocks) {
    const cacheKey = this.getCacheKey(key, ...stocks);

    uni.removeStorage({
      key: cacheKey,
      success: function(res) {
        console.log(res);
      },
      fail: function(e) { 
        console.log(e);
      }
    });
  },

  /**
   * 获取缓存数据大小
   */
  size() {
    let cacheSize = uni.getStorageSync(keys.cacheSize);
    let imageSize = uni.getStorageSync('image-size');
    if (imageSize !== '') {
      cacheSize += imageSize;
    }

    if (!cacheSize) {
      return '0B';
    }

    cacheSize = parseInt(cacheSize, 10);
    const units = ['B', 'KB', 'MB', 'GB'];
    let index = 0;

    while (cacheSize > 1024) {
      cacheSize = Math.round(cacheSize / 1024, 2);
      index += 1;
    }

    return `${cacheSize}${units[index]}`;
  },

  /**
   * 清除缓存数据
   */
  clear() {
    uni.removeStorageSync('image-size');
    ['courses'].forEach(field => {
      const cacheKeys = uni.getStorageSync(keys[field].cacheKeys);
      if (!cacheKeys) {
        return;
      }

      Object.keys(cacheKeys).forEach(key => {
        uni.removeStorage({
          key
        });
      });

      uni.removeStorage({
        key: keys[field].cacheKeys,
      });
    });
  },

  getCacheKey(key, ...stocks) {
    let cacheKey = key;
    for (let i = 0; i < stocks.length; i++) {
      cacheKey = cacheKey.replace(`{${i}}`, stocks[i]);
    }

    return cacheKey;
  }
}

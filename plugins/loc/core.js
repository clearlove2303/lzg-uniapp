/**
 * 页面导航组件
 *
 * 方法中的参数uri只需传相对路径即可，页面跟目录会默认添加。
 * 比如：/pages/course/view, 只需要传 course/view
 */
const pathRoot = '/pages/';
export default {

  open(uri) {
    const setting = {
      url: pathRoot + uri,
    };

    // #ifdef APP-PLUS
    setting.animationType = 'slide-in-right';
    setting.animationDuration = 600;
    // #endif

    return new Promise((resolve, reject) => {
      setting.success = (e) => {
        resolve(e);
      };

      setting.fail = (e) => {
        reject(e);
      };

      uni.navigateTo(setting);
    });
  },

  /**
   * 跳转到指定tab
   * @param {String} uri tab标签路径
   *
   * See: https://uniapp.dcloud.io/api/router?id=switchtab
   */
  openTab(uri) {
    const setting = {
      url: pathRoot + uri,
    };

    return new Promise((resolve, reject) => {
      setting.success = (e) => {
        resolve(e);
      };

      setting.fail = (e) => {
        reject(e);
      };

      uni.switchTab(setting);
    });
  },

  /**
   * 页面后退
   * @param {Number} delta 后退的页数，默认是1
   *
   * See: https://uniapp.dcloud.io/api/router?id=navigateback
   */
  back(delta = 1) {
    const setting = {
      delta,
    };

    // #ifdef APP-PLUS
    setting.animationType = 'slide-out-right';
    setting.animationDuration = 600;
    // #endif

    return new Promise((resolve) => {
      uni.navigateBack(setting);
      resolve(true);
    });
  },

  /**
   * 重定向页面
   * @param {String} uri 重定向地址
   *
   * See: https://uniapp.dcloud.io/api/router?id=redirectto
   */
  redirect(uri) {
    const setting = {
      url: pathRoot + uri,
    };

    return new Promise((resolve, reject) => {
      setting.success = (e) => {
        resolve(e);
      };

      setting.fail = (e) => {
        reject(e);
      };

      uni.redirectTo(setting);
    });
  },

  /**
   * 关闭所有页面，并跳转到指定页面
   * @param {String} uri 重新打开的页面地址
   *
   * See: https://uniapp.dcloud.io/api/router?id=relaunch
   */
  reload(uri) {
    const setting = {
      url: pathRoot + uri,
    };

    return new Promise((resolve, reject) => {
      setting.success = (e) => {
        resolve(e);
      };

      setting.fail = (e) => {
        reject(e);
      };

      uni.reLaunch(setting);
    });
  },
}

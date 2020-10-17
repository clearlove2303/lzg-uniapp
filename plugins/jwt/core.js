export default {
  /**
   * 删除登录帐号
   */
  remove() {
    try {
      uni.removeStorageSync('user');
    } catch (e) {
      // console.log(e);
    }
  },

  /**
   * Store user object to storage
   * @param  {String} token jwt
   * @return {Object} playload data of jwt
   */
  save(token) {
    let playload = token.split('.')[1];
    playload = new Buffer(playload, 'base64').toString();
    playload = JSON.parse(playload);
    try {
      uni.setStorageSync('user', Object.assign(playload, {
        token,
      }));
      uni.setStorageSync('accessToken', playload.access_token);
    } catch (e) {
      // console.log(e);
    }

    return playload;
  },

  /**
   * 获取存储的用户对象；如果token已过期则从storage里面删除
   * @return {Object} 无效或不存在返回null；否则返回user对象
   */
  user() {
    try {
      const user = uni.getStorageSync('user');

      if (!user) {
        return null;
      }

      const now = new Date();
      if (user.exp < Math.floor(now.getTime() / 1000)) {
        uni.removeStorageSync('user');
        return null;
      }

      return user;
    } catch (e) {
      return null;
    }
  },
};

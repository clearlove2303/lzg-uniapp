class User {
  constructor(http) {
    this.http = http;
    return this;
  }

    /**
     * 登录用户
     * @param {Object} model
     *  密码/验证码: pass, 设备id:device_id, 用户： user
     *  类型: type
     */
    login(model) {
      return this.http.post({
        name: 'auth',
        data: model
      });
    }
    /**
     * 注册用户
     * @param {Object} model
     *  密码: pass, 验证码: captcha,
     *  user, 类型：type
     * @param {String} source 来源
     */
    reg(model) {
      const data = Object.assign({
        source: "UNIAPP",
      }, model)

      return this.http.post({
        name: 'reg',
        data,
      });
    }
    /**
     * @param {String} userId 用户id
     * @param {String} user
     * @param {String} type
     */
    createAuth(userId, user, type) {
      return this.http.post({
        name: 'create-auth',
        params: {
          id: userId
        },
        data: {user, type},
      });
    }
    /**
     * 检查手机号
     * @param {String} user 手机号或unionid
     * @param {String} type 类型
     */
    check(user, type = 'phone') {
      const data = {};
      data[type] = user;

      return this.http.get({
        name: 'check',
        data,
      });
    }
    /**
     * 查询用户手机信息
     * @param {String} userId 用户id
     * @param {String} type
     */
    getPhone(userId) {
      return this.http.get({
        name: 'user.auths',
        params: {
          id: userId
        },
        data: {
          type: "pass"
        },
      });
    }
    /**
     * 重制密码
     * @param {Object} model
     * 验证码： captcha，密码： password, 手机号: phone
     * @param {String} userId 用户id
     */
    resetPassword(userId, model) {
      return this.http.post({
        name: 'user.change-auth',
        params: {
          id: userId
        },
        data: model,
      });
    }
    /**
     * 设备设置接口
     * @param {String} id 用户id
     * @param {String} deviceId  设备id
     * @param {Number} phone
     * @param {Number} captcha
     */
    setting(id, deviceId, phone, captcha) {
      return this.http.post({
        name: 'user.device',
        params: {
          id
        },
        data: {
          device_id: deviceId,
          phone,
          captcha
        }
      });
    }
    /**
     * 获取用户信息
     * @param {Number} id
     */
    get(id) {
      return this.http.get({
        name: 'user.view',
        params: {
          id
        },
      });
    }
    /**
     * 更新用户信息
     * @param {Object} model
     * 分类id: categoryId, 上传文件地址：avator, 上传文件id: upid
     * @param {Number} id
     */
    update(id, model) {
      return this.http.post({
        name: 'user.view',
        params: {
          id
        },
        data: model
      });
    }
    /**
     * 反馈接口
     * @param {String} type 类型
     * @param {String} content 内容
     * @param {String} source 来源
     */
    advise(type, content, source = "UNIAPP") {
      return this.http.post({
        name: 'advice',
        data: {
          type,
          content,
          source
        },
      });
    }
    /**
     * 更改密码
     * @param {Number} phone
     * @param {Number} captcha
     * @param {String} password
     */
    changePassword(phone, captcha, password) {
      return this.http.post({
        name: 'user.pass-change',
        data: {
          phone,
          captcha,
          password
        },
      });
    }
    /**
     * 用户注销
     * @param {String} id 用户id
     * @param {String} reason 注销原因
     * @param {String} source 来源
     */
    logoff(id, reason, source = "UNIAPP") {
      return this.http.post({
        name: 'log-off',
        params: {
          id
        },
        data: {
          reason,
          source,
        },
      });
    }
    /**
     * 优惠卷
     * @param {Object} condition
     * 每页多少个： per_page, 状态：status, 当前页：page
     * @param {Number} id
     */
    queryCoupons(id, condition) {
      return this.http.get({
        name: 'user.coupons',
        params: {
          id
        },
        data: condition
      });
    }
    /**
     * ios购买学币
     * @param {Object} data ios付款完成后返回的信息
     */
    bugGolds(data) {
      return this.http.post({
        name: 'user.gold-orders',
        data,
        header: {
          'Content-Type': 'application/json',
        }
      })
    }
    /**
     * 用户是否需要设备验证,data.error为SUCCESS则不需要验证
     * @param {Number} deviceId 设备id
     * @param {Number} id
     */
    checkDevice(id, deviceId) {
      return this.http.get({
        name: 'user.check-device',
        params: {
          id: id
        },
        data: {
          device_id: deviceId
        }
      })
    }
}

module.exports = function(http) {
  return new User(http)
}

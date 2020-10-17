class Tool {
  constructor(http) {
    this.http = http;
    return this;
  }
  /**
   * 检查版本更新
   * @param {String} version 版本
   * @param {String} package app包
   */
  checkAppUpdate(version, appPackage) {
    const data = { version, package: appPackage }
    return this.http.get({
      name: 'app-release',
      data
    })
  }

  /**
   * 发送短信
   * @param {String} name 发送验证码类别
   * @param {Number} phone 手机号
   * @param {String} operation 操作方式
   * @param {String} product 生产环境
   */
  sendMessage(name, phone, operation, product = '来学网') {
    const data = { phone, operation, product }
    return this.http.get({
      name,
      data
    })
  }

  /**
   * 手机号验证码验证
   * @param {Number} phone 手机号
   * @param {Number} captcha 验证码
    */
  verificationCaptcha(phone, captcha) {
    const data = { phone, captcha }
    return this.http.get({
      name: 'tool.captcha-validator',
      data
    })
  }
  
  sendImageCaptcha() {
    return this.http.get({
      name: 'captcha-generator'
    })
  }

  /**
   * 验证验证码
   * @param {String} id
   * @param {String} captcha
   */
  captchaValidator(id, captcha) {
    return this.http.post({
      name: 'captcha-validator',
      data: {
        id,
        verify_value: captcha
      }
    })
  }
}
module.exports = function(http) {
  return new Tool(http)
}
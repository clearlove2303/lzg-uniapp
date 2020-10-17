class Weixin {
  constructor(http) {
    this.http = http;
    return this;
  }

  /**
   * 获得sessionkey
   * @param {String} appid 
   * @param {String} code code
   */
  getSessionkey(appid, code) {
    return this.http.get({
      name: 'sessionkey',
      data: { 
        appid,
        js_code: code
      },
    });
  }
  /**
   * 查询微信/QQ列表
   * @param {Object} model
   * campus_id 分校id 必填
   * dept_id 部门id 选填
   * admin_id 员工id 选填
   * status 状态 选填
   * account 账户 选填
   * nick 昵称 选填
   */
  elementQuery(model) {
    return this.http.get({
      name: 'element-weixins.view',
      data: model
    })
  }
}

module.exports = function(http) {
  return new Weixin(http)
}
class Employee {
  constructor(http) {
    this.http = http;
    return this;
  }
  /**
   * 登录
   * @param {Object} data
   * 用户名：user, 密码：pass, 类型：type
   */
  login(data) {
    return this.http.post({
      name: 'admin-auth',
      data
    })
  }
}
module.exports = function(http) {
  return new Employee(http)
}
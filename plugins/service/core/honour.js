class Honour {
  constructor(http) {
      this.http = http;
      return this;
  }

  /**
   * 查询公司荣誉列表
   * @param {String} type (type一次只能传一个类型)
   * HONOUR, 公司荣誉 或者
   * REPORT, 轮播图
   */
  query(type) {
    return this.http.get({
      name: 'honours',
      data: {
        type
      }
    })
  }
}

module.exports = function(http) {
  return new Honour(http)
}
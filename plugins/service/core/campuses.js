class Campuses {
  constructor(http) {
    this.http = http;
    return this;
  }

  /**
   * 查询分校列表
   * @param {String} position 位置
   */
  query(data) {
    return this.http.get({
      name: 'campuses',
      data
    });
  }
  /**
   * 查询分校详情
   */
  get(id) {
    return this.http.get({
      name: 'campuses.view',
      params: {
        id
      }
    })
  }
}

module.exports = function(http) {
  return new Campuses(http)
}

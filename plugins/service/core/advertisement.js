class Advertisement {
  constructor(http) {
    this.http = http;
    return this;
  }

  /**
   * 查询轮播图
   * @param {String} position 位置
   */
  query(position) {
    return this.http.get({
      name: 'ad.index',
      data: { position }
    });
  }
}

module.exports = function(http) {
  return new Advertisement(http)
}

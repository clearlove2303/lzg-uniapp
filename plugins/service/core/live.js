class Live {
  constructor(http) {
    this.http = http;
    return this;
  }

  /**
   * 获取直播
   * @param {Object} condition
   * category_id: 分类id 
   */
  getBy(condition) {
    const data = condition;
    return this.http.get({
      name: 'live-courses.latest',
      data
    })
  }
}

module.exports = function(http) {
  return new Live(http)
}
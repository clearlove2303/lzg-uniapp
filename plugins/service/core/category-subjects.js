class CategorySubjects {
  constructor(http) {
    this.http = http;
    return this;
  }

  /**
   * 查询科目或者分类
   * @param {condition} 
   * 分类id: category_id, 科目id: refid
   */
  query(condition) {
    let data = Object.assign({}, condition);
    return this.http.get({
      name: 'major-subject.index',
      data,
    })
  }
}

module.exports = function(http) {
  return new CategorySubjects(http)
}
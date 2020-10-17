class Document {
  constructor(http) {
    this.http = http;
    return this;
  }

  /**
   * 查询文章列表
   * @param {Object} conditon
   * 课程id: course_id, 科目id: subject_ids，类型： type
   * @param {Number} pageSize
   * @param {Number} page
   */
  query(condition, page = 1, pageSize = 20) {
   const data = Object.assign({
     per_page: pageSize,
     page
   }, condition)

   return this.http.get({
     name: 'document.index',
     data,
   });
  }
  /**
   * 文档更新
   * @param {String} id
   */
  update(id) {
    return this.http.post({
      name: 'document.update',
      params: { id },
    })
  }
}

module.exports = function(http) {
  return new Document(http)
}

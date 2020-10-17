class PaperCategory {
  constructor(http) {
    this.http = http;
    return this;
  }

  /**
   * 
   * 查询试卷分类
   * @param {String} examId
   * @param {String} page
   * @param {String} pageSize
   */
  query(examId, condition, page = 1, pageSize = 20) {
    const data = Object.assign({
      page,
      per_page: pageSize
    }, condition)
    return this.http.get({
      name: 'exam.paper-categories',
      params: {
        id: examId
      },
      data
    });
  }
}

module.exports = function(http) {
  return new PaperCategory(http)
}
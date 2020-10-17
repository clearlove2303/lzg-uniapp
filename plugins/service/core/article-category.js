class ArticleCategory {
  constructor(http) {
    this.http = http;
    return this;
  }

  /**
   * 查询文章栏目列表
   * @param {String} refid  
   */
  query(refid) {
    return this.http.get({
      name: 'article-category',
      data: { refid }
    });
  }
}

module.exports = function(http) {
  return new ArticleCategory(http)
}
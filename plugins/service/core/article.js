class Article {
  constructor(http) {
    this.http = http;
    return this;
  }

  /**
   * 查询文章列表
   * @param {Object} conditon
   * 分类id: category_id, 文章分类id: article_category_id
   * @param {Number} pageSize
   * @param {Number} page
   */
  query(condition, page = 1, pageSize = 20) {
    const data = Object.assign({
      per_page: pageSize,
      page
    }, condition)

    return this.http.get({
      name: 'article',
      data
    })
  }

  /**
   * 查询单个文章
   * @param {Number} id
   * 文章id
   */
  get(id, expand = null) {
    const data = {}
    if (expand) {
      data.expand = expand;
    }

    return this.http.get({
      name: 'article.view',
      params: {
        id
      },
      data,
    })
  }
}

module.exports = function(http) {
  return new Article(http)
}

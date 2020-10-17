class Category {
  constructor(http) {
    this.http = http
    return this
  }

  /**
   * 查询分类
   * @param {Object} condition
   * 查询依据: expand, 父类id: refid, 是热门: is_hot
   * expand, refid, is_hot,
   * @param {String} flag 标记
   */
  query(condition, flag = 'y') {
    const data = Object.assign({
      flag
    }, condition)
    return this.http.get({
      name: 'category.index',
      data,
    });
  }

  /**
   * 获取用户已购课程分类
   * @param {String} userId
   * @param {String} expand
   */
  queryCourseMajorsByUser(userId, expand = 'subjects') {
    return this.http.get({
      name: 'user.course-majors',
      params: {
        id: userId
      },
      data: {
        expand
      },
    });
  }
}

module.exports = function (http) {
  return new Category(http)
}

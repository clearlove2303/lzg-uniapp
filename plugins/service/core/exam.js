class Exam {
  constructor(http) {
    this.http = http;
    return this;
  }

/**
 * 题库查询接口
 * @param {String} userId 用户id 
 * @param {Object} condition 
 * major_id
 */
  queryAll(conditon) {
    const data = conditon;
    return this.http.get({
      name: 'exam.index',
      data
    })
  }

  query(userId, condition) {
    let option = {
      name: 'user.exams',
      params: {
        id: userId
      },
    }
    if (condition) {
      option.data = condition;
    }
    return this.http.get(option);
  }

  /**
   * 获得题库统计结果
   * @param {String} userId 用户id 
   * @param {String} examId 题库id
   */
  getSummary(userId, examId) {
    return this.http.get({
      name: 'user.exam.summary',
      params: {
        id: userId,
        exam_id: examId,
      },
    });
  }
  /**
   * 查询我的收藏
   * @param {Object} params
   * 用户id: user_id, 题库id: exam_id
   * @param {Number} page 当前页面
   * @param {Number} perPage 每页几条
   */
  queryFavoriteTests(params, page = 1, perPage = 20) {
    return this.http.get({
      name: 'user.exam.favorite-tests',
      params,
      data: {
        page: page,
        per_page: perPage
      }
    });
  }
  /**
   * 查询我的错题集
   * @param {Object} params
   * 用户id: user_id, 题库id: exam_id
   * @param {Number} page 当前页面
   * @param {Number} perPage 每页几条
   */
  queryWrongTests(params, page = 1, perPage = 20) {
    return this.http.get({
      name: 'user.exam.wrong-tests',
      params,
      data: {
        page: page,
        per_page: perPage
      }
    });
  }
  /**
   * 查询搜索题目列表
   * @param {Object || String || Number} params
   * 题库id: id
   * @param {String} title 搜索题目名字
   * @param {Number} page 当前页面
   * @param {Number} perPage 每页几条
   */
  querySearchList(params, title, page = 1, perPage = 20) {
    let option = {};
    if (typeof params !== 'object') {
      option.id = params;
      params = option;
    }

    return this.http.get({
      name: 'exam.tests',
      params,
      data: {
        title: title,
        page: page,
        per_page: perPage
      }
    });
  }
}

module.exports = function(http) {
  return new Exam(http)
}
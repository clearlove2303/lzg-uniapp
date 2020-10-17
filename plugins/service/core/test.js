class Test {
  constructor(http) {
    this.http = http;
    return this;
  }

  /**
   * 
   * 获取试题详情
   * @param {String} id
   */
  get(id) {
    return this.http.get({
      name: 'test.view',
      params: {
        id,
      },
    });
  }

  /**
   * 
   * 获取试题列表
   * @param {String} title
   * @param {Number} page
   * @param {Number} examId
   * @param {Number} pageSize
   */
  query(title, examId, page = 1, pageSize = 20) {
    return this.http.get({
      name: 'tests',
      data: {
        exam_id: examId,
        title,
        page,
        per_page: pageSize
      },
    });
  }

  /**
   * 
   * 答题接口
   * @param {String} id
   * @param {Object} data 
   * is_right: 是否正确，exam_id: 题库id，answer: 自己答题答案，auto_remove：是否开启自动移除错题集
   */
  answer(id, data) {
    return this.http.post({
      name: "test.answer",
      params: {
        id,
      },
      data
    })
  }

  /**
   * 
   * 批量答题接口
   * @param {object} 
   * 参数 answers [{test_id:xxx, is_right:1, answer:xxx},....] test_id 题目id, is_right: 是否正确, answer: 自己答题答案
   * autoRemove 是否开启自动移除错题集
   * isSubmit 是否交卷
   * examId 题库id
   */
  batchAnswer(data) {
    return this.http.post({
      header: {
        'Content-type': 'application/json',
      },
      name: "tests.batch.answer",
      data,
    })
  }

  /**
   * 
   * 试题纠错
   * @param {String} id 
   * @param {Object} data 
   * content: 反馈内容，user_id
   */
  correct(id, data) {
    return this.http.post({
      name: "correct",
      params: {
        id,
      },
      data
    })
  }
  /**
   * 查询搜索题目列表
   * @param {Object || String || Number} params
   * 试卷id: id
   * @param {Number} page 当前页面
   * @param {Number} perPage 每页几条
   */
  queryByPaper(params, page = 1, perPage = 20) {
    let option = {};
    if (typeof params !== 'object') {
      option.id = params;
      params = option;
    }

    return this.http.get({
      name: 'paper.tests',
      params,
      data: {
        page: page,
        per_page: perPage,
      }
    });
  }
}

module.exports = function(http) {
  return new Test(http)
}
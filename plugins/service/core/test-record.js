class TestRecord {
  constructor(http) {
    this.http = http;
    return this;
  }

  /**
   * 获取学习记录
   * @param {String} userId 用户id
   * @param {Object} condition
   * exam_id 
   */
  getLastPaper(userId, condition) {
    let option = {
      name: 'user.last-paper',
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
   * 
   * 查询答题记录
   * @param {object} data 
   * （非必填）test_id  paper_record_id
   */
  get(data) {
    return this.http.get({
      name: 'test-record.index',
      data,
    });
  }

  /**
   * 删除答题记录
   * @param {Array} testIds 
   */
  delete(testIds) {
    return this.http.post({
      header: {
        'Content-type': 'application/json',
      },
      name: "test-record.batch",
      data: {
        delete: testIds
      }
    })
  }
}

module.exports = function(http) {
  return new TestRecord(http)
}
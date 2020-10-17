class TestFav {
  constructor(http) {
    this.http = http;
    return this;
  }

  /**
   * 
   * 收藏题目
   * @param {String} testId
   * @param {String} examId
   */
  update(testId, examId) {
    return this.http.post({
      name: 'test.favs',
      data: {
        test_id: testId,
        exam_id: examId
      },
    });
  }

  /**
   * 删除已收藏题目
   * @param {Array} testIds 
   */
  delete(testIds) {
    return this.http.post({
      header: {
        'Content-type': 'application/json',
      },
      name: "test-fav.batch",
      data: {
        delete: testIds
      }
    })
  }
}

module.exports = function(http) {
  return new TestFav(http)
}
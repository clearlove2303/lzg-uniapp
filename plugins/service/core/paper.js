class Paper {
  constructor(http) {
    this.http = http;
    return this;
  }

  /**
   * 通过试卷分类查询试卷列表
   * @param {String} paperCategoryId 
   * @param {String} page
   */
  queryByPaperCategory(paperCategoryId, page = 1) {
    return this.http.get({
      name: "paper-category.papers",
      params: {
        id: paperCategoryId,
      },
      data: {
        page
      }
    })
  }

  /**
   * 通过题库查询试卷列表
   * @param {String} examId 
   * @param {String} expand 
   * @param {String} sort 
   */
  queryByExam(examId, expand, sort = '-id') {
    if (!examId) {
      return;
    }
    return this.http.get({
      name: "exam.papers",
      params: {
        id: examId,
      },
      data: {
        expand,
        sort
      }
    })
  }

  /**
   * 
   * 获取试卷答题统计
   * @param {String} userId 用户id
   * @param {String} paperId 试卷id
   * @param {String}（非必填）paperRecordId 试卷记录id
   */
  getRecord(userId, paperId, paperRecordId) {
    let data = {}
    if (paperRecordId) {
      Object.assign(data, {paper_record_id: paperRecordId});
    }
    return this.http.get({
      name: 'user.papers.record',
      params: {
        id: userId,
        paper_id: paperId
      },
      data
    });
  }
}

module.exports = function(http) {
  return new Paper(http)
}
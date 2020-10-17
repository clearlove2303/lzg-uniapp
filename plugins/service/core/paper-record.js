class PaperRecord {
  constructor(http) {
    this.http = http;
    return this;
  }

  /**
   * 
   * 查询试卷答题记录
   * @param {object} data
   * 参数：paper_id， is_submited
   */
  get(data) {
    return this.http.get({
      name: 'paper-records',
      data,
    });
  }
}

module.exports = function(http) {
  return new PaperRecord(http)
}
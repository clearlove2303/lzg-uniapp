class Grade {
  constructor(http) {
    this.http = http;
    return this;
  }

  /**
   * 
   * 查询班次列表
   * @param {String} subjectId 
   * @param {Number} type
   */
  query(subjectId , type = 0) {
    return this.http.get({
      name: 'grades',
      data: {
        subject_id: subjectId,
        type
      },
    });
  }
}

module.exports = function(http) {
  return new Grade(http)
}
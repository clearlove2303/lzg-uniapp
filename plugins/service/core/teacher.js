class Teacher {
  constructor(http) {
    this.http = http;
    return this;
  }

  
  /**
   * 讲师列表
   * @memberof Teacher
   */
  query(data) {
    return this.http.get({
      name: 'teacher',
      data
    });
  }
}

module.exports = function(http) {
  return new Teacher(http)
}
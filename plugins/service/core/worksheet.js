class Worksheet {
  constructor(http) {
    this.http = http;
    return this;
  }

  /**
   * 获得sessionkey
   * @param {String} appid 
   * @param {String} code code
   */
  query(condition) {
    const data = condition
    return this.http.get({
      name: 'worksheet',
      data
    });
  }
}

module.exports = function(http) {
  return new Worksheet(http)
}
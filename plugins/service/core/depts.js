class Depts {
    constructor(http) {
      this.http = http;
      return this;
    }
  
    /**
     * 获取微信/QQ列表
     * @param {Number} campusId 
     * @param {Number} parent 
     */
    elementQuery(campusId, parent = 0) {
      return this.http.get({
        name: 'element-depts.view',
        data: {
          campus_id: campusId,
          parent: parent
        }
      })
    }
  }
  
  module.exports = function(http) {
    return new Depts(http)
  }
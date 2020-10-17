class companies {
    constructor(http) {
      this.http = http;
      return this;
    }
  
    /** 
     * 查询公司列表
    */
    query(condition, page = 1, pageSize = 20) {
      let data = Object.assign({
        page: page,
        per_page: pageSize
      }, condition);
      return this.http.get({
        name: 'companies',
        data
      });
    }
  }
  
  module.exports = function(http) {
    return new companies(http)
  }
  
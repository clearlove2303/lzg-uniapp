class Employees {
    constructor(http) {
      this.http = http;
      return this;
    }
  
    /**
     * 查询分校所属员工
     * @param {Number} camIpusId // 分校id
     * @param {Number} deptId // 部门id
     * @param {String} role // 角色 
     */
    elementQuery(camIpusId, deptId, role ) {
      return this.http.get({
        name: 'element-employees.view',
        data: {
          campus_id: camIpusId,
          dept_id: deptId,
          role
        }
      })
    }
  }
  
  module.exports = function(http) {
    return new Employees(http)
  }
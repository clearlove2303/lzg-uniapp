class Mail {
  constructor(http) {
    this.http = http;
    return this;
  }

  /**
   * 查询通知详情
   * @param {Number} id 
   */
  get(id) {
    return this.http.get({
      name: 'mail.view',
      params: {
        id
      }
    })
  }
  
  /**
   * 通知列表
   * @param {Number} adminId token里面的员工id
   */
  query(adminId, page = 1, pageSize = 20) {
    return this.http.get({
      name: 'element-mail-list',
      data: {
        admin_id: adminId,
        page,
        per_page: pageSize
      }
    })
  }

  /**
   * 检查更新列表
   */
  check(adminId) {
    return this.http.post({
      name: 'mails-check',
      data: {
        admin_id: adminId
      }
    })
  }
}

module.exports = function(http) {
  return new Mail(http)
}
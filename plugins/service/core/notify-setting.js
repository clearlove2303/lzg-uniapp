class NotifySetting {
  constructor(http) {
    this.http = http;
    return this;
  }

  /**
   * 查询是否开启学习通知设置
   * @param {String} userId 
   */
  query(userId) {
    return this.http.get({
      name: 'user.notify-settings',
      params: { 
        id: userId
      },
    });
  }

  /**
   * 学习通知设置
   * @param {String} id 
   * @param {String} value
   */
  update(id , value) {
    return this.http.post({
      name: 'notify-settings',
      params: { id },
      data: { value }
    });
  }
}

module.exports = function(http) {
  return new NotifySetting(http)
}
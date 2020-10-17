class Message {
  constructor(http) {
    this.http = http;
    return this;
  }

  /**
   * 查询消息列表
   * @param {String} userId 
   * @param {Number} page 
   */
  queryByUser(userId, page = 1, pageSize = 20) {
    return this.http.get({
      name: 'user.messages',
      params: { 
        id : userId
      },
      data: { 
        page,
        per_page: pageSize
      }
    });
  }
  /**
   * 消息单个更新
   * @param {Number} userId 用户id 
   * @param {Number} messageId 消息id
   */
  update(userId, messageId) {
    return this.http.post({
      name: 'messages.update',
      params: {
        id: userId,
        mid: messageId
      }
    });
  }
  /**
   * 消息多个更新
   * @param {Number} userId 用户id 
   */
  updateAll(userId) {
    return this.http.post({
      name: 'messages.updateAll',
      params: { 
        id: userId,
      }
    });
  }
}

module.exports = function(http) {
  return new Message(http)
}
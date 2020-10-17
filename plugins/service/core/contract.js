class Contract {
  constructor(http) {
    this.http = http;
    return this;
  }

  /**
   * 查询用户协议
   * @param {String} userId  
   * @param {Object} conditioin status: ALL、TOPAY、FINISH、CANCELED 协议状态
   */
  queryByUser(userId, conditioin) {
    const data = conditioin;
    return this.http.get({
      name: 'user.contracts',
      params: {
        id: userId
      },
      data
    });
  }
  /**
   * 查询订单详情
   * @param {String} id 订单id
   */
  getOrder(id) {
    return this.http.get({
      name: 'user-order.view',
      params: {
        id
      }
    })
  }
  /**
   *
   * 查询协议详情
   * @param {String} id 协议id
   */
  get(id, expand = 'subjects') {
    return this.http.get({
      name: 'user-contract.view',
      params: {
        id
      },
      data: {
        expand,
      }
    })
  }
  /**
   *
   * 更新协议
   * @param {String} id 协议id
   */
  update(id, conditioin) {
    const data = conditioin;
    return this.http.post({
      name: 'user-contract.view',
      params: {
        id
      },
      data
    })
  }
  /**
   * 取消用户协议
   * @param {String} id 协议id
   */
  cancel(id) {
    return this.http.post({
      name: 'user-contracts.cancel',
      params: {
        id
      }
    })
  }
  /**
   * 支付协议
   * @param {String} id 协议id
   * @param {Object} conditioin deal_type: 支付方式
   */
  pay(id, conditioin) {
    const data = conditioin;
    return this.http.post({
      name: 'user-contract.payment',
      params: {
        id
      },
      data
    })
  }
  /**
   * 协议报名
   *
   * @param {String} userId
   * @param {Object} condition category_id: 分类id major_id: 科目id subject_ids: 报考科目 year: 报考年份
   * @param {String} source 协议来源
   */
  enroll(userId, condition) {
    const data = condition;
    return this.http.post({
      name: 'user.enrollment',
      params: {
        id: userId
      },
      data
    })
  }
  /**
   * 正在进行的协议
   * @param {String} userId
   */
  getOngoing(userId) {
    return this.http.get({
      name: 'user.ongoing-contract',
      params: {
        id: userId
      }
    })
  }

}

module.exports = function(http) {
  return new Contract(http)
}
class Crm {
  constructor(http) {
    this.http = http;
    return this;
  }

  /**
   * 今日录入协议数
   * campusID 分校公司id
   */
  queryContracts(campusID, condition) {
    const data = condition
    return this.http.get({
      name: 'crm-contracts',
      params: {
        id: campusID
      },
      data
    });
  }
  /**
   * 今日成交金额
   */
  queryRecordsSummary(condition) {
    const data = condition
    return this.http.get({
      name: 'records-summary',
      data
    });
  }
}

module.exports = function(http) {
  return new Crm(http)
}
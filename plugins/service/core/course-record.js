class CourseRecord {
  constructor(http) {
    this.http = http;
    return this;
  }

  /**
   * 
   * 获取课程小节观看记录
   * @param {String} sectionId 
   */
  queryBySection(sectionId) {
    return this.http.get({
      name: 'course-section.record',
      params: {
        id: sectionId
      }
    });
  }

  /**
   * 
   * 更新课程小节观看记录
   * @param {String} sectionId 
   * @param {Object} data
   * 用户id: uid, 课程id: cid , 观看进度时间：duration, 是否观看完：isFinished
   */
  watch(sectionId, data) {
    return this.http.post({
      name: 'course-section.watch',
      params: {
        id: sectionId
      },
      data,
    });
  }

  /**
   * 
   * 获取用户观看历史
   * @param {String} userId 
   * @param {Number} page 
   */
  queryByUser(userId, page = 1, pageSize = 20) {
    return this.http.get({
      name: 'course-records',
      params: {
        id: userId
      },
      data: {
        page,
        per_page: pageSize
      },
    });
  }

  /**
   * 获取课程记录
   * @param {String} userId 用户id
   * @param {String} expand
   */
  getLastCourse(userId, expand = "category") {
    return this.http.get({
      name: 'user.last-course',
      params: {
        id: userId
      },
      data: {
        expand
      }
    })
  }

  /**
   * 删除课程观看历史
   * @param {Array} courseIds 
   */
  deleteAll(courseIds) {
    return this.http.post({
      header: {
        'Content-type': 'application/json',
      },
      name: "course-records.batch",
      data: {
        delete: courseIds
      }
    })
  }
}

module.exports = function(http) {
  return new CourseRecord(http)
}
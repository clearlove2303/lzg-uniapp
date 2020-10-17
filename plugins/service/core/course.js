class Course {
  constructor(http) {
    this.http = http;
    return this;
  }

  /**
   * 查询视频课程列表
   * @param {Object} conditon
   * 班次id: grade_id, 科目id: subject_id, major_id: major_id, category_id: category_id
   * @param {Number} onsale 
   * 是否上架
   * @param {Number} page
   * @param {Number} type
   * 类型{0: 点播， 1: 直播， 2: 试听}
   */
  query(condition, page = 1) {
    const data = Object.assign({
      onsale: 1,
      page,
      type: 0
    }, condition)

    return this.http.get({
      name: 'course.index',
      data,
    });
  }

  /**
   * 
   * 获取课程介绍
   * @param {String} courseId  
   */
  get(courseId) {
    return this.http.get({
      name: 'course.view',
      params: {
        id: courseId
      },
    });
  }

  /**
   * 
   * 获取课程小节课件
   * @param {String} sectionId
   * @param {Number} page 
   */
  queryCoursewares(sectionId, page = 1) {
    return this.http.get({
      name: 'course-section.coursewares',
      params: {
        id: sectionId
      },
      data: {
        page
      }
    });
  }

  /**
   * 
   * 获取课程章节
   * @param {String} courseId  
   * @param {String} condition expand
   */
  queryChapters(courseId, condition, page = 1, pageSize = 20) {
    const data = Object.assign({
      page,
      per_page: pageSize
    }, condition);
    return this.http.get({
      name: 'course.chapters',
      params: {
        id: courseId
      },
      data
    });
  }
}

module.exports = function(http) {
  return new Course(http)
}
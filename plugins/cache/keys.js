/**
 * 缓存键常量定义
 *
 * @copyright 上海来学网教育科技有限公司
 * @author ltan
 */
export default {
  cacheSize: 'cache-size',
  pages: {
    cacheKeys: 'pages-cache-keys', // 缓存的键

    // 分类页
    category: {
      hot: 'pages-category-hot', // 热门分类
      all: 'pages-category-all', // 所有分类
    },
    // 首页
    home: {
      ads: 'pages-home-ads', // 轮播广告
      hotCategories: 'pages-home-hot-categories', // 热门考试
      vipCourses: 'pages-home-vip-courses', // vip课程
      freeCourses: 'pages-home-free-coures', // 免费课程
      exams: 'pages-home-exams', // 在线题库
      news: 'pages-home-news', // 最新资讯
    },
    // 学习页
    study: {
      majors: 'pages-study-majors', // 已报名分类
      lastCourse: 'pages-study-last-course', // 视频观看历史
      lastPaper: 'pages-study-last-paper', // 答题历史
      latestCourses: 'pages-study-major-{0}-latest-courses', // 最新课程
      latestPapers: 'pages-study-major-{0}-latest-papers', // 最新试题
    },
    // 我的页面
    user: {
      profile: 'pages-user-profile', // 用户信息
      buyedCourses: 'pages-user-buyed-courses', // 已购课程
      buyedExams: 'pages-user-buyed-exams', // 已购题库
      courseRecords: 'pages-user-course-records', // 观看记录
      orders: 'pages-user-orders', // 我的订单
    },
    // 消息页
    message: {
      list: 'pages-message-list', // 消息列表
    }
  },
  // 课程信息
  courses: {
    cacheKeys: 'courses-cache-keys', // 缓存的键

    detail: 'courses-{0}-detail', // 课程信息
    chapters: 'courses-{0}-chapters', // 课程目录
  },
  // 题库信息
  exams: {
    cacheKeys: 'exams-cache-keys', // 缓存的键

    pcats: 'exams-{0}-pcats', // 题库顶层分类
    papers: 'exams-{0}-pcat-{1}-papers', // 试卷列表
  }
}

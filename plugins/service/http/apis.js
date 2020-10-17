export default {
  'admin-auth': {
    uri: 'v4/admin/auth',
    auth: false
  },
  'mail.view': {
    uri: 'v4/mails/:id',
    auth: 'required'
  },
  'element-mail-list': {
    uri: 'v4/mails',
    auth: 'required'
  },
  'mails-check': {
    uri: 'v4/mails/check',
    auth: 'required'
  },
  'captcha-generator': {
    uri: 'v4/captcha/generator',
    auth: false
  },
  'captcha-validator': {
    uri: 'v4/captcha/validator',
    auth: false
  },
  'auth': {
    uri: 'v4/auth',
    auth: false
  },
  'check': {
    uri: 'v4/check',
    auth: false
  },
  'reg': {
    uri: 'v4/reg',
    auth: false
  },
  'wxreg': {
    uri: 'v4/wxreg',
    auth: false
  },
  'wechat.oauth2': {
    uri: 'v4/wechat/oauth2',
    auth: false
  },
  'tool.sms-sender': {
    uri: 'v4/tool/sms-sender',
    auth: false
  },
  'tool.tts-sender': {
    uri: 'v4/tool/tts-sender',
    auth: false
  },
  'user.pass-change': {
    uri: 'v4/user/pass-change',
    auth: false
  },
  'create-auth': {
    uri: 'v4/users/:id/create-auth',
    auth: 'required'
  },
  // 用户注销
  'log-off': {
    uri: 'v4/users/:id/log-off',
    auth: 'required'
  },
  // 优惠券
  'user.coupons': {
    uri: 'v4/users/:id/coupons',
    auth: 'required'
  },
  // 文章
  'article-category': {
    uri: 'v4/article-categories',
    auth: false
  },
  // 订单
  'online-account.appid': {
    uri: 'v4/online-accounts/appid',
    auth: 'required'
  },
  'user-contract.payment': {
    uri: 'v4/user-contracts/:id/payment',
    auth: 'required'
  },
  'user.contracts': {
    uri: 'v4/users/:id/contracts',
    auth: 'required'
  },
  'user-contracts.cancel': {
    uri: 'v4/user-contracts/:id/cancel',
    auth: 'required'
  },
  'user-order.view': {
    uri: 'v4/user-orders/:id',
    auth: 'required'
  },
  // 协议
  'user-contract.view': {
    uri: 'v4/user-contracts/:id',
    auth: 'required'
  },
  // 用户协议查询查看有多少已生效协议
  'user-contract.query': {
    uri: 'v4/users/:id/contracts',
    auth: 'required'
  },
  // 将协议变成已生效
  'user.enrollment': {
    uri: 'v4/users/:id/enrollment',
    auth: 'required'
  },
  // 用户设备是否需要验证
  'user.check-device': {
    uri: 'v4/users/:id/check-device',
    auth: 'required'
  },
  'user.ongoing-contract': {
    uri: 'v4/users/:id/ongoing-contract',
    auth: 'required'
  },
  // 我的题库
  'user.exams': {
    uri: 'v4/users/:id/exams',
    auth: 'required'
  },
  'user.exam.summary': {
    uri: 'v4/users/:id/exams/:exam_id/summary',
    auth: 'required'
  },
  'user.exam.favorite-tests': {
    uri: 'v4/users/:user_id/exams/:exam_id/favorite-tests',
    auth: 'required'
  },
  'user.exam.wrong-tests': {
    uri: 'v4/users/:user_id/exams/:exam_id/wrong-tests',
    auth: 'required'
  },
  'test.favs': {
    uri: 'v4/test-favs',
    auth: 'required'
  },
  'test-fav.batch': {
    uri: 'v4/test-favs/batch',
    auth: 'required'
  },
  'test-record.batch': {
    uri: 'v4/test-records/batch',
    auth: 'required'
  },
  'test-record.index': {
    uri: 'v4/test-records',
    auth: 'required'
  },
  'test-record.view': {
    uri: 'v4/test-records/:id',
    auth: 'required'
  },
  // 题库
  'exam.index': {
    uri: 'v4/exams',
    auth: false
  },
  'exam.tests': {
    uri: 'v4/exams/:id/tests',
    auth: 'required'
  },
  'tests': {
    uri: 'v4/tests',
    auth: false
  },
  'exam.papers': {
    uri: 'v4/exams/:id/papers',
    auth: false
  },
  'exam.paper-categories': {
    uri: 'v4/exams/:id/paper-categories',
    auth: false
  },
  'paper.tests': {
    uri: 'v4/papers/:id/tests',
    auth: 'required'
  },
  'paper-category.papers': {
    uri: 'v4/paper-categories/:id/papers',
    auth: false
  },
  'paper-records': {
    uri: 'v4/paper-records',
    auth: 'required'
  },
  // 纠错功能
  'correct': {
    uri: 'v4/tests/:id/correction',
    auth: 'required'
  },
  // 可查询用户信息&&更新用户信息
  'user.view': {
    uri: 'v4/users/:id',
    auth: 'required'
  },
  'user.auths': {
    uri: 'v4/users/:id/auths',
    auth: 'required'
  },
  'user.change-auth': {
    uri: 'v4/users/:id/change-auth',
    auth: 'required'
  },
  // 用户购买学币接口
  'user.gold-orders': {
    uri: 'v4/gold-orders',
    auth: 'required'
  },
  // 短信验证
  'tool.captcha-validator': {
    uri: 'v4/tool/captcha-validator',
    auth: 'false'
  },
  // 分类
  'category.index': {
    uri: 'v4/categories',
    auth: false
  },
  'category.view': {
    uri: 'v4/categories/:id',
    auth: false
  },
  'major-subject.index': {
    uri: 'v4/major-subjects',
    auth: false
  },
  // 观看历史
  'course-records': {
    uri: 'v4/users/:id/course-records',
    auth: 'required'
  },
  'course-records.batch': {
    uri: 'v4/course-records/batch',
    auth: 'required'
  },
  'course-section.record': {
    uri: 'v4/course-sections/:id/record',
    auth: 'required'
  },
  // 更新观看历史记录
  'course-section.watch': {
    uri: 'v4/course-sections/:id/watch',
    auth: 'required'
  },
  'course.view': {
    uri: 'v4/courses/:id',
    auth: 'optional'
  },
  'course-section.coursewares': {
    uri: 'v4/course-sections/:id/coursewares',
    auth: 'required'
  },
  'course.chapters': {
    uri: 'v4/courses/:id/chapters',
    auth: 'optional'
  },
  'video.view': {
    uri: 'v4/videos/:id',
    auth: 'optional'
  },
  // 反馈接口
  'advice': {
    uri: 'v4/advices',
    auth: 'required'
  },
  'userphone': {
    uri: 'v4/wechat/userphone',
    auth: false
  },
  'merge-account': {
    uri: 'v4/uni-app/merge-account',
    auth: false
  },
  'uniapp-reg': {
    uri: 'v4/uni-app/reg',
    auth: false
  },
  'uniapp-auth': {
    uri: 'v4/uni-app/auth',
    auth: false
  },
  'sessionkey': {
    uri: 'v4/wechat/sessionkey',
    auth: false
  },
  // 我的课程
  'user.course-majors': {
    uri: 'v4/users/:id/course-majors',
    auth: 'required'
  },
  // 我的消息接口
  'user.messages': {
    uri: 'v4/users/:id/messages',
    auth: 'required'
  },
  // 单个消息更新接口
  'messages.update': {
    uri: 'v4/users/:id/messages/:mid',
    auth: 'required'
  },
  // 所有消息更新接口
  'messages.updateAll': {
    uri: 'v4/users/:id/messages',
    auth: 'required'
  },
  // 首页 学习记录
  'user.last-paper': {
    uri: 'v4/users/:id/last-paper',
    auth: 'required'
  },
  'user.last-course': {
    uri: 'v4/users/:id/last-course',
    auth: 'required'
  },
  // 首页资讯
  'article': {
    uri: 'v4/articles',
    auth: false
  },
  // 查询单个资讯
  'article.view': {
    uri: 'v4/articles/:id',
    auth: false
  },
  'ad.index': {
    uri: 'v4/ads'
  },
  // 首页直播
  'live-courses.latest': {
    uri: 'v4/live-courses/latest',
    auth: false
  },
  // 视频
  'course.index': {
    uri: 'v4/courses',
    auth: false
  },
  'grades': {
    uri: 'v4/grades',
    auth: false
  },
  'document.index': {
    uri: 'v4/documents',
    auth: 'optional'
  },
  'document.update': {
    uri: 'v4/documents/:id',
    auth: 'required'
  },
  'test.view': {
    uri: 'v4/tests/:id',
    auth: 'required'
  },
  // 更新答题记录
  'test.answer': {
    uri: 'v4/tests/:id/answer',
    auth: 'required'
  },
  // 批量更新答题记录
  'tests.batch.answer': {
    uri: 'v4/tests/batch',
    auth: 'required'
  },
  // 答题统计接口
  'user.papers.record': {
    uri: 'v4/users/:id/papers/:paper_id/record',
    auth: 'required'
  },
  // 消息通知列表
  'user.notify-settings': {
    uri: 'v4/users/:id/notify-settings',
    auth: 'required'
  },
  'notify-settings': {
    uri: 'v4/notify-settings/:id',
    auth: 'required'
  },
  // 设备设置接口
  'user.device': {
    uri: 'v4/users/:id/device',
    auth: 'required'
  },
  'app-release': {
    uri: 'v4/app/release',
    auth: false
  },
  'worksheet': {
    uri: 'v4/worksheets',
    auth: 'required'
  },
  'crm-contracts': {
    uri: 'v4/campuses/:id/contracts',
    auth: 'required'
  },
  'records-summary': {
    uri: 'v4/sale-records/summary',
    auth: 'required'
  },
  // 公司荣耀列表
  'honours': {
    uri: 'v4/honours',
    auth: false
  },
  // 查询部门列表
  'element-depts.view': {
    uri: 'v4/depts',
    auth: 'required'
  },
  // 查询分校所属员工
  'element-employees.view': {
    uri: 'v4/employees',
    auth: 'required'
  },
  // 查询微信/QQ列表
  'element-weixins.view': {
    uri: 'v4/weixins',
    auth: 'required'
  },
  'campuses': {
    uri: 'v4/campuses',
    auth: false
  },
  'campuses.view': {
    uri: 'v4/campuses/:id',
    auth: false
  },
  'companies': {
    uri: 'v4/companies',
    auth: false
  },
  'teacher': {
    uri: 'v4/lecturers',
    auth: false
  }
}

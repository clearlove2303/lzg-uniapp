<template>
	<view class="study-page">
    <view class="status-bar"></view>
    <view class="nav">
      <scroll-view scroll-x="true" class="nav-scroller">
        <view
          :class="['nav-title', major.id === item.id ? 'active' : '']"
          v-for="(item, index) in majors"
          :key="index"
          @click="checkedNav(index)">
          <text>{{ item.name }}</text>
          <text class="active-line" v-if="major.id === item.id"></text>
        </view>
      </scroll-view>
      <!--  #ifdef  APP-PLUS -->
      <text class="iconfont icon-zaixiankefu" @click="jumpPage('kefu')"></text>
      <!--  #endif -->
    </view>
    <!-- 题库、视频、重点、资讯 -->
    <view class="study" v-if="majors && majors.length > 0">
      <view class="study-classifies">
        <view
          v-for="(item, index) in studyClassifies"
          :key="index"
          class="study-classifies-cell"
          @click="jumpPage(item.pageUrl)">
          <!--  #ifdef  MP-WEIXIN -->
          <image :src="item.imgUrl" mode="aspectFill" class="classifies-cell-img"></image>
          <!--  #endif -->
          <!--  #ifdef  APP-PLUS -->
          <cache-image :imgUrl="item.imgUrl" imgMode="aspectFill" class="classifies-cell-img"></cache-image>
          <!--  #endif -->
          <text class="classifies-cell-text">{{ item.text }}</text>
        </view>
      </view>
      <!-- 今日直播 -->
      <view class="common-box" v-if="latestLiveCourse">
        <text class="section-title">今日直播</text>
        <view class="toady-live" @click="jumpPage(LiveUrl)">
          <!--  #ifdef  MP-WEIXIN -->
          <image
            :src="latestLiveCourse.cover ? latestLiveCourse.cover.url : ''"
            :class="['live-img', latestLiveCourse.cover ? '' : 'section-img-none']"
            mode="scaleToFill"></image>
          <!--  #endif -->
          <!--  #ifdef  APP-PLUS -->
          <cache-image
            :imgUrl="latestLiveCourse.cover ? latestLiveCourse.cover.url : ''"
            :class="['live-img', latestLiveCourse.cover ? '' : 'section-img-none']"
            imgMode="scaleToFill"></cache-image>
          <!--  #endif -->
          <text class="live-title">{{ latestLiveCourse.course_title }}</text>
          <view class="live-message">
            <view class="live-teacher" v-if="latestLiveCourse.teacher">
              <text class="live-teacher-text">主讲人：</text>
              <text class="live-teacher-text teacher">{{ latestLiveCourse.teacher }}</text>
            </view>
            <view class="live-time">
              <text class="iconfont icon-shijian"></text>
              <text class="live-data">{{ latestLiveCourse.live_date | formatTime('mm月dd日 HH:MM') }}</text>
            </view>
          </view>
        </view>
      </view>
      <!-- 学习记录 -->
      <view class="common-box" v-if="lastPaper || lastCourse">
        <text class="section-title">学习记录</text>
        <view class="study-records">
          <view class="tiku-record course-record" v-if="lastCourse" @click="jumpPage('lastCourse')">
            <view class="records-text">
              <text class="records-title">{{ lastCourse.course_title }}</text>
              <view class="percent-goon">
                <view class="percent-box">
                  <view class="percent">
                    <progress
                      :percent="lastCourse.percent"
                      activeColor='#f5c354'
                      backgroundColor="#cccccc"
                      border-radius='10'
                      class="percent-progress"/>
                    <text class="percent-value">已学习：&nbsp;{{ lastCourse.percent }}%</text>
                  </view>
                  <view class="percent-value mgt12">
                    <text class="gray-bg">{{ lastCourse.category_name }}</text>
                    <text class="mgl32">{{ lastCourse.hours }}节课<text class="line">|</text>{{ lastCourse.hits }}人学习</text>
                  </view>
                </view>
                <text class="btn-goon mgt20">继续学习</text>
              </view>
            </view>
          </view>
          <view class="tiku-record" v-if="lastPaper" @click="jumpPage('lastTest')">
            <view class="records-text">
              <text class="records-title">{{ lastPaper.paper_title }}</text>
              <view class="percent-goon">
                <view class="percent">
                  <progress
                    :percent="lastPaper.percent"
                    activeColor="#f5c354"
                    backgroundColor="#cccccc"
                    border-radius='10'
                    class="percent-progress" />
                  <text class="percent-value">已学习：&nbsp;{{ lastPaper.percent }}%</text>
                </view>
                <text class="btn-goon">继续学习</text>
              </view>
            </view>
          </view>
        </view>
      </view>
      <!-- 最新课程 -->
      <view class="common-box" v-if="latestCourses">
        <text class="section-title">最新课程</text>
        <view class="course-content">
          <view
            class="couse-box"
            v-for="(item, index) in latestCourses"
            :key="index"
            @click="watchCourse(item.id)">
            <!--  #ifdef  MP-WEIXIN -->
            <image
              class="course-image"
              mode="scaleToFill"
              :src="item.cover != null ? item.cover.url : ''"
              :class="item.cover && item.cover.url ? '' : 'section-img-none'"></image>
            <!--  #endif -->
            <!--  #ifdef  APP-PLUS -->
            <cache-image
              class="course-image"
              imgMode="scaleToFill"
              :imgUrl="item.cover != null ? item.cover.url : ''"
              :class="item.cover && item.cover.url ? '' : 'section-img-none'"></cache-image>
            <!--  #endif -->
            <text class="course-title">{{ item.year ? item.year : ''}}{{  item.title }}</text>
            <view class="course-tip">
              <text class="course-tip-left">最新</text>
              <view class="course-tip-right">
                <text class="iconfont icon-keshi"></text>
                <text class="course-tip-course">{{ item.hours }}课时</text>
              </view>
            </view>
          </view>
        </view>
      </view>
      <!-- 最新试题 -->
      <view class="common-box" v-if="latestPapers">
        <text class="section-title">最新试题</text>
        <view class="paper-content">
          <view
            class="paper-box"
            v-for="(item, index) in latestPapers"
            :key="index"
            @click="goTest(item)">
            <view class="paper-title">{{ item.title }}</view>
            <view  class="paper-desp">
              <view class="paper-desp-text">
                <text class="yellow-text">{{ item.paper_category }}</text>
                <text class="gray-text">共{{ item.count }}题</text>
              </view>
              <button>开始答题</button>
            </view>
          </view>
        </view>
      </view>
      <!-- 底部 -->
      <view class="ending">
        <text class="ending-line"></text>
        <text class="ending-text">我到底了</text>
        <text class="ending-line"></text>
      </view>
    </view>
    <view v-else class="detail">
      <!--  #ifdef  MP-WEIXIN -->
      <image :src="`${cdn}img-no-buyed.png`" class="no-buyed-img"></image>
      <!--  #endif -->
      <!--  #ifdef  APP-PLUS -->
      <cache-image :imgUrl="`${cdn}img-no-buyed.png`" class="no-buyed-img"></cache-image>
      <!--  #endif -->
      <!-- #ifndef  APP-PLUS -->
      <text class="no-buyed-text">暂未购买课程，请联系您的专属招生老师购买</text>
      <!-- #endif -->

      <!-- #ifdef  APP-PLUS -->
      <text class="no-buyed-text" v-if="systemInfo.platform === 'ios'">暂未购买课程</text>
      <text class="no-buyed-text" v-else>暂未购买课程，请联系您的专属招生老师购买</text>
      <!-- #endif -->
    </view>
    <modal
      :show="dialogShow"
      :confirmText="modalConfirmText"
      title= "提示"
      :text= "modalText"
      :textShow= "true"
      @confirm="modalConfig(modeType)"></modal>
    <modal :show="isShow" title='400-118-6070' @cancel='cancel' :noCancel="true" @confirm='confirm' confirmText='呼叫' />
    <!-- #ifdef  APP-PLUS -->
    <first-mask :showMask="showMask" :maskTitle="maskTitle" @changeMask="changeMask"></first-mask>
    <!-- #endif -->
  </view>
</template>

<script>
import services from '@/common/service-loader';
import cacheKeys from '@/plugins/cache/keys.js';
import { mapState } from 'vuex';
import modal from '@/components/custom/modal.vue';
import "@/plugins/decodeUrl/index";
// #ifdef  APP-PLUS
import cacheImage from "@/components/media/cache-image"
import firstMask from '@/components/custom/first-mask.vue';
//  #endif

const ONSALE = 1;
const LATEST = 1;
const PER_PAGE = 4;
const TYPE_REQUEST = 0;
const STATICURL = getApp().globalData.CDN;
const H5Url = getApp().globalData.H5Url;

let user;
let categoryId;
let tel;
let hasContract;
let contractItem;

	export default {
    // #ifdef  MP-WEIXIN
    components: { modal },
    // #endif
    // #ifdef  APP-PLUS
    components: { modal, firstMask, cacheImage },
    // #endif
		data() {
			return {
        major: {
          id: null,
          name: '',
          category_id: null,
        },
        examId: null,
        latestCourses: [],
        studyClassifies: [
          {'imgUrl': `${STATICURL}img-tiku.png`, 'pageUrl': 'tiku', 'text': '题库'},
          {'imgUrl': `${STATICURL}img-video.png`, 'pageUrl': 'video', 'text': '视频'},
          {'imgUrl': `${STATICURL}img-zhongdian.png`, 'pageUrl': 'document', 'text': '重点'},
          {'imgUrl': `${STATICURL}img-zixun.png`, 'pageUrl': 'news', 'text': '资讯'}
        ],
        cdn: STATICURL,
        latestLiveCourse: false,
        lastPaper: null,
        lastCourse: null,
        isShow: false,
        LiveUrl: '',
        dialogShow: false,
        latestPapers: null,
        majors: [],
        subjects: null,
        modalConfirmText: '前往确认',
        modalText: '为了您的正常的学习，请确认您报考的科目',
        modeType: null,
        // #ifdef  APP-PLUS
        systemInfo: {},
        showMask: false,
        maskTitle: '这里展示已经报名的考试，点击可以切换',
        // #endif
			}
    },

    computed: mapState(['hasLogin']),

    onTabItemTap() {
      if (!this.hasLogin) {
        this.goLogin();
        return;
      }
    },

    watch: {
      examId(newValue) {
        // issue #3669
        if (!newValue) {
          return;
        }
        this.getLatestPaper(newValue);
      },
    },

    onShow() {
      user = this.$jwt.user();
      if (!user) {
        return;
      }
      this.majors = [];
      this.lastCourse = null;
      this.latestCourses = null;
      this.latestPapers = null;
      // #ifdef APP-PLUS
      const hasContract = uni.getStorageSync('hasContract');
      const enrollShowed = uni.getStorageSync('enrollShowed');
      if (this.hasLogin && hasContract === false && !enrollShowed) {
        uni.setStorageSync('enrollShowed', true);
        this.modeType = 'enroll';
        this.dialogShow = true;
        uni.hideTabBar();
        return;
      }
      // #endif
      this.getCourseMajors(user.id);
      this.updateMessage(user.id);
      this.getLastPaper(user.id);
      this.getLastCourse(user.id);
      // issue #3121 检查如果没有签名则跳到签名页面
      let allSigned = true; // 签名提示框比首次指示提示框优先
      services('contract').queryByUser(user.id).then((res) => {
        if (res.data.total_count == 0) {
          return;
        }
        for (let item of res.data.items) {
          // issue #3145
          if (item.is_signed === 0 && item.status == 4) {
            allSigned = false;
            this.modalConfirmText = '前往激活';
            this.modalText= `《${item.title}》未激活，激活后方可学习`;
            this.modeType = 'sign';
            this.dialogShow = true;
            contractItem = item;
            uni.hideTabBar();
            break;
          }
        }
        // #ifdef APP-PLUS
        if (allSigned) {
          this.firstGuide();
        }
        // #endif
      })
    },

    onUnload() {
      uni.$off('getTiku', this.getTiku);
      uni.$off('logout', this.logout);
    },

    onLoad() {
      uni.$on('getTiku', this.getTiku);
      uni.$on('logout', this.logout);
      // #ifdef APP-PLUS
      this.hasUpdate = uni.getStorageSync('hasUpdate');
      uni.getSystemInfo({
        success: (res) => {
          this.systemInfo = res;
        }
      })
      // #endif
    },

		methods: {
      logout() {
        this.majors = [];
      },
      // #ifdef APP-PLUS
      firstGuide() {
        // issue #2973
        let firstActive;
        firstActive = uni.getStorageSync('first-active');
        if (firstActive == '') {
          firstActive = Object.assign({}, {study: 0});
        }
        if (!firstActive.study || firstActive.study != 1) {
          uni.hideTabBar();
          this.showMask = true;
          firstActive = Object.assign(firstActive, {study: 1});
          uni.setStorageSync('first-active', firstActive);
        }
      },
      // #endif

      getTiku(data) {
        this.examId = data.id;
        if (!this.examId) {
          this.getExams();
        } 
      },

      modalConfig(modeType) {
        this.dialogShow = false;
        uni.showTabBar();
        if (modeType == 'enroll') {
          this.$loc.open(`user/enroll`);
        }
        if (modeType == 'sign') {
          this.$loc.open(`out/out?url=${encodeURIComponent(`${H5Url}contract/sign.html?id=${contractItem.id}&token=${user.token}&source=uniapp`)}`);
        }
      },

      updateMessage(userId) {
        let lastMessageTime;
        try {
          lastMessageTime = uni.getStorageSync('lastMessageTime');
        } catch(e) {
          console.log(e);
        }
        services('message').queryByUser(userId).then((res) => {
          if (res.data.total_count <= 0) {
            return;
          }

          if (lastMessageTime == '') {
            uni.showTabBarRedDot({
              index: 2,
            })

            try {
              uni.setStorageSync('lastMessageTime', res.data.items[0].created_at);
            } catch (e) {
              console.log(e);
            }
            return;
          }

          if (lastMessageTime != res.data.items[0].created_at) {
            uni.showTabBarRedDot({
              index: 2,
            })

            try {
              uni.setStorageSync('lastMessageTime', res.data.items[0].created_at);
            } catch (e) {
              console.log(e);
            }
          }

        })
      },

      // 获取题库分类
      async getExams() {
        try {
          const res = await services('exam').query(user.id, {"major_id": this.major.id});

          if (res.data.error_code && res.data.error_code != 'SUCCESS') {
            return;
          }

          if (res.data.items.length >=1 ) {
            this.examId = res.data.items[0].id;
            return;
          }

        } catch(e) {
          console.error(e);
        }
      },

      // 获取最新试卷
      getLatestPaper(id) {
        this.loadCacheData(
          {
            key: cacheKeys.pages.study.latestPapers,
            params: [this.major.id],
            beforeCache: this.beforeLatestPapersCache
          },
          services('paper').queryByExam(id, 'pcat,testCount'), 
          'latestPapers',
        );
      },

      beforeLatestPapersCache(data) {
        this.latestPapers = null;
        if (data.total_count == 0) {
          return;
        }
        this.latestPapers = data.items.slice(0, 3);
        return this.latestPapers;
      },

      getCourseMajors(id) {
        this.loadCacheData(
          {
            key: cacheKeys.pages.study.majors,
            afterLoad: this.afterMajorsLoad,
            beforeCache: this.beforeMajorsCache
          },
          services('category').queryCourseMajorsByUser(id), 
          'majors',
        ).then(res => {
          if (res.data.error_code) {
            return;
          }
          this.afterMajorsLoad(res.data);
        })
      },

      afterMajorsLoad(majors) {
        if (!majors) {
          this.majors = [];
        }
        this.getTabTitles();
        if (majors) { // 有购买的科目才进行遍历
          majors.forEach((item, index) => {
            if (item.name === this.major.name) {
              this.subjects = item.subjects;
              this.examId = uni.getStorageSync('tiku').id;
              if (!this.examId) {
                this.getExams();
              } 
              this.getNewCourse();
              // 获取今日直播
              this.getLatestLiveCourse();
            }
          })
        }
      },

      beforeMajorsCache(data) {
        if (data.error_code) {
          this.major = uni.getStorageSync('current-major');
          return;
        }
        return data;
      },

      // 获取导航栏科目
      getTabTitles() {
        // 若有选中的分类，则显示分类
        this.major = uni.getStorageSync('study-major');
        if (this.major == '') {
          this.major = this.majors[0];
        } else {
          const option = this.majors.find(item => item.id === this.major.id);
          if (!option) {
            this.major = this.majors[0];
            return;           
          }
          this.major = option;
        }
        uni.setStorageSync('study-major', this.major);
      },

      // 切换导航
      checkedNav(index) {
        uni.removeStorageSync('tiku');
        this.major = this.majors[index];
        if (this.majors) { // 有购买的科目才进行遍历
          this.majors.forEach((item, index) => {
            if (item.name === this.major.name) {
              this.subjects = item.subjects;
              this.examId = uni.getStorageSync('tiku').id;
              if (!this.examId) {
                this.getExams();
              } 
              this.getNewCourse();
              // 获取今日直播
              this.getLatestLiveCourse();
            }
          })
        }
        // 更新用户cid信息
        if (user.id) {
          this.patchUserCid(this.major.category_id);
          // 获取答题记录
          this.getLastPaper(user.id);
          this.getLastCourse(user.id);

        }

        // 获取今日直播
        this.getLatestLiveCourse();

        uni.setStorageSync('study-major', this.major);
      },

      // 更新用户cid信息
      patchUserCid(categoryId) {
        if (!categoryId) {
          return;
        }
        services('user').update(user.id, {categoryId});
      },

      // 获取直播内容
      getLatestLiveCourse() {
        let subjectIds = [];
        for (let i in this.subjects) {
          subjectIds[i] = this.subjects[i].id;
        };
        const data = {
          subject_id: subjectIds.join(),
        }
        services('live').getBy(data).then((res) => {
          if (res.data.error_code && res.data.error_code != 'SUCCESS') {
            this.latestLiveCourse = false;
            return;
          }
          this.latestLiveCourse = res.data;
          this.LiveUrl = `${H5Url}course/view.html?id=${this.latestLiveCourse.course_id}&token=${user.token}`;
        })
      },

      getNewCourse() {
        let subjectIds = [];
        for (let i in this.subjects) {
          subjectIds[i] = this.subjects[i].id;
        };
        let condition = {
          is_latest: LATEST,
          subject_id: subjectIds.join(),
          per_page: PER_PAGE,
          expand: 'cover'
        }
        this.loadCacheData(
          {
            key: cacheKeys.pages.study.latestCourses,
            params: [this.major.id],
            beforeCache: this.beforeLatestCoursesCache
          },
          services('course').query(condition), 
          'latestCourses',
        );
      },

      beforeLatestCoursesCache(data) {
        if (data.total_count == 0) {
          this.latestCourses = false;
          return;
        }
        return data.items;
      },

      watchCourse(id) {
        this.$loc.open(`course/view?id=${id}`);
      },

      // 获取答题记录
      getLastPaper(userId) {
        this.loadCacheData(
          {
            key: cacheKeys.pages.study.lastPaper,
            beforeCache: this.beforeLastPaperCache
          },
          services('test-record').getLastPaper(userId), 
          'lastPaper',
        );
      },

      beforeLastPaperCache(data) {
        if (data.error_code) {
          return;
        }
        return data;
      },

      // 获取视频观看记录
      getLastCourse(userId) {
        this.loadCacheData(
          {
            key: cacheKeys.pages.study.lastCourse,
            beforeCache: this.beforeLastCourseCache
          },
          services('course-record').getLastCourse(userId), 
          'lastCourse',
        );
      },

      beforeLastCourseCache(data) {
        if (data.error_code) {
          return;
        }
        return data;
      },

      cancel() {
        this.isShow = false;
      },

      confirm() {
        uni.makePhoneCall({
          phoneNumber: this.tel
        });
      },

      goTest(paper) {
        this.$loc.open(`tiku/paper?exam_id=${this.examId}&id=${paper.id}&paper_title=${paper.title}`);
      },

      jumpPage(pageUrl) {
        if (pageUrl === "news") {
          this.$loc.open(`news/index?category_id=${this.major.category_id}`);
          return;
        }
        if (pageUrl === "video") {
          this.$loc.open(`course/courselist?major_id=${this.major.id}&url=study`);
          return;
        }
        if (pageUrl === "tiku") {
          this.$loc.open(`tiku/index?major_id=${this.major.id}`);
          return;
        }
        if (pageUrl === "document") {
          this.$loc.open(`document/index`);
          return;
        }
        if (pageUrl === 'lastTest') {
          this.$loc.open(`tiku/paper?exam_id=${this.major.id}&id=${this.lastPaper.paper_id}&paper_title=${this.lastPaper.paper_title}&test_order=${this.lastPaper.test_order}`);
          return;
        }
        if (pageUrl === 'lastCourse') {
          this.$loc.open(`course/view?id=${this.lastCourse.course_id}&sid=${this.lastCourse.section_id}`);
          return;
        }
        if (pageUrl == 'kefu') {
          this.$loc.open(`user/kefu`);
          return;
        }
        this.$loc.open(`out/out?url=${encodeURIComponent(pageUrl)}`);
      },

      changeMask() {
        this.showMask = false;
        uni.showTabBar();
      }
    }
	}
</script>

<style scoped>
.study-page {
  position: relative;
}

.status-bar {
  position: fixed;
  top: 0;
  left: 0;
  height: var(--status-bar-height);
  width: 100%;
  background: #ffffff;
  z-index: 99;
}

.nav {
  display: flex;
  flex-direction: row;
  align-items: center;
  position: fixed;
  top: var(--status-bar-height);
  padding-left: 10px;
  width: 750rpx;
  height: 44px;
  background: #fff;
  box-shadow: 0px 2px 5px 0px rgba(128, 125, 125, 0.08);
  z-index: 99;
}

.nav-scroller {
  white-space: nowrap;
  padding-left: 20rpx;
  /* #ifdef  MP-WEIXIN */
  width: 530rpx;
  /* #endif */
  /* #ifdef  APP-PLUS */
  width: 600rpx;
  /* #endif */
  height: 44px;
}

.nav-title {
  display: inline-block;
  white-space: nowrap;
  padding-left: 5px;
  padding-right: 5px;
  height: 44px;
  font-size: 15px;
  color: #333;
  line-height: 44px;
}

.active {
  font-size: 18px;
}

.active-line {
  display: block;
  margin: -10rpx auto;
  width: 49rpx;
  height: 6rpx;
  background: #333;
  border-radius: 3rpx;
}

.icon-zaixiankefu {
  position: absolute;
  display: inline-block;
  color: #008cff;
  font-size: 36rpx;
  right: 52rpx;
}

.icon-biaoqian2 {
  font-size: 28rpx;
  color: #666;
}

.advertisement,
swiper,
.banner {
  width: 750rpx;
  height: 380rpx;
}

.study-classifies {
  margin: calc(var(--status-bar-height) + 44px - 2rpx) auto 37rpx;
  width: 747rpx;
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 40rpx 50rpx 35rpx;
  box-sizing: border-box;
  border-bottom: 9rpx solid #f8f8f8;
}

.study-classifies-cell {
  align-items: center;
}

.live-img {
  width: 641rpx;
  height: 299rpx;
  background-size: cover;
  display: inline-block;
  overflow: hidden;
  border: 1px solid #e5e5e5;
  box-sizing: border-box;
}

.classifies-cell-img {
  display: block;
  width: 120rpx;
  height: 120rpx;
}

.classifies-cell-text {
  display: block;
  margin-top: 31rpx;
  text-align: center;
  font-size: 30rpx;
  color: #333;
}

.section-title {
  display: block;
  margin-bottom: 20rpx;
  padding-left: 35rpx;
  font-size: 38rpx;
  color: #000;
  font-weight: 700;
}

.toady-live {
  margin: 36rpx auto 49rpx;
  width: 682rpx;
  height: 438rpx;
  padding: 21rpx 19rpx 27rpx 20rpx;
  box-shadow: 0rpx 7rpx 24rpx 0rpx rgba(242, 236, 229, 0.76);
  border-radius: 7rpx;
  box-sizing: border-box;
}

.live-title {
  margin-top: 21rpx;
  height: 28rpx;
  line-height: 28rpx;
  font-weight: 500;
  font-size: 28rpx;
  color: #000;
}

.live-message {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 27rpx;
  line-height: 27rpx;
  margin-top: 9rpx;
}

.live-teacher-text {
  font-size: 22rpx;
  color: #666;
}

.icon-shijian {
  padding-right: 12rpx;
  font-size: 27rpx;
  color: #666;
}

.live-data {
  font-size: 22rpx;
  color: #c00909;
}

.tiku-record {
  display: flex;
  margin: 33rpx auto 0;
  padding: 39rpx 26rpx 32rpx 22rpx;
  width: 682rpx;
  height: 183rpx;
  box-shadow: 0 7rpx 24rpx 0 rgba(242, 236, 229, 0.76);
  border-radius: 7rpx;
  box-sizing: border-box;
}

.tiku-record:nth-child(2) {
  margin-top: 30rpx;
  margin-bottom: 59rpx;
}

.course-record {
  padding-bottom: 0;
}

.course-content {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  margin: 36rpx auto 29rpx;
  width: 668rpx;
}

.couse-box {
  margin-bottom: 30rpx;
  width: 319rpx;
  height: 263rpx;
}

.course-image {
  display: block;
  margin-bottom: 20rpx;
  width: 319rpx;
  height: 181rpx;
}

.course-title {
  display: block;
  margin-bottom: 12rpx;
  line-height: 28rpx;
  font-size: 28rpx;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.course-tip {
  display: flex;
  justify-content: space-between;
}

.course-tip-left {
  font-size: 24rpx;
  color: #e72a19;
}

.course-tip-right {
  display: flex;
  height: 30rpx
}

.icon-keshi {
  margin-top: 4rpx;
  font-size: 24rpx;
  color: #999;
}

.course-tip-course {
  margin-left: 8rpx;
  font-size: 22rpx;
  color: #999;
}

.record-img {
  width: 220rpx;
  height: 160rpx;
}

.default-img {
  width: 220rpx;
  height: 160rpx;
  background-size: cover;
  background-image: url("http://cdn.laixue.com/mac/img-tiku-history.png");
}

.mgl32 {
  display: inline-block;
  margin-left: 32rpx;
}

.records-text {
  width: 682rpx;
}

.course-record .records-title {
  height: 36rpx;
}

.records-title {
  display: block;
  height: 58rpx;
  width: 600rpx;
  line-height: 31rpx;
  font-size: 30rpx;
  color: #333;
  font-weight: bold;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  box-sizing: border-box;
}

.percent-goon {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.gray-bg {
  display: inline-block;
  width: 117rpx;
  height: 35rpx;
  line-height: 35rpx;
  text-align: center;
  background: #eef0fd;
}

.study-records {
  margin-top: 33rpx;
}

.percent {
  display: flex;
  align-items: center;
  margin-right: 30rpx;
}

.percent-progress {
  margin-right: 15rpx;
  width: 180rpx;
}

.percent-value {
  font-size: 24rpx;
  color: #999;
  font-weight: bold;
}

.btn-goon {
  width: 160rpx;
  height: 55rpx;
  background: #0c8eff;
  border-radius: 28rpx;
  text-align: center;
  line-height: 55rpx;
  font-size: 26rpx;
  color: #fff;
}

.major-hits {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 32rpx;
}


.major-name {
  padding-left: 10rpx;
  font-size: 22rpx;
  color: #666;
}

.hits-text {
  font-size: 22rpx;
  color: #666;
}

.news-img {
  width: 166rpx;
  height: 118rpx;
}

.ending {
  display: flex;
  flex-direction: row;
  justify-content: center;
  margin-top: 78rpx;
  padding-bottom: 40rpx;
}

.ending-line {
  padding-top: 16rpx;
  width: 130rpx;
  height: 1rpx;
  border-bottom: 1rpx solid #e5e5e5;
}

.ending-text {
  padding-left: 30rpx;
  padding-right: 30rpx;
  font-size: 22rpx;
  color: #666;
}

.section-img-none {
  /* issue 2604 */
  background-size: 100% 100%;
  background-image: url("../../static/img/img-cover.jpg");
}

.detail {
  text-align: center;
  font-size: 34rpx;
  color: #999;
}

.no-buyed-img {
  /* #ifdef  APP-PLUS */
  margin: 309rpx auto 70rpx;
  /* #endif */
  /* #ifdef  MP-WEIXIN */
  margin: 159rpx auto 70rpx;
  /* #endif */
  display: block;
  width: 386rpx;
  height: 400rpx;
}

.paper-box {
  margin: 30rpx auto 0;
  width: 678rpx;
  height: 126rpx;
  border-bottom: 1px solid #e5e5e5;
}

.paper-box:nth-child(1) {
  margin-top: 0;
}

.paper-box:nth-child(3) {
  border: none;
}

.paper-content {
  margin-top: 33rpx;
}

.line {
  display: inline-block;
  margin: 0 19rpx;
}

.paper-title {
  width: 678rpx;
  font-size: 30rpx;
  color: #333;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.paper-desp {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20rpx;
  font-size: 24rpx;
}

.paper-desp-text {
  display: flex;
  align-items: center;
}

.yellow-text {
  display: inline-block;
  max-width: 140rpx;
  padding: 0 7rpx 0 10rpx;
  height: 32rpx;
  line-height: 32rpx;
  background: rgba(255, 161, 7, 0.1);
  color: #ffa107;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  box-sizing: border-box;
}

.mgt12 {
  margin-top: 12rpx;
}

.mgt20 {
  margin-top: 20rpx;
}

.gray-text {
  margin-left: 26rpx;
  color: #ccc;
}

button {
  padding: 0;
  margin: 0;
  width: 143rpx;
  height: 49rpx;
  line-height: 44rpx;
  font-size: 24rpx;
  color: #fff;
  background: linear-gradient(to right, #6cb1fb, #007aff);
  border-radius: 24rpx;
}

.study >>> .arrows {
  top: 130rpx;
  left: 40%;
}
/* #ifdef  APP-PLUS */
.major-list {
  top: calc(var(--status-bar-height) + 90rpx);
  width: 750rpx;
}

.major-cell {
  padding-left: 54rpx;
  width: 100%;
  height: 88rpx;
  line-height: 88rpx;
  box-sizing: border-box;
  border-bottom: 1rpx solid #efefef;
  background: #fafafa;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.major-title {
  font-size: 30rpx;
  color: #333;
}

.study-head {
  position: fixed;
  top: var(--status-bar-height);
  left: 0;
  background: #fff;
  z-index: 9;
}
/* #endif */
</style>
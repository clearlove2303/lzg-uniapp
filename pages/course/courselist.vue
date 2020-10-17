<template>
  <view class="course-list">
    <!--  #ifdef  APP-PLUS -->
    <view class="status-bar"></view> <!-- 这里是状态栏 -->
    <!--  #endif -->

    <!--  #ifdef  MP-WEIXIN -->
    <view class="nav" v-if="subjects.length > 1">
      <scroll-view scroll-x="true" class="nav-scroller">
        <text
          v-for="(item, index) in subjects"
          :key="index"
          :class="['nav-title', item.id == currentSubject.id ? 'active' : '']"
          @click="checkedNav(item, index)">{{ item.name }}</text>
      </scroll-view>
    </view>
    <!--  #endif -->

    <!-- app头部组件 -->
    <!-- #ifdef  APP-PLUS -->
    <view class="course-head">
      <fu-head :title="title">
        <template slot="left-icon">
          <btn-icon
          icon="icon-back1"
          @click="goBack"></btn-icon>
        </template>
        <template slot="right-icon">
          <btn-icon
          text="选科目"
          icon="icon-shaixuan1"
          @click="showDrawer('showRight')"
          ></btn-icon>
        </template>
      </fu-head>
    </view>
    <view @touchmove.stop.prevent="moveHandle">
      <uni-drawer ref="showRight" mode="right" >
        <view class="drawer-wrap">
          <scroll-view class="drawer-content" scroll-y="true">
            <view class="drawer-content-item" v-if="showYear">
              <view class="item-title">
                年份
              </view>
              <view class="item-list">
                <view
                  v-for="(item, index) in years" :key="index"
                  :class="['item-name', item.name == year.name ? 'item-name-active' : 'bg-default']"
                  @click.stop="setYear(item)">{{ item.name }}</view>
              </view>
            </view>
            <view class="drawer-content-item">
              <view class="item-title">
                科目
              </view>
              <view class="item-list">
                <view
                  v-for="(item, index) in subjects" :key="index"
                  :class="['item-name', item.id == subject.id ? 'item-name-active' : 'bg-default']"
                  @click.stop="setSubject(item)">{{ item.name }}</view>
              </view>
            </view>
            <view class="drawer-content-item" v-if="grades.length > 0">
              <view class="item-title">
                班次
              </view>
              <view class="item-list">
                <view v-for="(item, index) in grades" :key="index"
                  :class="['item-name', item.id == grade.id ? 'item-name-active' : 'bg-default']"
                  @click.stop="setGrade(item)">{{ item.name }}</view>
              </view>
            </view>
          </scroll-view>
          <view class="drawer-btn">
            <text class="drawer-btn-text confirm" @click="drawerConfirm('showRight')">确认</text>
            <text class="drawer-btn-text reset" @click="drawerReset">重置</text>
          </view>
        </view>
      </uni-drawer>
    </view>
    <!-- #endif -->

    <!-- #ifdef  APP-PLUS -->
    <view class="content" v-if="courseList.length > 0" :style="{ marginTop: statusBarHeight + 'px' }">
    <!-- #endif -->

    <!-- #ifdef  MP-WEIXIN -->
    <view :class="['content', subjects.length > 1 ? 'pdt80' : '']" v-if="courseList.length > 0">
    <!-- #endif -->
      <view class="view-item"
        v-for="(item, index) in courseList"
        :key="index" @tap="gopage(item.id)">
        <view class="course-box">
          <!-- #ifdef  MP-WEIXIN -->
          <image
            :src="item.cover != null ? item.cover.url : ''"
            mode="scaleToFill"
            class="section-img"
            :class="item.cover && item.cover.url ? '' : 'section-img-none'"></image>
          <!-- #endif -->
          <!-- #ifdef  APP-PLUS -->
          <cache-image
            :imgUrl="item.cover != null ? item.cover.url : ''"
            imgMode="scaleToFill"
            class="section-img"
            :class="item.cover && item.cover.url ? '' : 'section-img-none'"></cache-image>
          <!-- #endif -->
          <view class="course-content">
            <text class="course-title">{{ item.year ? item.year : ''}}{{ item.title }}</text>
            <text class="course-description">详细的考试内容讲解，完美备考</text>
            <view class="course-label">
              <view class="star-style">
                <text v-for="i in item.star" :key="i" class="iconfont icon-dafen02 "></text>
              </view>
              <text class="course-label-item hourse" v-if="item.hours == null">0课时</text>
              <text class="course-label-item hourse" v-else>{{ item.hours }}课时</text>
              <text class="course-label-item">{{ item.hits }}人学习</text>
            </view>
          </view>
        </view>
      </view>
      <uni-load-more :loadingType="loadingType" :contentText="contentText"></uni-load-more>
    </view>
    <view v-if="noCourse" class="no-course">
      <!-- #ifdef  MP-WEIXIN -->
      <image :src="noCourseImage | handleImgUrl('507', '345')" mode="scaleToFill" class="no-course-img"></image>
      <!-- #endif -->
      <!-- #ifdef  APP-PLUS -->
      <cache-image :imgUrl="noCourseImage | handleImgUrl('507', '345')" imgMode="scaleToFill" class="no-course-img"></cache-image>
      <!-- #endif -->
      <text class="no-course-text">当前考试暂无视频~</text>
    </view>
    <!-- #ifdef  APP-PLUS -->
      <first-mask :showMask="showMask" @changeMask="changeMask"></first-mask>
    <!-- #endif -->
  </view>
</template>
<script>
import services from '@/common/service-loader';
import uniLoadMore from '@/components/vendor/uni-load-more/uni-load-more.vue';
// #ifdef  APP-PLUS
import fuHead from "@/components/nav/fu-head.vue";
import btnIcon from "@/components/nav/btn-icon.vue";
import cacheImage from "@/components/media/cache-image.vue";
import uniDrawer from '@dcloudio/uni-ui/lib/uni-drawer/uni-drawer.vue';
import firstMask from "@/components/custom/first-mask.vue";
// #endif
const ONSAlE = 1;
const STATICURL = getApp().globalData.CDN;

let pageCount = null,
    page = 1,
    majorId = null, 
    user = null,
    filterCondition = '';

export default {
  // #ifdef  APP-PLUS
  components: { fuHead, btnIcon, uniLoadMore, firstMask, uniDrawer, cacheImage },
  // #endif

  // #ifdef  MP-WEIXIN
  components: { uniLoadMore },
  // #endif

  data() {
    return {
      title: '',
      courseList: [],
      loadingType: 0, // 定义加载方式 0---contentdown  1---contentrefresh 2---contentnomore
      contentText: {
        contentdown: '上拉显示更多',
        contentrefresh: '正在加载...',
        contentnomore: '没有更多数据了'
      },
      noCourse: false,
      noCourseImage: `${STATICURL}img-no-video.png`,
      subjects: [],
      subject: {},
      grades:[],
      grade: {},
      currentSubject: {
        id: null,
        name: '视频',
      },
      statusBarHeight: 0,
      // #ifdef  APP-PLUS
      showMask: false,
      // #endif
      showYear: false,
      years: [
        {name: '最新'},
        {name: '往年'}
      ],
      year: {},
      courseType: null,
    };
  },

  watch: {
    currentSubject(newValue) {
      page = 1;
      setTimeout(() => {
        this.showLoading();
        this.getCourses();
      }, 300);
      if (newValue.name == '全部') {
        this.title = '课程';
        this.setTitle('课程');
        return;
      }
      this.title = this.currentSubject.name;
      this.setTitle(this.currentSubject.name);    
    },

    courseType(newValue) {
      if (newValue == 'buyed') {
        this.showYear = true;
        this.year = this.years[0];
      }
    },

    courseList(newValue) {
      if (newValue && newValue.length > 0) {
        this.noCourse = false;
      } else {
        this.noCourse = true;
      }
    },
  },

  onLoad(option) {
    // #ifdef APP-PLUS
    // issue #2973
    let firstActive = uni.getStorageSync('first-active');
    if (!firstActive) {
      firstActive = Object.assign({}, {course: 0});
    }

    if (!firstActive.course || firstActive.course != 1) {
      this.showMask = true;
      firstActive = Object.assign(firstActive, {course: 1});
      uni.setStorageSync('first-active', firstActive);
    }
    // #endif
    this.statusBarHeight = uni.getSystemInfoSync().statusBarHeight + 45;
    this.courseType = option.type;
    if (option.url === "courseBuyed") {
      this.courseType = 'buyed';
      this.subjects = JSON.parse(option.subjects);
      this.subject = JSON.parse(option.subject);
      if (this.subjects.length < 1) {
        return;
      }
      if (this.subjects.length > 1) {
        this.handleSubjects();
      }
      if (!this.subject.id) {
        this.subject = this.subjects[0]
      }
      this.currentSubject = this.subject;
      this.getGrades(this.currentSubject.id);
    } else {
      majorId = option.major_id;
      if(option.url == 'study') {
        this.courseType = 'buyed';
        user = this.$jwt.user();
        this.getCourseMajors(user.id)
      } else {
        this.getSubjects();
      }
    }
  },

  onUnload() {
    filterCondition = '';
  },

  onReachBottom() {
    this.scrolltolower();
  },

  methods: {
    moveHandle(e) {
      e.stopPropagation()
    },

    getCourseMajors(id) {
      services('category').queryCourseMajorsByUser(id).then(res => {
        if (res.data.error_code && res.data.error_code != 'SUCCESS') {
          return;
        }

        let majors = res.data;
        majors.forEach((item, index) => {
          if (item.id == majorId) {
            if (!item.subjects) {
              this.setTitle('视频');
              return;
            }

            this.subjects = item.subjects;
            if (this.subjects.length > 1) {
              this.handleSubjects();
            }
            this.currentSubject = this.subjects[0];
            this.subject = this.subjects[0];
            this.getGrades(this.subject.id);
          }
        })
      })
    },

    handleSubjects() {
      let subjectIds = [];
      for (let i in this.subjects) {
        subjectIds[i] = this.subjects[i].id;
      };
      let obj = {
        name: '全部',
        id: subjectIds.join()
      }
      this.subjects.unshift(obj)
    },

    checkedNav(item, index) {
      if (this.currentSubject.id == item.id) {
        return;
      }
      this.currentSubject = item;
    },

    goBack() {
      this.$loc.back();
    },

    getSubjects() {
      services('category-subjects').query({"refid": majorId}).then((res) => {
        if (res.data.error_code && res.data.error_code != 'SUCCESS') {
          return;
        }

        if (res.data.total_count <= 0) {
          this.setTitle('视频');
          return;
        }

        this.subjects = res.data.items;
        if (this.subjects.length > 1) {
          this.handleSubjects();
        }
        this.currentSubject = this.subjects[0];
        this.subject = this.subjects[0];
        this.getGrades(this.subject.id);
      })
    },

    scrolltolower() {
      if (this.loadingType !== 0) {
        return;
      }
      if (page < pageCount) {
        this.loadingType = 1;
        uni.showNavigationBarLoading();
        page++;
        if (this.subject.id || this.grade.id) {
          this.getCourses(this.grade.id);
        } else {
          this.getCourses();
        }
      } else {
        this.loadingType = 2;
        uni.hideNavigationBarLoading();
        return;
      }
    },

    getCourses(subjectId, gradeId) {
      let condition = {
        expand: 'cover',
        subject_id: subjectId ? subjectId : this.currentSubject.id,
        // #ifdef APP-PLUS
        grade_id: gradeId ? gradeId : '',
        // #endif
      }

      if (this.courseType === 'free' || this.year.name == '往年') {
        // 免费课程
        condition.end_price = 0; 
      }

      if (this.courseType === 'latest' || this.year.name == '最新') {
        // VIP课程
        condition.from_price = 0; 
      }

      services('course').query(condition, page).then((res) => {
        this.hideLoading();
        this.loadingType = 2;
        uni.hideNavigationBarLoading();
        uni.stopPullDownRefresh();
        if (res.data.error_code && res.data.error_code !== 'SUCCESS') {
          this.courseList = [];
          return;
        }

        if (res.data.total_count <= 0) {
          this.courseList = [];
          return;
        }

        pageCount = res.data.page_count;
        if (page < pageCount) {
          this.loadingType = 0;
        }
        if (page > 1) {
          this.courseList = this.courseList.concat(res.data.items); // 将数据拼接在一起
        } else {
          this.courseList = res.data.items;
        }
      })
    },

    // 视频页面跳转
		gopage(id) {
      this.$loc.open(`course/view?id=${id}`);
    },

    changeMask() {
      this.showMask = false;
    },

    getGrades(subjectId) {
      this.grades = [];
      services('grade').query(subjectId).then((res) => {
        if (res.data.error_code && res.data.error_code != 'SUCCESS') {
          return;
        }
        if (res.data.total_count <= 0) {
          return;
        }
        this.grades = res.data.items;
      })
    },

    setSubject(item) {
      this.grade = {};
      if (item.id == this.subject.id) {
        this.subject = {};
        return;
      }
      this.subject = item;
      this.getGrades(item.id);
    },

    setGrade(item) {
      if (item.id == this.grade.id) {
        this.grade = {};
        return;
      }
      this.grade = item;
    },

    setYear(item) {
      if (item.name == this.year.name) {
        this.year = {};
        return;
      }
      this.year = item;
    },

    showDrawer(e) {
      this.$refs[e].open();
    },

    drawerConfirm(e) {
      if (filterCondition == this.subject.id + "-" + this.grade.id + "-" + this.year.name) {
        this.$refs[e].close();
        return;
      }

      filterCondition = this.subject.id + "-" + this.grade.id + "-" + this.year.name
      if (!this.subject.id && !this.grade.id) {
        this.getCourses(this.subjects[0].id);
        if (this.subjects[0].name == '全部') {
          this.title = '课程';
        } else {
          this.title = this.subjects[0].name;
        }
        this.$refs[e].close();
        return;
      }

      if (this.subject.name == '全部') {
        this.title = '课程';
      } else {
        this.title = this.subject.name;
      }

      this.getCourses(this.subject.id, this.grade.id);
      this.$refs[e].close();
    },

    drawerReset() {
      this.subject = this.subjects[0];
      this.year = this.years[0];
      this.getGrades(this.subjects[0].id);
      this.grade = {};
    },
  }
}
</script>

<style scoped>
  .view {
	  display: flex;
	  flex-direction: column;
	  justify-content: center;
  }

  .view-item {
    margin-bottom: 24rpx;
    width: 690rpx;
    height: 200rpx;
    background: #fff;
    border-radius: 4rpx;
  }

  .content {
    display: flex;
    flex: 1;
    flex-direction: column;
    align-items: center;
    height: calc(100% - 20rpx);
  }

  .course-box {
    display: flex;
    margin-bottom: 20rpx;
    padding: 20rpx;
    border-radius: 5rpx;
    border: 2rpx solid #eee;
    box-shadow: #f4f4f4 0rpx 0rpx 3rpx 1rpx;
  }

  .course-content {
    width: 400rpx;
  }

  .course-title {
    display:-webkit-box;
    -webkit-box-orient: vertical;
    margin-bottom: 20rpx;
    width: 400rpx;
    height: 76rpx;
    line-height: 38rpx;
    font-size: 30rpx;
    color: #000;
    font-weight: bold;
    overflow: hidden;
    white-space: pre-wrap;
    word-wrap:break-word;
    text-overflow: ellipsis;
    -webkit-line-clamp: 2;
  }

  .course-description {
    display: block;
    margin-bottom: 20rpx;
    font-size: 22rpx;
    color: #999;
  }

  .course-label {
    display: flex;
    align-content: center;
    justify-content: space-between;
    width: 400rpx;
    height: 24rpx;
  }

  .star-style {
    display: flex;
  }

  .iconfont {
    font-size: 22rpx;
    color: #ffbc04;
  }

  .course-label-item {
    font-size: 22rpx;
    color: #999;
  }

  .hourse {
    margin-right: 22rpx;
  }

  .no-course-img {
    display: block;
    margin:  140rpx auto 0;
    width: 507rpx;
    height: 345rpx;
  }

  .no-course-text {
    display: block;
    text-align: center;
    font-size: 28rpx;
    color: #999;
  }

  .section-img {
    margin-right: 25rpx;
    width: 220rpx;
    height: 160rpx;
  }

  .section-img-none {
    background-size: cover;
    background-image: url("../../static/img/img-cover.jpg");
  }

   /*  #ifdef MP-WEIXIN  */
  .nav-scroller {
    position: fixed;
    top: 0;
    background: #fff;
    padding: 0 24rpx;
    width: 100%;
    height: 80rpx;
    box-sizing: border-box;
  }

  .pdt80 {
    padding-top: 80rpx;
  }

  .nav-title {
    white-space: nowrap;
    padding-right: 10rpx;
    height: 80rpx;
    font-size: 30rpx;
    color: #000;
    font-weight: bold;
    line-height: 80rpx;
  }

  .nav {
    display: flex;
    justify-content: space-between;
    width: 100%;
  }

  .active {
    color: #0c73ef;
  }
  /*  #endif  */

  /* #ifdef  APP-PLUS */
  .subject-list {
    top: calc(var(--status-bar-height) + 90rpx);
    width: 750rpx;
  }

  .subject-cell {
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

  .subject-title {
    font-size: 30rpx;
    color: #333;
  }

  .status-bar {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 999;
    height: var(--status-bar-height);
    width: 100%;
    background: #fff;
  }

  .course-head {
    position: fixed;
    top: var(--status-bar-height);
    left: 0;
    z-index: 999;
    background: #fff;
  }

  .item-name-active {
    background: url(../../static/img/icon-reset.png) no-repeat bottom right #F0F6FF;
  }

  /deep/ .uni-drawer .uni-drawer__content{
    width: 580rpx;
  }

  .drawer-wrap {
    position: relative;
    padding-top: calc(var(--status-bar-height) + 30rpx);
    height: 100%;
    box-sizing: border-box;
  }

  .drawer-content {
    height: calc(100% - 160rpx);;
  }

  .drawer-content-item {
    margin-left: 16rpx;
    margin-right: 16rpx;
  }

  .drawer-content-item:nth-child(1) {
    margin-bottom: 30rpx;
    padding-bottom: 30rpx;
    border-bottom: 2rpx solid #f8f8f8;
  }

  .drawer-content-item:nth-child(2) {
    margin-bottom: 30rpx;
    padding-bottom: 30rpx;
    border-bottom: 2rpx solid #f8f8f8;
  }

  .drawer-content-item .item-title {
    margin-bottom: 25rpx;
    font-size: 30rpx;
    color: #666;
  }

  .drawer-content-item .item-list {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
  }

  .drawer-content-item .item-list .item-name {
    margin-bottom: 16rpx;
    margin-right: 16rpx;
    padding: 19rpx 27rpx 21rpx 26rpx;
    font-size: 30rpx;
    color: #666;
    border-radius:10rpx;
  }

  .bg-default {
    background: #f8f8f8;
  }

  .drawer-btn {
    position: absolute;
    display: flex;
    bottom: 77rpx;
    left: 50%;
    margin-left: -156rpx;
    width: 312rpx;
  }

  .drawer-btn-text {
    margin-right: 20rpx;
    width: 146rpx;
    height: 60rpx;
    text-align: center;
    line-height: 60rpx;
    font-size: 30rpx;
    border-radius: 10rpx;
  }

  .drawer-btn .confirm {
    color: #fff;
    background: #3B8BFD;
  }

  .drawer-btn .reset {
    color: #3B8BFD;
    background: #E2EDFC;
    border: 1rpx solid #3B8BFD;
    box-sizing: border-box;
  }
  /*  #endif  */
  .course-list >>> .arrows {
    left: 70%;
  }
  .course-list >>> .image {
    transform: rotateY(180deg);
  }
  .course-list >>> .content {
    height: calc(100% + 20rpx);
  }

</style>
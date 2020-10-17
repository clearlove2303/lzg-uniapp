<template>
  <view class="course">
    <view class="course-content" v-if="courseMajors.length > 0">
      <view class="course-box">
        <view v-for="item in courseMajors" :key="item.id" class="course-majors">
            <view class="major-title">{{ item.name }}</view>
            <view class="course-title-box" v-for="cell in item.subjects"
              :key="cell.id" @click="goCourseList(item, cell)">
              <text class="course-title">{{ cell.name }}</text>
              <text class="iconfont icon-gengduo"></text>
            </view>
        </view>
      </view>
    </view>
    <view class="no-course" v-if="noCourse">
      <view>
        <!-- #ifdef  MP-WEIXIN -->
        <image :src="getUrl('img-no-exam.png') | handleImgUrl('507', '345')"></image>
        <!-- #endif -->
        <!-- #ifdef  APP-PLUS -->
        <cache-image :imgUrl="getUrl('img-no-exam.png') | handleImgUrl('507', '345')"></cache-image>
        <!-- #endif -->
      </view>
      <view><text class="no-course-text">没有购买的课程哦~</text></view>
    </view>
    <uni-popup ref="popup" type="center">
      <view class="tel-title">提示信息</view>
      <view class="tel-dialog">没有完成的协议，暂时没有可以观看的课程</view>
      <view class="tel-button">
        <text class="btn-text" @click="closePopup">确定</text>
      </view>
    </uni-popup>
  </view>
</template>
<script>
import service from '@/common/service-loader'
import uniPopup from '@/components/vendor/uni-popup/uni-popup.vue'
// #ifdef  APP-PLUS
import cacheImage from "@/components/media/cache-image.vue"
// #endif
import cacheKeys from '@/plugins/cache/keys.js';
export default {
  components: { 
    uniPopup,
    // #ifdef  APP-PLUS
    cacheImage
    // #endif
  },
  data() {
    return {
      noCourse: false, /* fix issue #1978*/
      courseMajors: [],
      current: 0,
    }
  },

  onLoad() {
    setTimeout(() => {
      this.showLoading();
      this.init();
    }, 300);
  },

  methods: {
    init() {
      this.getCourseMajors();
    },

    getCourseMajors() {
      let user = this.$jwt.user();
      this.loadCacheData({
        key: cacheKeys.pages.user.buyedCourses,
        beforeCache: this.beforeCourseMajorsCache}, 
        service('category').queryCourseMajorsByUser(user.id), 
        'courseMajors').then((res) => {
          this.hideLoading();
        }).catch((err) => {
          this.hideLoading();
        })
    },

    beforeCourseMajorsCache(data) {
      this.hideLoading();
      if (data.error_code) {
        this.$refs.popup.open();
        this.noCourse = true;
        return false;
      }
      return data;
    },

    goCourseList(item, subject) {
      this.$loc.open(`course/courselist?url=courseBuyed&subjects=${JSON.stringify(item.subjects)}&subject=${JSON.stringify(subject)}`);
    },

    closePopup() {
      this.$refs.popup.close();
    }
  },
}
</script>
<style scoped>
.course-box {
  padding-bottom: 55rpx;
}

.course-majors {
  margin: 20rpx 24rpx 0;
  width: 702rpx;
  font-size: 34rpx;
  box-shadow: 0 0 10rpx rgba(0, 0, 0, 0.05);
  box-sizing: border-box;
}

.major-title {
  height: 88rpx;
  line-height: 88rpx;
  padding-left: 29rpx;
  color: #000;
  font-weight: bold;
  background: #ebf3ff;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
}

.course-title-box {
  display: flex;
  justify-content: space-between;
  height: 70rpx;
  line-height: 70rpx;
  padding: 0 39rpx 0 29rpx;
  color: #333;
  font-weight: 500;
}

.course-title {
  display: inline-block;
  width: 580rpx;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.no-course {
  padding-top: 267rpx;
  text-align: center;
}

.no-course image {
  width: 420rpx;
  height: 385rpx;
}

.no-course-text {
  margin-top: 45rpx;
  color: #999;
  font-size: 28rpx;
}
.tel-title {
  margin-bottom: 24rpx;
  font-size: 34rpx;
  font-weight: 700;
  text-align: center;
}

.tel-dialog {
  margin-left: 22rpx;
  margin-right: 22rpx;
  margin-bottom: 42rpx;
  text-align: center;
  font-size: 26rpx;
  line-height: 36rpx;
}

.tel-button {
  display: flex;
  align-items: center;
  border-top: 1rpx solid #d5d6d8;
  height: 88rpx;
  line-height: 88rpx;
}

.btn-text {
  width: 100%;
  height: 88rpx;
  text-align: center;
  font-size: 36rpx;
  color: #007aff;
}

.icon-gengduo {
  color: #c9c9c9;
}
</style>

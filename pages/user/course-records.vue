<template>
  <view class="record-page">
    <view v-if="courseRecords.length > 0">
      <view v-for="(item, index) in courseRecords" :key="index" class="content-box" @click="goPage(item, index)">
        <!-- #ifdef  MP-WEIXIN -->
        <image
          :src="item.cover != null ? item.cover.url : null"
          mode="scaleToFill"
          class="section-img"
          :class="item.cover && item.cover.url ? '' : 'section-img-none'"></image>
        <!-- #endif -->
        <!-- #ifdef  APP-PLUS -->
        <cache-image
          :imgUrl="item.cover != null ? item.cover.url : null"
          imgMode="scaleToFill"
          class="section-img"
          :class="item.cover && item.cover.url ? '' : 'section-img-none'"></cache-image>
        <!-- #endif -->
        <view class="course-content">
          <text class="course-title">{{ item.course_title }}</text>
          <text class="course-description">{{ item.section_title }}</text>
          <text class="time">{{ item.updated_at | formatTime('yyyy-mm-dd HH:MM') }}</text>
        </view>
      </view>
      <uni-load-more :loadingType="loadingType"></uni-load-more>
    </view>
    <view class="no-course-records" v-if="nocourseRecords">
      <!-- #ifdef  MP-WEIXIN -->
      <image
        :src="noMineImage | handleImgUrl('507', '345')"
        mode="scaleToFill"
        style="width: 507rpx; height: 345rpx"></image>
      <!-- #endif -->
      <!-- #ifdef  APP-PLUS -->
      <cache-image
        :imgUrl="noMineImage | handleImgUrl('507', '345')"
        imgMode="scaleToFill"
        style="width: 507rpx; height: 345rpx"></cache-image>
      <!-- #endif -->
      <text class="no-course-text">暂无观看视频哦～</text>
    </view>
  </view>
</template>

<script>
import service from '@/common/service-loader';
import uniLoadMore from '@/components/vendor/uni-load-more/uni-load-more.vue';
// #ifdef  APP-PLUS
import cacheImage from "@/components/media/cache-image.vue";
// #endif
import cacheKeys from '@/plugins/cache/keys.js';

const STATICURL = getApp().globalData.CDN;

let pageCount = null,
    currentPage = 1,
    userId = '',
    timer = null,
    isOnsale = null,
    isIndex = null;

export default {
  components: {
    uniLoadMore,
    // #ifdef  APP-PLUS
    cacheImage
    // #endif
  },

  data() {
    return {
      courseRecords: [],
      scrollHeight: '',
      noMineImage: `${STATICURL}img-no-exam.png`,
			loadingType: 0, // 定义加载方式 0---contentdown  1---contentrefresh 2---contentnomore
      statusBarHeight: 0,
      nocourseRecords: false, /* fix issue #1978*/
    };
  },

  onLoad(option) {
		userId = this.$jwt.user().id;
    currentPage = 1;
    const res = uni.getSystemInfoSync();
    this.scrollHeight = res.windowHeight;
    this.statusBarHeight = res.statusBarHeight + 45;
		setTimeout(() => {
      this.showLoading();
      this.getcourseRecords();
    }, 300);
  },

  onPullDownRefresh() {
    currentPage = 1,
    this.loadingType = 0;
    this.getcourseRecords();
  },

  // 上拉加载
  onReachBottom() {
    this.scrolltolower();
  },

  onReachBottom() {
    if (currentPage < pageCount) {
      this.loadingType = 1;
      uni.showNavigationBarLoading();
      currentPage++;
      this.getcourseRecords();
    } else {
      this.loadingType = 2;
      return;
    }
  },

  methods: {
    // 获取观看历史记录
    
    getcourseRecords() {
      this.loadCacheData(
        {
          key: cacheKeys.pages.user.courseRecords,
        }, 
        service('course-record').queryByUser(userId, currentPage), 
        'courseRecords').then((res) => {
          this.hideLoading();
          uni.hideNavigationBarLoading();
          uni.stopPullDownRefresh();
          if (res.data.total_count == 0) {
            this.courseRecords = [];
            this.nocourseRecords = true;
            return;
          }
          pageCount = res.data.page_count;

          if (currentPage > 1) {
            this.courseRecords = this.courseRecords.concat(res.data.items);

          } else {
            this.courseRecords = res.data.items;
          }

          // 点击视频下架则刷新删除该视频
          if( isOnsale === 0) {
            this.courseRecords.splice(isIndex, 1);
          }

          if (currentPage >= pageCount) {
            this.loadingType = 2;
            return;
          }
        }).catch((err) => {
          console.log(err)
          this.hideLoading();
        });
        console.log('courseRecords', this.courseRecords);
    },

    // 视频页面跳转
    goPage(item, index) {
			if(item.onsale === 0) {
				uni.showToast({
					title: '该视频已下架',
					icon: 'none',
				});
				isOnsale = item.onsale;
				isIndex = index;
				this.courseRecords.splice(index, 1);
				return false;
      }
			this.$loc.open(`course/view?id=${item.course_id}&sid=${item.section_id}`);
		},
  }
}
</script>

<style scoped>
  .no-course-records {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 267rpx;
  }

  .no-course-text {
    display: block;
    padding-top: 45rpx;
    font-size: 28rpx;
    color: #999;
  }

  .content-box {
    margin: 20rpx auto 0;
    width: 702rpx;
    display: flex;
    justify-content: space-between;
    height: 200rpx;
    padding: 20rpx;
    box-sizing: border-box;
    box-shadow: 0 0 7rpx rgba(0, 0, 0, 0.05);
  }

  .image {
    display: block;
    width: 220rpx;
    height: 160rpx;
  }

  .image image {
    width: 220rpx;
    height: 160rpx;
  }

  .course-content {
    width: calc(100% - 245rpx);
  }

  .course-title {
    margin-top: -8rpx;
    height: 76rpx;
    line-height: 38rpx;
    font-size: 30rpx;
    font-weight: bold;
    color: #000;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow: hidden;
  }

  .course-description {
    display: block;
    line-height: 48rpx;
    font-size: 24rpx;
    font-family: PingFang-SC-Medium;
    font-weight: 500;
    color: #333;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .time {
    display: block;
    font-size: 22rpx;
    font-family: PingFang-SC-Medium;
    font-weight: 500;
    color:#999;
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
</style>

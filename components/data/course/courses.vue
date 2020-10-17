<template>
  <view>
    <view class="courseware-box" @click="goDocument(course.id)">
      <view class="course-title">{{ course.year ? course.year : ''}}{{  course.title }}</view>
      <view class="courseware" >
        <text class="iconfont icon-kejian"></text>
        <text>下载</text>
      </view>
    </view>
    <scroll-view
      class="list coursewares-list"
      scroll-y="true"
      :style="{height: windowHeight + 'px'}"
      v-if=hasLogin
      @scrolltolower="scrollBottom">
      <image
        v-for="(item, index) in coursewares"
        :key="index"
        class="coursewares-item"
        :src="item.url"
        resize="cover"
        @click="openLightBox(index, coursewares)">
      </image>
      <uni-load-more :loadingType="loadingType" :contentText="contentText"></uni-load-more>
    </scroll-view>
  </view>
</template>
<script>
import { mapState } from 'vuex';

import uniLoadMore from '@/components/vendor/uni-load-more/uni-load-more.vue';
import services from '../../../common/service-loader';

let currentPage = 1;
let pageCount = null;

export default {
  components: {
    uniLoadMore,
  },
  props: {
    course: {
      type: Object,
      default: () => {},
    },
    chapters: {
      type: Object,
      default: () => {},
    },
    sectionId: {
      type: Number,
      default: () => {},
    },
  },
  data() {
    return {
      coursewares: [],
      windowHeight: '',
      loadingType: 0, // 定义加载方式 0---contentdown  1---contentrefresh 2---contentnomore
      contentText: {
        contentdown: '上拉显示更多',
        contentrefresh: '正在加载...',
        contentnomore: '没有更多数据了'
      },
    }
  },
  computed: mapState(['hasLogin']),
  watch: {
    chapters() {
      const res = uni.getSystemInfoSync();
      this.windowHeight = res.windowHeight - 210;
      this.getCoursewares();
    },
    sectionId() {
      currentPage = 1;
      this.getCoursewares();
    }
  },
  methods: {
    scrollBottom(){
      if (this.loadingType !== 0) {
        return;
      }

      if (currentPage < pageCount) {
        this.loadingType = 1;
        uni.showNavigationBarLoading();
        currentPage++;
        this.getCoursewares();
      } else {
        this.loadingType = 2;
        uni.showNavigationBarLoading();
        return;
      }
    },

    goDocument(id) {
      if (!this.hasLogin) {
        this.$loc.open(`course/courseware?courseId=${id}`);
        return;
      }
      if (this.course.is_buyed === 0) {
        this.$emit(
          'change',
          { isShow: true }
        );
        return;
      }
      this.$loc.open(`course/courseware?courseId=${id}`);
    },

    getCoursewares() {
      if (!this.hasLogin) {
        return;
      }

      if(!this.sectionId) {
        let section = this.chapters[0]['sections'][0];
        this.sectionId = section.id;
      }

      services('course').queryCoursewares(this.sectionId, currentPage).then((res) => {
        this.handlecoursewares(res);
      })

    },

    handlecoursewares(res) {
      if (res.data.error_code && res.data.error_code !== 'SUCCESS') {
        return;
      }
      this.loadingType = 2;
      uni.hideNavigationBarLoading();
      pageCount = res.data.page_count;
      this.loadingType = 0;
      uni.hideNavigationBarLoading();
      if(res.data.total_count < res.data.per_page) {
        this.loadingType = 2;
        uni.hideNavigationBarLoading();
      }

      if (currentPage > 1) {
        this.coursewares= this.coursewares.concat(res.data.items);

      } else {
        this.coursewares = res.data.items;
      }

    },

    // 轮播
    openLightBox(index, coursewares) {
      const urls = [];
      for (let i = 0; i < coursewares.length; i++) {
        urls.push(coursewares[i].url);
      }

      uni.previewImage({
        current: index,
        urls,
      });

      /* this.$emit(
        'change',
        { imageList: coursewares, index: index, isShow: "true" }
      ); */
    },
  }
}
</script>
<style scoped>
.list {
  background-color: #fff;
}

.coursewares-list {
  padding-top: 14rpx;
  text-align: center;
}

.coursewares-item {
  margin-bottom: 20rpx;
  width: 702rpx;
  height: 300rpx;
}

.tip-box {
  margin-top: 40rpx;
  text-align: center;
  font-size: 28rpx;
  color: #777;
}

.courseware {
  border: 1rpx solid #bbb;
  border-radius: 100rpx;
  width: 136rpx;
  height: 48rpx;
  text-align: center;
  line-height: 48rpx;
  font-size: 24rpx;
  color: #333;
}

.icon-kejian {
  margin-right: 10rpx;
  font-size: 24rpx;
  color: #3b8bfd;
}

.course-title {
  width: 540rpx;
  font-size: 28rpx;
  color: #222;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.courseware-box {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 20rpx 24rpx 0;
  box-sizing: border-box;
}
</style>

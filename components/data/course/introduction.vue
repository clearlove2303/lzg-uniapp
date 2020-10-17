<template>
  <view class="introduction">
    <view class="introduction-top">
      <!-- fix issue #2296 -->
      <view class="introduction-title">{{ course.year ? course.year : ''}}{{  course.title }}</view>
      <view class="introduction-score">
        <view class="score">
          评分:
          <view class="icon-like">
            <text class="iconfont icon-aixin" v-for="i in 5" :key="i"></text>
          </view>
        </view>
        <view class="person">{{ course.hits }}人学习</view>
      </view>
    </view>
    <view class="introduction-content">
      <view class="introduction-title">课程介绍</view>
      <view class="describe">{{ description }}</view>
    </view>
  </view>
</template>
<script>
import { mapState } from 'vuex';

export default {
  props: {
    course: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      description: '',
    }
  },
  watch: {
    course() {
      if (this.course.description != '') {
        this.description = this.course.description;
      } else {
        this.description = '名师根据最新大纲要求，细致、深入、系统地讲解考纲所涉及的各个知识要点，突出考试重点、难点，紧跟命题方向，透彻解析教材，帮助考生形成专业理论构架，建立正确的解题思维体系，提高考生综合应试能力。';
      }
    }
  },
}
</script>
<style scoped>
  .introduction-top,
  .introduction-content {
    padding: 36rpx 25rpx 30rpx 25rpx ;
    padding-bottom: 30rpx;
    background: #fff;
  }

  .introduction-top {
    border-bottom: 20rpx solid #eee;
  }

  .introduction-title {
    font-size: 30rpx;
    color: #222;
    font-weight: bold;
  }

  .introduction-score {
    display: flex;
    align-items: center;
    margin-top: 17rpx;
  }

  .score,
  .person {
    font-size: 22rpx;
    color: #666;
  }

  .score {
    display: flex;
  }

  .icon-aixin {
    color: #3b8bfd;
  }

  .icon-like {
    margin-left: 13rpx;
  }

  .person {
    margin-left: 40rpx;
    margin-right: 20rpx;
  }

  .describe {
    margin-top: 33rpx;
    line-height: 40rpx;
    font-size: 24rpx;
    color: #666;
  }
</style>

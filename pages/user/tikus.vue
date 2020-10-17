<template>
  <view>
    <scroll-view scroll-y="true" v-if="exams && exams.length > 0">
      <view
        v-for="(item, index) in exams"
        :key="index"
        @click="doTest(item)"
        class="list-cell">
        <view class="list-left">
          <text class="title">{{item.title}}</text>
          <view class="day-number">
            <view class="day">
              <text class="text">练习天数</text>
              <text class="text red-text" v-if="item.total_days == undefined">0</text>
              <text class="text red-text" v-else>{{item.total_days}}</text>
              <text class="text">天</text>
            </view>
            <view class="number">
              <text class="text">累积答题</text>
              <text class="text red-text" v-if="item.total_tests == undefined">0</text>
              <text class="text red-text" v-else>{{item.total_tests}}</text>
              <text class="text">道</text>
            </view>
          </view>
          <text class="do-test">继续答题</text>
        </view>
        <view class="list-right">
          <view class="percent">
            <text class="percent-number" v-if="item.right_percent == undefined">0</text>
            <text class="percent-number" v-else>{{item.right_percent}}</text>
            <text class="percent-icon">%</text>
          </view>
          <text class="percent-text">正确率</text>
        </view>
      </view>
    </scroll-view>
    <view class="no-tiku-records" v-if="noExams">
      <!-- #ifdef  MP-WEIXIN -->
      <image
        :src="noDataImage | handleImgUrl('507', '345')"
        mode="scaleToFill"
        style="width: 507rpx; height: 345rpx">
      </image>
      <!-- #endif -->
      <!--  #ifdef  APP-PLUS -->
      <cache-image
        :imgUrl="noDataImage | handleImgUrl('507', '345')"
        imgMode="scaleToFill"
        style="width: 507rpx; height: 345rpx">
      </cache-image>
      <!-- #endif -->
      <text class="no-tiku-text">您还没有已购买的题库哦~</text>
    </view>
  </view>
</template>

<script>
import service from '@/common/service-loader'
// #ifdef  APP-PLUS
import cacheImage from "@/components/media/cache-image.vue"
// #endif
import cacheKeys from '@/plugins/cache/keys.js';

const STATICURL = getApp().globalData.CDN;
let user = null;

export default {
  // #ifdef  APP-PLUS
  components: {
    cacheImage
  },
  // #endif
  data() {
    return {
     exams: [],
     noExams: false, /* fix issue #1978*/
     noDataImage: `${STATICURL}img-no-exam.png`,
    }
  },

  onShow() {
		user = this.$jwt.user();
		setTimeout(() => {
      this.showLoading();
      this.getExamData();
    }, 600);
  },

  methods: {
    getExamData() {
      this.exams = [];
      this.loadCacheData(
        {
          key: cacheKeys.pages.user.buyedExams,
        }, 
        service('exam').query(user.id), 
        'exams'
      ).then((res) => {
        this.hideLoading();
        if (res.data.error_code) {
          return;
        }
        //issue #3667 具体信息只有有网的时候展示
        let exams = res.data.items;
        for (let [index, item] of exams.entries()){
          service('exam').getSummary(user.id, item.id).then(res => {
            let examSummary = {
              id: item.id,
              title: item.title,
              total_days: res.data.total_days,
              total_tests: res.data.total_tests,
              right_percent: res.data.right_percent
            };

            this.exams.splice(index, 1, examSummary);
          });
        };
      }).catch((err) => {
        console.log(err)
        this.hideLoading();
      });
    },

    doTest(item) {
      // 继续答题默认跳转到题库首页
      this.$loc.open(`tiku/index?id=${item.id}&title=${item.title}`);
    },
  }
}
</script>

<style scoped>

.list-cell {
  margin: 20rpx auto;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 702rpx;
  padding: 30rpx;
  box-sizing: border-box;
  border: 2rpx solid #eee;
}

.list-left {
  width: 450rpx;
}

.title {
  display: block;
  width: 400rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 40rpx;
  font-weight: 500;
  color: #000;
}

.day-number {
  display: flex;
  flex-direction: row;
  padding-top: 20rpx;
  padding-bottom: 25rpx;
}

.day,
.number,
.percent {
  display: flex;
  flex-direction: row;
}

.day,
.number,
.percent text {
  display: block;
}

.number {
  margin-left: 60rpx;
}

.text {
  line-height: 30rpx;
  font-size: 28rpx;
  color: #999999;
}

.red-text {
  padding-left: 10rpx;
  line-height: 30rpx;
  font-size: 28rpx;
  color: #ff0000;
}

.do-test {
  display: block;
  width: 160rpx;
  height: 56rpx;
  line-height: 56rpx;
  border-radius: 28rpx;
  background: #3b8bfd;
  text-align: center;
  font-size: 28rpx;
  color: #ffffff

}

.percent {
  display: flex;
  align-items: baseline;
}

.percent-number {
  font-size: 60rpx;
  font-weight: 500;
  color: #3b8bfd;
}

.percent-icon {
  font-size: 28rpx;
  color: #3b8bfd;
}

.percent-text {
  padding-top: 16rpx;
  text-align: center;
  font-size: 28rpx;
  font-weight: 500;
  color: #333333;
}

.no-tiku-records {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 267rpx;
}

.no-tiku-text {
  display: block;
  padding-top: 45rpx;
  font-size: 28rpx;
  color: #999999;
}
</style>


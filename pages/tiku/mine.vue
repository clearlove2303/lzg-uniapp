<template>
  <view class="mine">
    <scroll-view scroll-y="true" @scrolltolower="scrolltolower" v-if="test.length > 0">
      <view class="mine-head">
        <text @click="rightButtonClick">{{ rightText }}</text>
      </view>
      <view
        class="mine-list"
        v-for="(item, index) in test"
        :key="item.id"
        @click="select(index, item)">
        <view
          v-if="iconShow"
          class="iconfont icon-wancheng mine-icon"
          :style="[item.active ? activeColor : {} ]"></view>
        <text
          class="mine-title"
          :class="[iconShow ? 'icon-show' : '']">{{ item.test_title }}</text>
      </view>
      <uni-load-more :loadingType="loadingType" :contentText="contentText" ></uni-load-more>
    </scroll-view>
    <view v-if="noTest" class="no-mine">
      <!-- #ifdef  MP-WEIXIN -->
      <image :src="noMineImage | handleImgUrl('507', '345')" mode="scaleToFill" class="no-mine-img"></image>
      <!-- #endif -->
      <!-- #ifdef  APP-PLUS -->
      <cache-image :imgUrl="noMineImage | handleImgUrl('507', '345')" imgMode="scaleToFill" class="no-mine-img"></cache-image>
      <!--  #endif -->
      <view class="no-mine-text"> {{ noMineText }} </view>
    </view>
    <!-- finish #2428 -->
    <modal
      :noCancel="true"
      :show="isShow"
      confirmText="是"
      cancelText="否"
      title="题目已被删除,是否从列表中移除"
      @cancel="cancel"
      @confirm="confirm"></modal>
  </view>
</template>
<script>
// #ifdef  APP-PLUS
import cacheImage from "@/components/media/cache-image.vue";
// #endif
import services from '@/common/service-loader';
import uniLoadMore from '@/components/vendor/uni-load-more/uni-load-more.vue';
// finish #2428
import modal from '@/components/custom/modal.vue';

const STATICURL = getApp().globalData.CDN;

let user,
    examId,
    mode,
    testId,
    pageCount = null,
    isDeleted = null,
    currentPage = 1;

export default {
  components: { 
    uniLoadMore, 
    modal,
    // #ifdef  APP-PLUS
    cacheImage
    // #endif 
  },
  data() {
    return {
      rightText: '删除',
      noMineText: '暂无数据',
      test: [],
      noTest: false,
      testIds: [],
      iconShow: false,
      activeColor: {
        color: '#3b8bfd',
      },
      noMineImage: `${STATICURL}img-no-video.png`,
      loadingType: 0, // 定义加载方式 0---contentdown  1---contentrefresh 2---contentnomore
      contentText: {
        contentdown: '上拉显示更多',
        contentrefresh: '正在加载...',
        contentnomore: '没有更多题目了'
      },
      // finish #2428
      isShow: false,
    }
  },

  onUnload() {
    uni.$off('getAutoRemove', this.getAutoRemove);
    uni.$off('doTest', this.initData);
  },

  onLoad(option) {
    uni.$on('getAutoRemove', this.getAutoRemove);
    uni.$on('doTest', this.initData);
    currentPage = 1;
    mode = option.mode;
    examId = option.id;
  },

  onReady() {
    setTimeout(() => {
      this.showLoading();
      this.init();
    }, 300);
  },

  // 上拉加载
  onReachBottom() {
    this.scrolltolower();
  },

  watch: {
    test(newValue) {
      if (newValue && newValue.length > 0) {
        this.noTest = false;
      } else {
        this.noTest = true;
      }
    },
  },

  methods: {
    initData() {
      let autoRemove;
      try {
        autoRemove = uni.getStorageSync('autoRemove') ? 1 : 0;
      } catch {}
      
      if (autoRemove == 1) {
        this.test = [];
        currentPage = 1;
        this.init()
      }
    },
    getAutoRemove() {
      currentPage = 1;
      this.init();
    },

    scrolltolower() {
      if (currentPage < pageCount) {
        this.loadingType = 1;
        uni.showNavigationBarLoading();
        currentPage++;
        this.init();
      } else {
        this.loadingType = 2;
        uni.hideNavigationBarLoading();
        return;
      }
    },

    init() {
      user = this.$jwt.user();
      if (mode === 'FAV') {
        services('exam').queryFavoriteTests({"user_id": user.id, "exam_id": examId}, currentPage).then((res) => {
          this.setTitle('我的收藏');
          this.getDataHandle(res, '暂时没有收藏');
        });
      }

      if (mode === 'WRONG') {
        this.setTitle('错题重做');

        services('exam').queryWrongTests({"user_id": user.id, "exam_id": examId}, currentPage).then((res) => {
          this.getDataHandle(res, '暂时没有错题');
        });
      }
    },

    getDataHandle(res, alertText) {
      this.hideLoading();

      if (res.data.error_code) {
        this.noMineText = alertText;
        return;
      }

      if (res.data.total_count == 0) {
        this.noMineText = alertText;
        this.noTest = true;
        return;
      }

      if (!res.data.items) {
        this.noMineText = alertText;
        return;
      }

      pageCount = res.data.page_count;

      if (currentPage > 1) {
        this.test = this.test.concat(res.data.items);

      } else {
        this.test = res.data.items;
      }

      for (let index in this.test) {
        this.$set(this.test[index], 'active', false);
      }

      for (let i = 0; i < this.test.length; i++) {
        if (this.test[i].test_title == null || this.test[i].test_title == "") {
          this.test[i].test_title = '请根据以下选项回答问题';
        }
      }

      if (currentPage >= pageCount) {
        this.loadingType = 2;
        return;
      }
    },

    // finish #2428
    confirm() {
      let temp = this.test;

      temp.forEach((item, index) => {
        if (testId == item.id) {
          temp.splice(index, 1);
        }
      })
      this.test = temp;
      this.testIds.push(testId);
      this.deleteTests();
      this.testIds = [];
    },

    rightButtonClick() {
      if (!this.test.length) {
        return;
      }
      if (this.iconShow) {
        this.rightText = '删除';
        this.iconShow = false;
        // 删除收藏或者错题
        let temp = this.test;
        // 没有选择则返回
        if (this.testIds.length < 0) {
          return;
        }
        this.testIds.forEach(i => {
          temp.forEach((item, index) => {
            if (i == item.id) {
              temp.splice(index, 1);
            }
          })
        })
        this.test = temp;
        this.deleteTests();
        this.testIds = [];
        return;
      }
      this.rightText = '确定';
      this.iconShow = true;
    },

    async select(index, item) {
      // finish #2428
      await services('test').get(item.test_id).then(res => {
        if (res.data.error_code && res.data.error_code != 'SUCCESS') {
          return;
        }
        isDeleted = res.data.is_deleted;
      })

      // finish #2428
      if (this.iconShow) {
        // 选中状态
        if (!item.active) {
          this.test.forEach((i, index) => {
            if (item.id === i.id) {
              this.test[index].active = true;
              this.testIds.push(item.id);
            }
          });
        } else {
          // 取消选中状态
          this.test.forEach((i, index) => {
            if (item.id === i.id) {
              this.test[index].active = false;
              let num = this.testIds.indexOf(item.id);
              this.testIds.splice(num, 1);
            }
          });
        }
        return;
      } else {
        testId = item.id;
      }

      // finish #2428
      if(isDeleted == 1) {
        this.isShow = true;
        return;
      }

      if(!this.iconShow) {
        this.$loc.open(`tiku/paper?exam_id=${examId}&test_order=${index + 1}&mode=${mode}`);
        return;
      }

    },

    // finish #2428
    cancel() {
      this.isShow = false;
    },

    deleteTests() {
      if (mode === 'FAV') {
        services('test-fav').delete(this.testIds);
      }
      if (mode === 'WRONG') {
        services('test-record').delete(this.testIds);
      }
    },
  },
}
</script>
<style scoped>
  .mine-head {
    display: flex;
    flex-direction: row-reverse;
    margin:20rpx 24rpx 0;
    width: 702rpx;
    color: #3b8bfd;
    font-size: 34rpx;
  }

  .mine-list {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    margin:20rpx 24rpx 0;
    width: 702rpx;
  }

  .mine-icon {
    margin-right: 24rpx;
    font-size: 54rpx;
    color: #bbbbbb;
  }

  .mine-title {
    padding-left: 21rpx;
    padding-right: 21rpx;
    border: 1rpx solid #f4f4f4;
    width: 702rpx;
    height: 88rpx;
    line-height: 88rpx;
    font-size: 34rpx;
    color: #333;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
    box-sizing: border-box;
  }

  .icon-show {
    width: 628rpx;
  }

  .no-mine-img {
    display: block;
    margin:  140rpx auto 0;
    width: 507rpx;
    height: 345rpx;
  }

  .no-mine-text {
    display: block;
    text-align: center;
    font-size: 28rpx;
    color: #999;
  }
</style>

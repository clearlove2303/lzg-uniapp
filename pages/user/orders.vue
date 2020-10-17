<template>
  <view class="orders">
    <view class="swiper-tab">
      <view 
        v-for="(menuTab, index) in menuTabs" 
        :key="index"
        :class="['swiper-tab-list', currentTab == index ? 'active' : '']"
        @click="switchMenu(index)">{{ menuTab.name}}</view>
    </view>
    <swiper 
      :current="currentTab" 
      :style="{height: windowHeight + 'px'}"
      class="swiper-box-list" 
      duration="300" 
      @change="swiperChange">
      <swiper-item v-for="(menuTab, index) in menuTabs" :key="index">
        <scroll-view
          v-if="orders.length > 0" 
          :style="{height: windowHeight + 'px'}" 
          scroll-y="true"
          @scrolltolower="scrolltolower">
          <view v-for="(item, index) in orders" :key="index" class="orders-box">
            <view class="order-content" @click="goContract(item)">
              <text class="title">{{ item.title }}</text>
              <text class="fee">￥{{ item.fee }}</text>
              <text class="txt">订单编号：{{ item.number }}</text>
              <text class="txt">订单时间：{{ getData(item.created_at) }}</text>
            </view>
            <!-- finish #2042 -->
            <view v-if="item.status === orderStatus.TOPAY || item.status === orderStatus.AUDIT_FAILLURE" class="order-button-box">
              <text class="cancel" @click="showModal(item)">取消订单</text>
              <text class="blue-btn" @click="clickPay(item)">立即付款</text>
            </view>
            <view class="order-button-box">
              <text class="blue-btn" @click="goContract(item)" v-if="item.status > orderStatus.TOAUDIT && item.is_signed == 1">查看协议</text>
              <text class="blue-btn" @click="goContract(item)" v-if="item.status == orderStatus.FINISHED && item.is_signed == 0">激活协议</text>
            </view>
            <view v-if="item.status === orderStatus.FINISHED || item.status === orderStatus.TESTED" class="right-txt blue">交易完成</view>
            <view v-if="item.status === orderStatus.TOAUDIT" class="right-txt blue">待审核</view>
            <view v-if="item.status === orderStatus.REFUNDED" class="right-txt gray">已退款</view>
            <view v-if="item.status === orderStatus.TORERUND" class="right-txt gray">待退款</view>
            <view v-if="item.status === orderStatus.CANCELED" class="right-txt gray">交易取消</view>
            <view v-if="item.status === orderStatus.EXPIRED" class="right-txt gray">已过期</view>
          </view>
          <uni-load-more :loadingType="loadingType" :contentText="contentText"></uni-load-more>
        </scroll-view>
        <view class="no-order-records" v-if="noOrders">
          <!-- #ifdef  MP-WEIXIN -->
          <image
            :src="noCourseImage | handleImgUrl('507', '345')"
            mode="scaleToFill"
            style="width: 507rpx; height: 345rpx"></image>
          <!-- #endif -->
          <!--  #ifdef  APP-PLUS -->
          <cache-image
            :imgUrl="noCourseImage | handleImgUrl('507', '345')"
            imgMode="scaleToFill"
            style="width: 507rpx; height: 345rpx"></cache-image>
          <!-- #endif -->
          <text class="no-order-text">{{ noOrderText }}</text>
        </view>
      </swiper-item>
    </swiper>
    <modal :show="isShow" title='取消订单' :textShow="true" text='确定要取消订单吗?' :noCancel="true" @cancel='cancel' @confirm='confirm' />
  </view>
</template>

<script>
import service from '@/common/service-loader'
import uniLoadMore from '@/components/vendor/uni-load-more/uni-load-more.vue';
import modal from '@/components/custom/modal.vue';
import cacheKeys from '@/plugins/cache/keys.js';
// #ifdef  APP-PLUS
import cacheImage from "@/components/media/cache-image.vue";
// #endif
const H5Url = getApp().globalData.H5Url;
const STATICURL = getApp().globalData.CDN;
const APPSOURCE = 0;

let pageCount = null,
    currentPage = 1,
    user = null,
    status;

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
      current: 0,
      currentTab: 0,
      windowHeight: '',
      orders: [],
      noOrderText: '您还没有订单哦~',
      menuTabs: [{
        name: '全部'
      }, {
        name: '待付款'
      }, {
        name: '已完成'
      }, {
        name: '已取消'
      }],
      noCourseImage: `${STATICURL}img-no-exam.png`,
      loadingType: 0, // 定义加载方式 0---contentdown  1---contentrefresh 2---contentnomore
      contentText: {
        contentdown: '上拉显示更多',
        contentrefresh: '正在加载...',
        contentnomore: '没有更多订单了'
      },
      beChangedOrder: {},
      orderStatus: getApp().globalData.ORDER_STATUS,
      isShow: false,
      noOrders: false, /* fix issue #1978*/
    }
  },

  onLoad() {
    user = this.$jwt.user();
    status = 'ALL';
    const res = uni.getSystemInfoSync();
    this.windowHeight = res.windowHeight;
    this.initData();
    uni.$on('goBack', this.initData)
    uni.$on('paymentSuccess', this.initData)
  },

  onUnload() {
    uni.$off('goBack', this.initData)
    uni.$off('paymentSuccess', this.initData);
  },
  // 上拉加载
  onReachBottom() {
    this.scrolltolower();
  },

  methods: {
    initData() {
      setTimeout(() => {
        this.showLoading();
        this.getOrders(status);
      }, 300);
    },

    goContract(item) {
      if (item.status > 3) {
        this.$loc.open(`out/out?url=${encodeURIComponent(`${H5Url}contract/sign.html?id=${item.id}&token=${user.token}&source=uniapp`)}`);
      }
    },

    showModal(e) {
      this.beChangedOrder = e;
      this.isShow = true;
    },

    clickPay(e) {
      this.$loc.open(`contract/pay?order_id=${e.id}`);
    },

    cancel() {
      this.isShow = false;
    },

    confirm() {
      service('contract').cancel(this.beChangedOrder.id).then((res) => {
        if (res.data.error_code && res.data.error_code != 'SUCCESS') {
          return;
        }
        this.beChangedOrder.status = 0;
        this.isShow = false;
      })
    },

    scrolltolower() {
      if (currentPage < pageCount) {
        this.loadingType = 1;
        uni.showNavigationBarLoading();
        currentPage++;
        this.getOrders();
      } else {
        this.loadingType = 2;
        return;
      }
    },

    switchMenu(current) {
      this.noOrders = false;
			if (this.currentTab == current) {
				return false;
			} else {
				this.currentTab = current;
			}
    },

    swiperChange(event) {
      let index = event.target.current;
      this.currentTab = index;
      this.orders = [];
      if (index === 0) {
        status = 'ALL'
      }
      if (index === 1) {
        status = 'TOPAY'
      }
      if (index === 2) {
        status = 'FINISH'
      }
      if (index === 3) {
        status = 'CANCELED'
      }
      this.getOrders(status);
    },

    getOrders(status) {
      let query;
      if (status == 'ALL') {
        query = service('contract').queryByUser(user.id);
      } else {
        const data = {
          status: status,
        };
        query = service('contract').queryByUser(user.id, data);
      } 
      this.loadCacheData(
        {
          key: cacheKeys.pages.user.orders,
          beforeCache: this.beforeCache,
        }, 
        query, 'orders')
    },

    beforeCache(data) {
      this.hideLoading();
      uni.hideNavigationBarLoading();
      uni.stopPullDownRefresh();

      if (data.total_count == 0) {
        this.orders = [];
        this.noOrderText = '您还没有订单哦~';
        if (status === 'TOPAY') {
          this.noOrderText = '没有待付款的订单';
        }
        if (status === 'FINISH') {
          this.noOrderText = '没有已完成的订单';
        }
        if (status === 'CANCELED') {
          this.noOrderText = '没有已取消的订单';
        }
        this.noOrders = true;
        return this.orders;
      }
      pageCount = data.page_count;

      if (currentPage > 1) {
        this.orders = this.orders.concat(data.items);
      } else {
        this.orders = data.items;
      }

      this.orders = this.orders.filter(item => item.source != APPSOURCE);
      
      if (this.orders.length == 0) {
        this.noOrders = true;
      }

      if (currentPage >= pageCount) {
        this.loadingType = 2;
        return this.orders;
      }
      return this.orders
    },
    
    // 时间戳转换为时间
    getData(timestamp) {
      var date = new Date(timestamp * 1000);
      var Y = date.getFullYear() + '-';
      var M = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1) + '-';
      var D = (date.getDate() < 10 ? '0'+date.getDate() : date.getDate()) + ' ';
      var h = (date.getHours() < 10 ? '0'+date.getHours() : date.getHours()) + ':';
      var m = (date.getMinutes() < 10 ? '0'+date.getMinutes() : date.getMinutes()) + ':';
      var s = (date.getSeconds() < 10 ? '0'+date.getSeconds() : date.getSeconds());
      return Y+M+D+h+m+s;
    },

  },
}
</script>

<style scoped>
	.swiper-tab {
		display: flex;
		justify-content: space-around;
    position: fixed;
    top: 0;
    width: 100%;
    height: 80rpx;
		line-height: 80rpx;
		background: #fff;
    z-index: 5;
	}

	.swiper-tab-list {
		padding: 0 15rpx;
		font-size: 30rpx;
		color: #333;
	}

  .orders-box:first-child {
    margin-top: 100rpx;
  }

  .orders-box {
    position: relative;
    margin: 20rpx auto 0;
    width: 702rpx;
    padding: 30rpx;
    border: 2rpx solid #eee;
    box-sizing: border-box;
  }

  .active {
		color: #3b8bfd;
		border-bottom: 4rpx solid #3b8bfd;
	}

  .title {
    font-size: 28rpx;
    color: #333;
  }

  .fee {
    margin: 19rpx 0 10rpx;
    font-size: 22rpx;
    color: #ff0000;
  }

  .order-content text {
    display: block;
    width: 520rpx;
  }

  .txt {
    font-size: 22rpx;
    color: #666;
  }

  .order-button-box {
    display: flex;
    justify-content: flex-end;
    /* finish #2848 */
    margin: 27rpx 0 0 340rpx;
    width: 316rpx;
  }

  .order-button-box text {
    display: block;
    width: 150rpx;
    height: 52rpx;
    line-height: 52rpx;
    text-align: center;
    border-radius: 26rpx;
    font-size: 24rpx;
  }

  .cancel {
    background: #eee;
    color: #666;
  }

  .blue-btn {
    margin-left: 20rpx;
    background: #3b8bfd;
    color: #fff;
  }

  .no-order-records {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 267rpx;
  }

  .no-order-text {
    display: block;
    padding-top: 45rpx;
    font-size: 28rpx;
    color: #999999;
  }

  .right-txt {
    position: absolute;
    top: 30rpx;
    right: 30rpx;
    font-size: 24rpx;
  }

  .blue {
    color: #3b8bfd;
  }

  .gray {
    color: #666;
  }

</style>


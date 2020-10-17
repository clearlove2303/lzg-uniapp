<template>
  <view class="coupons">
    <view class="swiper-tab">
      <view v-for="(menuTab, index) in menuTabs" :key="index"
        :class="['swiper-tab-list', currentTab == index ? 'active' : '']"
        @click="switchMenu(index)">{{ menuTab.name }}</view>
    </view>
    <swiper :current="currentTab" class="swiper-box-list" :style="{height: windowHeight + 'px'}"
      duration="300" @change="swiperChange">
      <swiper-item v-for="(menuTab, index) in menuTabs" :key="index">
        <scroll-view scroll-y="true" v-if="coupons.length > 0" :style="{height: windowHeight + 'px'}">
          <view v-for="(item, index) in coupons" :key="index" class="coupons-box">
            <view
              class="coupons-box-top"
              :style="{backgroundColor: item.status === 'USED' || item.status === 'EXPIRED' ? '#bfbfbf' : '#7fc4ff'}"
            >
              <view class="coupons-type">
                <text class="coupons-txt">{{ item.type === 'CASH' ? '代金券' : '折扣券' }}</text>
              </view>
              <view class="coupons-amount">
                <text v-if="item.type === 'CASH'" class="coupons-amount-mark coupons-amount-price">￥</text>
                <text class="coupons-amount-num">{{ item.amount }}</text>
                <text v-if="item.type === 'DISCOUNT'" class="coupons-amount-mark">折</text>
              </view>
              <image src="../../static/img/img-line.png" class="waveline"></image>
            </view>
            <view class="coupons-box-bottom">
              <text v-if="item.status === 'VALID'" class="coupons-status">有效期:</text>
              <text v-if="item.status === 'USED'" class="coupons-status">已使用:</text>
              <text v-if="item.status === 'EXPIRED'" class="coupons-status">已过期:</text>

              <view class="coupons-valid coupons-status">
                <text class="coupons-status coupons-status-num">{{  getData(item.started_at) }}</text>
                <text class="coupons-status">至</text>
                <text class="coupons-status coupons-status-num" v-if="item.expired_at">{{ getData(item.expired_at)}}</text>
                <text class="coupons-status coupons-status-num" v-else>~</text>
              </view>
            </view>
          </view>
        </scroll-view>
        <view class="no-coupons" v-else>
          <text>{{ noCouponText }}</text>
        </view>
      </swiper-item>
    </swiper>
  </view>
</template>

<script>
import service from '@/common/service-loader'

let user = null;
let status;

export default {
  data() {
    return {
      current: 0,
      currentTab: 0,
      coupons: [],
      shadow: {},
      windowHeight: '',
      noCouponText: '没有优惠券',
      menuTabs: [{
        name: '全部'
      }, {
        name: '已使用'
      }, {
        name: '未使用'
      }, {
        name: '已过期'
      }],
    }
  },

  onLoad() {
    user = this.$jwt.user();
    status = 'ALL';
    const res = uni.getSystemInfoSync();
    this.windowHeight = res.windowHeight;
		this.getCoupons(status);
  },

  methods: {
    switchMenu(current) {
			if (this.currentTab == current) {
				return false;
			} else {
				this.currentTab = current;
			}
    },

    swiperChange(event) {
      let index = event.target.current;
      this.currentTab = index;
      this.coupons = [];
      if(index === 0) {
        status = 'ALL'
      }
      if(index === 1) {
        status = 'USED'
      }
      if(index === 2) {
        status = 'VALID'
      }
      if(index === 3) {
        status = 'EXPIRED'
      }
      this.getCoupons(status);
    },

    getCoupons(status) {
      if (status === 'ALL') {

        service('user').queryCoupons(user.id, {"per_page": 20}).then((res) => {
          this.handleCoupons(res, status)
        });
      } else {
        service('user').queryCoupons(user.id, {"per_page": 20, "status": status}).then((res) => {
          this.handleCoupons(res, status)
          console.log(res)
        });
      }
    },

    handleCoupons(res, status) {
      if ((res.data.error_code && res.data.error_code === "SUCCESS") || res.data.items == null) {
        this.coupons = [];
        this.noCouponText = '没有优惠券';
        if(status === 'USED') {
          this.noCouponText = '没有已使用的优惠券';
        }
        if(status === 'VALID') {
          this.noCouponText = '没有未使用的优惠券';
        }
        if(status === 'EXPIRED') {
          this.noCouponText = '没有已过期的优惠券';
        }
        return;
      }

      this.coupons = res.data.items;
    },

    // 时间戳转换为时间
    getData(timestamp) {
      var date = new Date(timestamp * 1000);
      var Y = date.getFullYear() + '-';
      var M = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1) + '-';
      var D = (date.getDate() < 10 ? '0'+date.getDate() : date.getDate()) + ' ';
      return Y+M+D;
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
		padding-left: 15rpx;
		padding-right: 15rpx;
		font-size: 30rpx;
		color: #333;
	}

  .coupons-box {
    margin: 30rpx auto 0;
    height: 220rpx;
    width: 702rpx;
    border-radius: 6rpx;
    box-shadow: 2rpx 3rpx 8rpx 0 rgba(0, 0, 0, 0.05);
  }

  .coupons-box:first-child {
    margin-top: 110rpx;
  }

  .coupons-type {
    width: 500rpx;
    height: 154rpx;
    border-right: 1rpx dashed #fff;
  }

  .coupons-txt {
    display: block;
    padding-top: 40rpx;
    padding-left: 31rpx;
    font-size: 42rpx;
    font-weight: bold;
    color: #fff;
    font-family: 'PingFang-SC-Bold';
  }

  .coupons-amount {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    flex: 1;
    padding-left: 21rpx;
  }

  .coupons-amount-mark {
    padding-top: 3rpx;
    padding-left: 8rpx;
    font-size: 42rpx;
    color: #ffffff;
  }

  .coupons-amount-price {
    padding-left: 0;
    padding-top: 5rpx;
  }

  .coupons-amount-num {
    font-size: 60rpx;
    color: #ffffff;
  }

  .waveline {
    position: absolute;
    bottom: 0rpx;
    width: 701rpx;
    height: 10rpx;
  }

  .coupons-box-bottom {
    display: flex;
    flex-direction: row;
    align-items: center;
    padding-left: 30rpx;
    padding-top: 11rpx;
  }

  .coupons-valid {
    display: flex;
    flex-direction: row;
    align-items: center;
    padding-left: 10rpx;
  }

  .coupons-status {
    color: #666;
    font-size: 20rpx;
  }

  .coupons-status-num {
    padding: 5rpx 10rpx 0;
  }

  .no-coupons {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 300rpx;
  }

  .coupons-box-top {
    display: flex;
    flex-direction: row;
    position: relative;
  }

  .active {
		color: #3b8bfd;
		border-bottom: 4rpx solid #3b8bfd;
	}
</style>


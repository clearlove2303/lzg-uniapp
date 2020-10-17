<template>
  <view class="wrapper">
    <scroll-view class="scroller" scroll-y="true" :style="{height: scrollerHeight + 'px'}">
      <view class="contract-pay-box">
        <view class="contract-pay">
          <view class="contract-title">
            <text class="pay-title">订单信息</text>
            <text class="pay-time">{{ new Date().getTime()/1000 | formatTime('yyyy.mm.dd') }}</text>
          </view>
          <view class="order-number">
            <text class="number-title">编号：</text>
            <text class="number-content">{{ contractNumber }}</text>
          </view>
          <view class="subject-box">
            <text class="subject-title">科目名</text>
            <list class="subject-list">
              <view v-for="subject in subjects" class="subject-cell" :key="subject.id">
                <text class="subject-name">{{ subject.name }}</text>
                <text class="subject-price">￥{{ subject.price }}</text>
              </view>
            </list>
            <view class="coupons-box" v-if="discountText">
              <text class="coupons-left">折扣券</text>
              <view class="coupons-right">
                <text class="coupons-text">{{ discount.title }}</text>
              </view>
            </view>
            <view class="coupons-box" v-if="cash.amount">
              <text class="coupons-left">代金券</text>
              <view class="coupons-right">
                <text class="coupons-text">￥{{ cash.amount }}.00</text>
              </view>
            </view>
          </view>
           <view class="total">
            <text class="total-text">合计</text>
            <view class="total-right">
              <view class="total-coupon" v-if="discountText || cash.amount">
                <text class="coupon-text">已优惠</text>
                <text class="coupon-fee">{{ `￥${(discountText + cash.amount).toFixed(2)}` }}</text>
              </view>
              <view class="total-fee">
                <text class="coupon-text">共计 ￥</text>
                <text class="total-price">{{ total }}</text>
                <view class="refresh">
                    <view
                    class="iconfont icon-shuaxin"
                    @click="refresh"
                    :animation="animationData"
                    v-if="source !== 3"></view>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>
      <view class="btn-pay">
        <view v-if="platform == 'ios'">
          <button class="alipay" @click="payment('iospay')">支付</button>
        </view>
        <view v-else>
          <button @click="payment('wxpay')">微信支付</button>
          <!--  #ifdef  APP-PLUS -->
          <button class="alipay"  @click="payment('alipay')">支付宝支付</button>
          <!--  #endif -->
        </view>
      </view>
    </scroll-view>
  </view>
</template>
<script>
import services from '@/common/service-loader';

const autoApply = 3;

let id = null;
let changePrice = null;
let discountMessage = null;
let gold = 0;

export default {
  data() {
    return {
      scrollerHeight: null,
      contractNumber: '',
      subjects: [],
      total: 0,
      fee: 0,
      cash: {
        amount: 0,
        title: null,
      },
      discount: {
        amount: 0,
        title: null,
      },
      source: 0,
      discountText: 0,
      animationData: {},
      openid: '',
      appid: '',
      platform: '',
    }
  },

  onLoad(option) {
    id = option.order_id;
    this.init();
    this.getGold();
    this.getContract();
    // #ifdef  MP-WEIXIN
    this.getOpenid();
    // #endif
  },

  methods: {
    async init() {
      let that = this;
      uni.getSystemInfo({
        success(res) {
          that.scrollerHeight = res.windowHeight;
          that.platform = res.platform;
        }
      })
    },

    getGold() {
      let user;
      user = this.$jwt.user();
      services('user').get(user.id).then((res) => {
        gold = res.data.gold;
      })
    },

    getContract() {
      services('contract').get(id).then((res) => {
        if (res.data.error_code && res.data.error_code != 'SUCCESS') {
          return;
        }
        this.handleContract(res.data);
      })
    },

    handleContract(data) {
      this.subjects = data.subjects;
      this.contractNumber = data.number;
      this.fee = data.original_fee;
      this.total = data.original_fee;
      this.source = data.source;
      // 获取Appid
      // this.getAppid(data.company_id);
      // 为了获得折扣信息
      this.getOrderData(data.order_id);
    },

    getOrderData(id) {
      services('contract').getOrder(id).then(res => {
        let user = null;
        this.discountText = res.data.default_discount;
        changePrice = res.data.default_coupon_id;
        discountMessage = res.data;

        user = this.$jwt.user();
        if (!user) {
          return;
        }

        this.getCouponData(user.id, discountMessage);
        // 关注过公众号的用户才能使用优惠券
        // if (user.is_subscribed) {
        //   this.getCouponData(user.id);
        // }
      }).catch(() => {
        // nothing to do
      })
    },

    /**
     * 获取用户优惠券
     * @param {number} id 用户id
     */
    async getCouponData(id, discountMessage) {
      let res;
      try {

        res = await services('user').queryCoupons(id, {"per_page": 20, "page": 1, "status": "VALID"});

      } catch(e) {
        console.log(e)
      }
      this.handleCoupons(res.data, discountMessage);
    },

    /**
     * 处理用户优惠券信息
     * @param {object} data 优惠券列表
     */
    handleCoupons(data, discountMessage) {
      if ((data.error_code && data.error_code !== 'SUCCESS')) {
        return;
      }
      if (this.source === autoApply) {
        this.bestSolution(data);
      } else {
        this.getOrder(data, discountMessage);
      }
      if (this.discountText) {
        // id没值则是改价的
        if (changePrice === null) {
          this.discount.title = "VIP专属折扣";
          this.total = (this.fee - this.discountText - parseFloat(this.cash.amount)).toFixed(2);
          return;
        }
        // id有值则是使用折扣卷
        if (this.discount.amount) { // 这里不应该使用最优解
          // this.discount.title = this.discount.amount + '折';
          this.discountText = this.fee * (10 - this.discount.amount) * 0.1;
        }
      } else {
        // 分校生产折扣卷（不会影响discountText的值）
        if (this.discount.amount) {
          // this.discount.title = this.discount.amount + '折';
          this.discountText = this.fee * (10 - this.discount.amount) * 0.1;
        }
      }
      this.total = (this.fee - this.discountText - parseFloat(this.cash.amount)).toFixed(2);
    },

    getOrder(data, discountMessage) {
      // 非自主报名
      this.cash.amount = 0;
      this.discountText = 0;
      if (discountMessage.error_code && discountMessage.error_code !== 'SUCCESS') {
        return;
      }

      if (discountMessage.coupon_discount) {
        this.cash = {
          amount: discountMessage.coupon_discount,
          title: discountMessage.coupon_discount + '元'
        }
      }

      if (discountMessage.default_discount) {
        this.discountText = discountMessage.default_discount;
        if (changePrice === null) {
          this.discount = {
            title: 'VIP专属优惠券'
          };
          return;
        }
        if (data.items !== null) {
          data.items.forEach(item => {
            if (item.type === 'DISCOUNT') {
              if( (this.fee - discountMessage.default_discount) / this.fee * 10 == item.amount) {
                this.discount = {
                  title: item.title
                }
              }
            }
          });
        };
      }
    },

    bestSolution(data) {
      // 最优解
      if (data.items !== null) {
        data.items.forEach(item => {
          if (item.type === 'CASH') {
            if (this.cash.id == undefined || item.amount >= this.cash.amount) {
              this.cash = Object.assign({}, item);
            }
          }

          if (item.type === 'DISCOUNT') {
            if (this.discount.id === undefined || item.amount <= this.discount.amount) {
              this.discount = Object.assign({}, item);
            }
          }
        });
      }
    },

    refresh() {
      // issue 2231 非自主报名增加刷新按钮
      this.getContract();

      var animation = uni.createAnimation({
        duration: 800,
        timingFunction: "ease",
      })
      this.animation = animation;

      animation.rotate(360).step();
      this.animationData = animation.export();
    },

    getOpenid() {
      const appid = wx.getAccountInfoSync().miniProgram.appId;
      const that = this;
      uni.login({
        provider: 'weixin',
        success: res => {
          if(!res.code) {
            return;
          }
          // 获取openid
          services('weixin').getSessionkey(appid, res.code).then((res) => {
            that.session_key = res.data.session_key;
            that.openid = res.data.openid;
          });
        },
      });
    },

    async payment(payType) {
      if (payType == 'iospay' && gold < this.total) {
        uni.showToast({
          title: '虚拟币不足，请充值',
          icon: 'none',
        });
        setTimeout(() => {
          this.$loc.open(`user/wallet`);
        }, 500)
        return;
      }
      let paysuccessdata;
      let data = this.handlePayInfoData(payType);
      
      services('contract').pay(id, data).then((res) => {
        if (res.data.error_code && res.data.error_code !== 'SUCCESS') {
          return;
        }
        if (payType == 'iospay') {
          uni.$emit('paymentSuccess');
          uni.showToast({
            title: '支付成功！',
            icon: 'none',
          });
          setTimeout(() => {
            this.$loc.back();
          }, 1000)
          return;
        }
        this.pay(res.data, payType);
      }).catch((error) => {
        console.log(error)
        if (error.statusText === 'Not Found') {
          uni.showToast({
            title: '当前支付不存在',
            icon: 'none',
          });
          return;
        }
        uni.showToast({
          title: error.statusText,
          icon: 'none',
        });
      })
    },

    // issue 2217 增加app微信支付
    // issue #2518 增加app支付宝支付
    pay(data, payType) {
      // #ifdef  MP-WEIXIN
      let res = JSON.parse(data);
      // #endif
      let that = this;
      uni.requestPayment({
        provider: payType,
        // #ifdef  MP-WEIXIN
        timeStamp: res.timeStamp,
        nonceStr: res.nonceStr,
        package: res.package,
        signType: res.signType,
        paySign: res.paySign,
        // #endif
        // #ifdef  APP-PLUS
        orderInfo: data,
        // #endif
        success: function(res) {
          that.$loc.open(`user/orders`);
          console.log('success:' + JSON.stringify(res));
        },
        fail: function(err) {
          console.log('fail:' + JSON.stringify(err));
        }
      })
    },

    handlePayInfoData(payType) {
      let data;
      if (payType == 'wxpay') {
        data = {
          // #ifdef  MP-WEIXIN 
          deal_type: 'MINIWEIXIN_JSAPI',
          openid: this.openid,
          // #endif
          // #ifdef  APP-PLUS
          deal_type: 'WEIXIN_APP',
          // #endif
        };
      } 
      if (payType == 'alipay') {
        data = {
          // #ifdef  APP-PLUS
          deal_type: 'ALIPAY_APP',
          // #endif
        };
      }
      if (payType == 'iospay') {
        data = {
          deal_type: 'APPLE_PAY',
        }
      }
      
      if (this.source !== autoApply) {
        return data;
      }

      if (this.cash.amount && this.discount.amount) {
        data.coupon_id = this.cash.id;
        data.default_coupon_id = this.discount.id;
      } else if (this.cash.amount && !this.discount.amount) {
        data.coupon_id = this.cash.id;
      } else if (!this.cash.amount && this.discount.amount) {
        data.default_coupon_id = this.discount.id;
      }
      return data;
    },
  }
}
</script>

<style scoped>
.wrapper {
  display: flex;
  justify-content: center;
  background-color: #f5f5f5;
}

.scroller {
  align-items: center;
}

.contract-pay-box {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 72rpx auto 52rpx;
  padding-bottom: 12rpx;
  width: 707rpx;
  background-color: #f3f3f3;
  border-radius: 10rpx;
}

.contract-pay {
  margin-top: 12rpx;
  padding: 40rpx 0;
  width: 683rpx;
  background-color: #fff;
  border-radius: 10rpx;
}

.contract-title {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding: 0 29rpx;
}

.pay-title {
  font-size: 48rpx;
  font-weight: bold;
  color: #333;
}

.pay-time {
  text-align: right;
  line-height: 62rpx;
  font-size: 24rpx;
  color: #666;
}

.order-number {
  display: flex;
  flex-direction: row;
  padding: 31rpx 29rpx 34rpx 29rpx;
  border-bottom: 1rpx solid #e5e5e5;
  font-size: 36rpx;
}

.number-title {
  line-height: 42rpx;
  color: #333;
}

.number-content {
  line-height: 42rpx;
  font-size: 32rpx;
  color: #007aff;
}

.subject-list {
  padding-bottom: 20rpx;
}

.subject-box {
  padding: 50rpx 29rpx 40rpx 29rpx;
}

.subject-title {
  font-size: 30rpx;
  font-weight: 500;
  color: #666;
}

.subject-cell {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding-top: 47rpx;
  padding-left: 62rpx;
  color: #333;
}

.subject-name {
  font-size: 36rpx;
  font-weight: 500;
}

.subject-price {
  font-size: 30rpx;
}

.coupons-box {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding-top: 20rpx;
}

.coupons-left {
  line-height: 40rpx;
  font-weight: 500;
  font-size: 30rpx;
  color: #666;
}

.coupons-right {
  flex-direction: row;
}

.coupons-text {
  line-height: 40rpx;
  font-weight: bold;
  font-size: 28rpx;
  color: #b81e1e;
}

.total {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding: 39rpx 34rpx 0 32rpx;
  border-top: 1rpx solid #e5e5e5;
}

.total-text {
  font-weight: 500;
  font-size: 28rpx;
  color: #333;
}

.total-right,
.total-coupon,
.total-fee {
  display: flex;
  justify-content: space-between;
  flex-direction: row;
}

.total-coupon {
  padding-right: 30rpx;
}

.coupon-text {
  line-height: 52rpx;
  font-size: 22rpx;
  color: #333;
}

.coupon-fee {
  line-height: 52rpx;
  font-size: 22rpx;
  color: #b81e1e;
}

.total-price {
  line-height: 52rpx;
  font-weight: bold;
  font-size: 44rpx;
  color: #b81e1e;
}

.btn-pay {
  display: flex;
  flex-direction: column;
}

.btn-pay button {
  margin-bottom: 40rpx;
  border-radius: 62rpx;
  background: #1aad19;
  width: 560rpx;
  color: #fff;
}

.refresh {
  padding: 7rpx 0 0 16rpx;
}

.icon-shuaxin {
  font-size: 20px;
  color: #333;
}

/* #ifdef  APP-PLUS */
.btn-pay .alipay {
  background: #3b8bfd;
}
/* #endif  */
</style>

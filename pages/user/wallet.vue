<template>
  <view class="wallet">
      <view class="header">当前余额：<text class="primary">{{ gold.toFixed(2) }}</text>学币</view>
      <view class="body">
        <text class="body-title">请选择充值金额</text>
        <view class="body-content">
          <view class="body-item" 
          v-for="(item, index) in goldItems" :key="index"
          @click="chooseGold(item)"
          :class="{'primary-botton': productId === item.id}">
            {{ item.id | filterGold }}学币
          </view>
        </view>
        <view class="pay-gold">支付金额：<text class='primary'>{{ productId | filterGold }}</text> 元</view>
        <button class="confirm" @click="confirmPay">确认支付</button>
      </view>
      <view class="footer">
        注意：<br />1.学币仅支持在来学宝典IOS版上购买课程使用; <br />2.充值成功后不可退回，请注意充值金额;<br />3.有任何疑问请咨询客服。
      </view>
  </view>
</template>
<script>
import services from '@/common/service-loader';

let iapChannel = null;
let user;

export default {
  data() {
    return {
      gold: 0,
      productId: '0',
      goldItems: [
        {
          id: 'com.laixue.gold1',
        },
        {
          id: 'com.laixue.gold6',
        },
        {
          id: 'com.laixue.gold12',
        },
        {
          id: 'com.laixue.gold18',
        },
        {
          id: 'com.laixue.gold50',
        },
        {
          id: 'com.laixue.gold98',
        },
        {
          id: 'com.laixue.gold198',
        },
        {
          id: 'com.laixue.gold488',
        },
        {
          id: 'com.laixue.gold998',
        },
        {
          id: 'com.laixue.gold1998',
        },
        {
          id: 'com.laixue.gold4998',
        },
        {
          id: 'com.laixue.gold6498',
        },
      ]
    }
  },

  filters: {
    filterGold(dataStr) {
      let str;
      str = dataStr.replace(/[^0-9]/ig, "");
      return str;
    },
  },

  onLoad() {
    this.queryUserInfo();
    this.retrieveOrderItems();
  },

  methods: {
    retrieveOrderItems() {
      this.showLoading();
      let IAPOrders = [];
      for (let item of this.goldItems) {
        IAPOrders.push(item.id);
      }
      plus.payment.getChannels((channels) => {
        for (let i = 0; i < channels.length; i += 1) {
          if (channels[i].id === 'appleiap') {
            iapChannel = channels[i];
            break;
          }
        }

        if (iapChannel === null) {
          uni.showToast({
            title: '获取支付通道失败，确保支付通道已开启',
            icon: 'none'
          });
          return;
        }
        iapChannel.requestOrder(IAPOrders, (items) => {
        }, (error) => {
          console.log(`获取支付通道失败：${error.message}`)
        })
        this.hideLoading();
      },(error) => {
        uni.showToast({
          title: `获取支付通道失败: ${error.message}`,
          icon: 'none'
        });
        this.hideLoading();
      });
    },

    queryUserInfo() {
      user = this.$jwt.user();
      services('user').get(user.id).then((res) => {
        if (res.data.error_code && res.data.error_code !== 'SUCCESS') {
          return;
        }
        this.gold = res.data.gold;
      })
    },

    chooseGold(item) {
      this.productId = item.id;
    },

    confirmPay() {
      if (this.productId == '0') {
        uni.showToast({
          title: '您还没有选择充值金额~',
          icon: 'none',
        });
        return;
      }
      this.showLoading();

      plus.payment.request(iapChannel, {
        productid: `${this.productId}`,
        username: user.id,
      }, (e) => {
        this.hideLoading();
        this.bugGolds(e);
      }, (error) => {
        this.hideLoading();

        uni.showToast({
          title: `支付失败：${error.code}`,
          icon: 'none'
        });
      });
    },

    bugGolds(data) {
      services('user').bugGolds(data).then((res) => {
        if (res.data.error_code && res.data.error_code !== 'SUCCESS') {
          return;
        }
        setTimeout(()=> {
          this.queryUserInfo();
        }, 2000);
      })
    }
  }
}
</script>
<style scoped>
 .wallet {
   margin: 0 auto;
   width: 702rpx;
 }

 .header {
   padding: 30rpx 0;
   font-size: 34rpx;
   font-weight: bold;
   color: #000;
 }

 .primary {
   color: #3b8bfd;
 }

 .body-title {
   font-size: 24rpx;
   font-weight: 500;
   color: #666;
 }

 .body-content {
   display: flex;
   justify-content: space-between;
   flex-wrap: wrap;
 }

 .body-item {
   margin-top: 20rpx;
   width: 341rpx;
   height: 88rpx;
   border: 1rpx solid #e4e4e4;
   text-align: center;
   line-height: 88rpx;
   font-size: 30rpx;
   font-weight: bold;
   color: #000;
 }

 .primary-botton {
   color: #3b8bfd;
   border: 1rpx solid #3b8bfd;
 }

 .pay-gold {
   padding-top: 40rpx;
   font-size: 30rpx;
   font-weight: bold;
   color: #000;
 }

 .confirm {
   margin-top: 19rpx;
   height: 88rpx;
   font-size: 30rpx;
   text-align: center;
   line-height: 88rpx;
   color: #fff;
   background: #3b8bfd;
   font-weight: bold;
 }

 .footer {
   padding-top: 40rpx;
   font-size: 24rpx;
   font-weight: bold;
   color: #000;
   line-height: 38rpx;
 }
</style>
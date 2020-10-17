<template>
  <view class="page-content" :style="{height: windowHeight + 'px'}">
    <view class="content-padded title-explain">
      <text>
        申请成为VIP后可以享受相关考试科目的精品视频课程（点播+直播）、来学宝典题库（桌面版+手机版）以及考前重点资料。
      </text>
    </view>
    <view class="title-tip" v-if="items">
      <text class="title-txt" v-for="(item, index) in items" :key="index">
        {{ item.title }}&nbsp;{{ item.price }}
      </text>
      <text class="title-txt title-bottom">
        升级VIP会员可以享受单个考试所有的题库和视频课程
      </text>
    </view>
    <view class="content-padded">
      <button type="primary" @click="submitOrder">确定升级</button>
    </view>
    <view class="title-tip">
      <text class="title-txt">
        如果您更换了手机，且之前已经购买该课程VIP，请点击下面按钮恢复VIP
      </text>
    </view>
    <view class="content-padded">
      <button type="primary" @click="getBuyedCourses">恢复VIP会员</button>
    </view>
    <modal
      :show="isShow"
      title= "提示"
      confirmText="确认升级"
      :noCancel="true"
      cancelText="取消"
      @cancel='cancel'
      text="您正在购买来学宝典VIP会员，请确认"
      :textShow= "true"
      @confirm='confirm'></modal>
  </view>
</template>
<script>
import modal from '@/components/custom/modal.vue'

let iapChannel = null;
let productId;
let user;

export default {
  name: 'vip',
  components: {
    modal,
  },
  data() {
    return {
      windowHeight: '',
      items: null,
      isShow: false,
    }
  },
  created() {
    this.retrieveOrderItems();
  },
  onLoad() {
    const res = uni.getSystemInfoSync();
    this.windowHeight = res.windowHeight;
  },
  methods: {
    retrieveOrderItems() {
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

        uni.showToast({
          title: '检测支付环境...',
          icon: 'none'
        });

        iapChannel.requestOrder(['1'], (items) => {
          this.items = items;
          productId = items[0].productid;
        }, (error) => {
          uni.showToast({
            title: `获取商品列表失败: ${error.code} ${error.message}`,
            icon: 'none'
          });
        });
      },(error) => {
        uni.showToast({
          title: `获取支付通道失败: ${error.message}`,
          icon: 'none'
        });
      });
    },

    cancel() {
      this.isShow = false;
    },
    /**
     * 提交订单
     */
    confirm() {
      user = uni.getStorageSync('user');
      plus.payment.request(iapChannel, {
        productid: productId,
        username: user.id,
      }, () => {
        http.post(`user/vip-upgrade?access-token=${user.token}`, () => {
          uni.showToast({
            title: '升级成功，请重新登录',
            icon: 'none'
          });

          // 退出登录
          this.logout();
        }).catch(() => {
          // issue #3003 添加了个升级失败提示
          uni.showToast({
            title: '升级失败',
            icon: 'none'
          });
        })
      }, (error) => {
        uni.showToast({
          title: `支付失败：${error.code}`,
          icon: 'none'
        });
      });
    },

    submitOrder() {
      this.isShow = true;
    },
    getBuyedCourses() {
      iapChannel.restoreComplateRequest({}, () => {
        uni.showToast({
          title: '获取已经购买VIP课程成功，请重新登录',
          icon: 'none'
        });

        // 退出登录
        this.logout();
      });
    },
    logout() {
      this.$store.commit('logout');
      this.goLogin();
    },
  }
}
</script>
<style scoped>
  .page-content {
    border-top: 1px solid #ddd;
    background: #eee;
  }
  .content-padded {
    padding: 8px;
  }
  .title-explain {
    margin: 0 auto 20rpx 0;
    width: 93%;
    font-size: 30rpx;
    line-height: 50rpx;
    font-weight: bold;
  }
  .title-tip {
    padding: 10rpx 0;
    font-size: 30rpx;
    line-height:30rpx;
    background: #fff;
  }
  .title-txt {
    display: block;
    margin: 0 auto;
    width: 93%;
  }
  .title-bottom {
    margin-top: 4rpx;
    font-size: 26rpx;
    color:#999;
  }
</style>

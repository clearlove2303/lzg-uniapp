<template>
  <view class="wrapper">
    <view class="main">
      <view class="old">
        <text class="old-text">当前手机号码</text>
        <text class="old-phone">{{ phone }}</text>
      </view>
      <view class="logoffform-input">
        <input class="m-input captcha" type="text" v-model="captcha" placeholder="请输入验证码">
        <button type="primary" class="captcha-button" :disabled="disabled" @tap="getCaptcha('tool.sms-sender')">
          {{count}}<text v-if="showCount">s</text>
        </button>
      </view>
      <button class="change" @tap="confirm()">确认注销</button>
    </view>
  </view>
</template>

<script>
import { mapState, mapMutations } from "vuex";
import services from '@/common/service-loader';

let userId = null,
    reason = null,
    clear = null;

export default {
  data() {
    return {
      phone: '未绑定手机号码',
      captcha: '',
      count: '获取验证码',
      disabled: false,
      showCount: false,
    }
  },

  onLoad(option) {
    let user = this.$jwt.user();
    userId = user.id;
    reason = option.reason;
    this.getPhone();
  },

  onUnload() {
    clearInterval(clear);
  },

  methods: {
    getPhone() {
      services('user').getPhone(userId).then((res) => {
        if (res.data.error_code && res.data.error_code !== 'SUCCESS') {
          return;
        }
        this.phone = res.data.items[0].user;
      })
    },

    getCaptcha(name) {
      services('tool').sendMessage(name, this.phone, 'verify').then((res) => {
        if (res.data.error_code && res.data.error_code !== 'SUCCESS') {
          return;
        }

        this.count = 60;
        this.showCount = true;
        clear = setInterval(this.countDown, 1000);
        this.disabled = true;
      })
    },

    // 倒计时
		countDown() {
			if (this.count <= 0){
        this.disabled = false;
        this.showCount = false;
        this.count = '获取验证码';
				clearInterval(clear);
			} else {
				--this.count;
			}
		},

    confirm() {
      if (this.captcha === '') {
        uni.showToast({
          title: '验证码不能为空',
          icon: 'none',
        });
        return;
      }

      services('tool').verificationCaptcha(this.phone, this.captcha).then((res) => {
        if (res.data.error_code && res.data.error_code!== "SUCCESS") {
          uni.showToast({
            title: '验证码错误，请重新获取',
            icon: 'none',
          });
          return;
        }
        this.logoff();
      }).catch(e => {
        uni.showToast({
          title: '验证码错误，请重新获取',
          icon: 'none',
        });
      })
    },

    logoff() {
      services('user').logoff(userId, reason).then((res) => {
        if (res.data.error_code) {
          return;
        }
        uni.showToast({
          title: '注销成功！',
          icon: 'none',
        });

        this.$store.commit('logout');
        uni.$emit('logout', {logout: true})
        this.goLogin();
      })
    }
  }
}
</script>

<style scoped>
.wrapper {
  margin: 0 auto;
  width: 702rpx;
}
.main {
  padding-top: 40rpx;
  width: 702rpx;
}

.old {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding: 0 30rpx;
}

.old-text {
  line-height: 88rpx;
  font-weight: 500;
  font-size: 30rpx;
  color: #000;
}

.old-phone {
  line-height: 88rpx;
  font-weight: 500;
  font-size: 30rpx;
  color: #666666;
}

.change {
  margin-top: 40rpx;
  width: 702rpx;
  height: 88rpx;
  line-height: 88rpx;
  color: #fff;
  font-size: 34rpx;
  font-weight: 500;
  border-radius: 44rpx;
  background: #3b8bfd;
}

.logoffform-input {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20rpx;
  width: 702rpx;
  height: 88rpx;
  padding: 0 30rpx;
  border-radius: 6rpx;
  border: 1rpx solid #eee;
  box-sizing: border-box;
  background: #fff;
}
.m-input {
  font-size: 30rpx;
  color: #000;
}
.captcha-button {
  margin: 0;
  width: 150rpx;
  height: 60rpx;
  padding: 0!important;
  border: 2rpx solid #3b8bfd;
  border-radius: 100rpx;
  background: #fff!important;
  color: #3b8bfd;
  font-size: 24rpx;
  font-weight: 500;
}

.btn {
  padding-top: 20rpx;
  align-items: center;
}

button::after {
  border: none;
}
</style>

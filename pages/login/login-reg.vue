<template>
  <view class="reg" :style="{height: screenHeight + 'px'}">
    <view class="reg-title">欢迎新用户</view>
    <view class="reg-description">来学网，懂你所需，更懂教育</view>
    <view class="form-group">
      <text class="group-text">手机号</text>
      <input type="number" placeholder="请输入您的手机号码" v-model="phone">
    </view>
    <view class="form-group">
      <text class="group-text">验证码</text>
      <input type="number" placeholder="请输入4位验证码" v-model="captcha">
      <button class="captcha-button" :disabled="disabled" @click="getCaptcha('tool.sms-sender')">
        {{ count }}
        <text v-if="showCount">s</text>
      </button>
    </view>
    <view class="form-group">
      <text class="group-text">新密码</text>
      <input type="password" placeholder="请输入 6-20 位密码" v-model="password">
    </view>
    <view class="form-group">
      <text class="group-text">确认密码</text>
      <input type="password" placeholder="请确认密码" v-model="newPassword">
    </view>
    <button class="reg-button" @click="reg" :disabled="!checked">注册</button>
    <view class="tts-captcha" @click="getCaptcha('tool.tts-sender')" v-if="showTtsCaptcha">收不到验证码？</view>
    <checkbox-group class="checkbox-group" @change="checkboxChange">
      <checkbox :checked="checked" class="checkbox"></checkbox>
      <view class="label-text">我已阅读并同意
        <text class="blue" @click="goPage('privacy')">《隐私政策》</text>和
        <text class="blue" @click="goPage('agreement')">《用户协议》</text>
      </view>
    </checkbox-group>
  </view>
</template>
<script>
import services from '@/common/service-loader';

let clear;
export default {
  data() {
    return {
      phone: '',
      captcha: '',
      password: '',
      newPassword: '',
      count: '获取验证码',
      disabled: false,
      showCount: false,
      showTtsCaptcha: true,
      checked: true,
      screenHeight: '',
    }
  },

  watch: {
    checked() {
      this.disabled = !this.disabled;
    }
  },

  onUnload() {
    clearInterval(clear);
  },
  
  onLoad() {
    const res = uni.getSystemInfoSync();
    this.screenHeight = res.screenHeight - 120;
  },

  methods: {
    getCaptcha(name) {
      if (!this.checked) {
        return;
      }
      if (!this.phone) {
        uni.showToast({
					title: '手机号码不能为空',
					icon: 'none',
        });
        return;
      }
      if (!(/^[1][3-9][0-9]{9}$/.test(this.phone))) {
				uni.showToast({
					title: '手机号码格式错误',
					icon: 'none',
				});
				return;
      }
      if (this.count > 0) {
        return;
      }

      services('user').check(this.phone).then((res) => {
        if (res.data.error_code && res.data.error_code !== 'SUCCESS') {
          return;
        }
        if (res.data.registered == 1) {
          uni.showToast({
            title: '手机号码已注册，请登录',
            icon: 'none'
          });
          return;
        }
        this.sendCaptcha(name);
      })
    },
    sendCaptcha(name) {
      if (!this.showTtsCaptcha) {
        name = 'tool.tts-sender';
      }
      services('tool').sendMessage(name, this.phone, 'reg').then((res) => {
        if (res.data.error_code && res.data.error_code !== 'SUCCESS') {
          return;
        }
        if (name == 'tool.tts-sender') {
          this.showTtsCaptcha = false;
        }
        this.count = 60;
        this.showCount = true;
        this.disabled = true;
        clear = setInterval(this.countDown, 1000);
      })
    },
    countDown() {
			if (this.count <= 0) {
        this.disabled = false;
        this.showCount = false;
        this.count = '获取验证码';
				clearInterval(clear);
			} else {
        --this.count;
			}
    },
    reg() {
      if (!this.phone) {
        uni.showToast({
					title: '手机号码不能为空',
					icon: 'none',
        });
        return;
      }
      if (!(/^[1][3-9][0-9]{9}$/.test(this.phone))) {
				uni.showToast({
					title: '手机号码格式错误',
					icon: 'none',
				});
				return;
      }
      if (!this.captcha) {
        uni.showToast({
					title: '验证码不能为空',
					icon: 'none',
        });
        return;
      }
      if (!(/^[0-9]{4}$/.test(this.captcha))) {
        // issue #2936
				uni.showToast({
					title: '验证码错误，请重新获取',
					icon: 'none',
				});
				return;
      }
      if (!this.password) {
        uni.showToast({
					title: '密码不能为空',
					icon: 'none',
        });
        return;
      }
      if (!this.newPassword) {
        uni.showToast({
					title: '确认密码不能为空',
					icon: 'none',
        });
        return;
      }
      if (this.password.length > 20 || this.password.length < 6) {
        uni.showToast({
					title: '密码长度为6-20位，请重输',
					icon: 'none',
				});
        return;
      }
      if (this.password != this.newPassword) {
        uni.showToast({
					title: '密码不一致，请重输',
					icon: 'none',
				});
				return;
      }
      services('user').reg({"pass": this.password, "captcha": this.captcha, "user": this.phone, "type": "pass"}).then((res) => {
        if (res.data.error_code && res.data.error_code !== 'SUCCESS') {
          return;
        }
        uni.showToast({
          title: '注册成功，请登录',
          icon: 'none'
        });
        this.$loc.open(`login/login?url=reg`);
      }).catch((error) => {
        uni.showToast({
          title: '验证码错误，请重新获取',
          icon: 'none'
        });
      })
    },
    checkboxChange() {
      this.checked = !this.checked;
    },
    goPage(page) {
      if (page === 'privacy') {
        this.$loc.open(`user/privacy`);
        return;
      }
      if (page === 'agreement') {
        this.$loc.open(`user/agreement`);
        return;
      }
    }
  }
}
</script>
<style lang="less" scoped>
  .reg {
    position: relative;
    padding-top: 120rpx;
  }
  .reg-title,
  .reg-description {
    text-align: center;
  }
  .reg-title {
    margin-bottom: 28rpx;
    height: 36rpx;
    font-size: 36rpx;
    color: #333;
    font-weight: bold;
  }
  .reg-description {
    margin-bottom: 116rpx;
    height: 24rpx;
    font-size: 24rpx;
    color: #999;
  }
  .form-group {
    display: flex;
    align-items: center;
    margin-left: auto;
    margin-right: auto;
    margin-bottom: 46rpx;
    padding-left: 10rpx;
    padding-bottom: 30rpx;
    width: 650rpx;
    height: 30rpx;
    border-bottom: 2rpx solid #ccc;

    .group-text {
      display: flex;
      width: 155rpx;
      font-size: 30rpx;
      color: #333;
    }

    input {
      width: 375rpx;
      font-size: 30rpx;
      color: #333;
    }

    input::placeholder {
      color: #999;
    }
    .captcha-button {
      margin: 0;
      padding: 0;
      width: 120rpx;
      border: 0;
      font-size: 24rpx;
      color: #237ee2;
      line-height: normal;
      background-color: transparent;
    }
  }
  .reg-button {
    margin-left: auto;
    margin-right: auto;
    margin-top: 80rpx;
    margin-bottom: 29rpx;
    width: 650rpx;
    height: 84rpx;
    font-size: 36rpx;
    color: #fff;
    border-radius: 50rpx;
    background: #237ee2;
  }
  .tts-captcha {
    display: flex;
    flex-direction: row-reverse;
    margin-left: auto;
    margin-right: auto;
    width: 650rpx;
    height: 28rpx;
    font-size: 28rpx;
    color: #333;
  }
  button::after {
    border: none;
  }
  .checkbox-group {
    display: flex;
    align-items: center;
    margin: 200rpx auto 0;
    width: 500rpx;
    color: #999;
  }
  .label-text {
    font-size: 22rpx;
  }
  .blue {
    color: #237ee2;
    font-weight: 500;
  }
  .checkbox {
    width: 40rpx;
    height: 60rpx;
    margin-right: 11rpx;
    transform: scale(0.8);
  }
</style>

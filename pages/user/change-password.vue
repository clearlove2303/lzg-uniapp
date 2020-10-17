<template>
	<view class="wrapper">
    <view class="main">
      <view class="old">
        <text class="old-text">当前手机号码</text>
        <text class="old-phone">{{ phone }}</text>
      </view>
      <view class="loginform-input">
        <input class="m-input captcha" type="text" v-model="captcha" placeholder="请输入验证码">
        <button type="primary" class="captcha-button" :disabled="disabled" @tap="getCaptcha('tool.sms-sender')">
          {{count}}<text v-if="showCount">s</text>
        </button>
      </view>
      <view class="loginform-input">
        <input class="m-input password" type="password" v-model="password" placeholder="请输入新密码">
      </view>
      <view class="voice-captcha" v-if="notDialed">
        <text class="voice-text">短信验证码没收到？</text>
        <text
          class="btn-voice-captcha"
          @tap="getCaptcha('tool.tts-sender')">试试语音验证码</text>
      </view>
      <button class="change" @tap="changePassword()">确认修改</button>
    </view>
  </view>
</template>

<script>
import service from '@/common/service-loader'
import { mapState, mapMutations } from "vuex";

let clear;
let userId = null;

export default {
	data() {
		return {
			phone: '未绑定手机号',
      captcha: '',
      password: '',
			count: '获取验证码',
      disabled: false,
      showCount: false,
      // finish #1768
      notDialed: true,
		}
  },

  onLoad() {
    this.init();
  },

  onUnload() {
    clearInterval(clear);
  },

	methods: {
    init() {
      let user = null;
      user = this.$jwt.user();
      userId = user.id;
      this.getPhone(user.id)
    },

    getPhone(id) {
      service('user').getPhone(id).then((res) => {
        if (res.data.error_code && res.data.error_code !== 'SUCCESS') {
          return;
        }
        this.phone = res.data.items[0].user;
      }).catch(() => {
        // nothing to do
      })
    },

    checkphone() {
      if(!(/^[1][3-9][0-9]{9}$/.test(this.phone))) {
				uni.showToast({
					title: '手机号码格式错误',
					icon: 'none',
				});
				return;
      }
    },

		changePassword() {
			if(this.captcha === '' || this.password === '') {
				uni.showToast({
					title: '验证码和密码不能为空',
					icon: 'none',
				});
				return;
      }
      if(!(/^[a-zA-Z0-9]{6,20}$/.test(this.password))) {
				uni.showToast({
					title: '密码要求6到20个字符',
					icon: 'none',
				});
				return;
			}
      this.checkphone();
			this.change();
    },

    // 重置密码
    change() {
      service('user').resetPassword(userId, {"captcha": this.captcha, "password": this.password, "phone": this.phone}).then(res => {
        if (res.data.error_code !== 'SUCCESS') {
           uni.showToast({
             title: '验证码错误，请重新获取',
             icon: 'none',
           });
           return;
        }
        uni.showToast({
          title: '修改密码成功！',
          icon: 'none',
        });

        this.$store.commit('logout');
        uni.$emit('logout', {logout: true})
        this.goLogin();
      }).catch(() => {
        uni.showToast({
          title: '验证码错误，请重新获取',
          icon: 'none',
        });
        return;
      })
    },

    // 获取验证码
    getCaptcha(name) {
      // finish #1768
      if (this.count > 0) {
        return;
      }

      if(this.phone === '') {
				uni.showToast({
					title: '手机号码不能为空',
					icon: 'none',
				});
				return;
			}
      this.checkphone();
      if (name === 'tool.tts-sender') {
        this.notDialed = false;
      }
      if (this.notDialed === false) {
        name = 'tool.tts-sender';
      }

      service('tool').sendMessage(name, this.phone, 'reset').then((res) => {
        if (res.data.error_code && res.data.error_code !== 'SUCCESS') {
          return;
        }

        this.count = 60;
        this.showCount = true;
				clear = setInterval(this.countDown,1000);
        this.disabled = true;
      })
    },

		// 倒计时
		countDown() {
      // finish #1768
			if(this.count <= 0){
				this.disabled = false;
        this.count = '获取验证码';
        this.showCount = false;
				clearInterval(clear);
			} else {
				--this.count;
			}
		},
	}
}
</script>

<style scoped>
.main {
  margin: 0 auto;
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
  color: #666;
}

.loginform-input {
  display: flex;
  position: relative;
  align-items: center;
  margin-top: 20rpx;
  padding: 0 30rpx;
  border: 2rpx solid #eee;
  border-radius: 6rpx;
  height: 88rpx;
  background: #fff;
}

.m-input {
  font-size: 30rpx;
  color: #999;
}

.captcha-button {
  position: absolute;
  right: 30rpx;
  top: 15rpx;
  width: 150rpx;
  height: 60rpx;
  padding: 0!important;
  line-height: 60rpx;
  text-align: center;
  border: 2rpx solid #3b8bfd;
  border-radius: 100rpx;
  color: #3b8bfd;
  background: #fff!important;
  font-size: 24rpx;
  font-weight: 500;
}

.change {
  margin-top: 40rpx;
  border-radius: 44rpx;
  width: 702rpx;
  height: 88rpx;
  line-height: 88rpx;
  color: #fff;
  font-size: 34rpx;
  font-weight: 500;
  background: #3b8bfd;

}

button::after {
  border: none;
}

.voice-captcha {
  padding-left: 30rpx;
}

.voice-text,
.btn-voice-captcha {
  font-size: 28rpx;
}

.btn-voice-captcha {
  color: #3b8bfd;
}
</style>

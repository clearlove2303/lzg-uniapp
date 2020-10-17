<template>
  <view class="wrapper">
    <view class="form-content">
      <view class="title">
        <text class="title-text title-login">填写需要找回的账号</text>
      </view>
      <view class="forget-input align-center">
        <text class="forget-text">手机号</text>
        <input class="m-input phone" type="text" v-model="phone" placeholder="请输入您的手机号码">
      </view>
      <view class="forget-input">
        <view class="align-center">
          <text class="forget-text">验证码</text>
          <input class="m-input captcha" type="text" v-model="captcha" placeholder="请输入4位验证码">
        </view>
        <button class="captcha-button" :disabled="disabled" @tap="getCaptcha('tool.sms-sender')">
          {{count}}<text v-if="showCount">s</text>
        </button>
      </view>
      <view class="forget-input align-center">
        <text class="forget-text">新密码</text>
        <input class="m-input phone" type="password" v-model="password" placeholder="请输入6-20位新密码">
      </view>
      <view class="forget-input align-center">
        <text class="forget-text">确认密码</text>
        <input class="m-input phone" type="password" v-model="confirmPassword" placeholder="请确认密码">
      </view>
      <!-- finish #2294 -->
      <view class="input-button">
        <button type="primary" class="primary" @click="clickChangePassword()">确认修改</button>
      </view>
      <view class="tts" v-if="notDialed">
        <text class="tts-btn" @tap="getCaptcha('tool.tts-sender')">收不到验证码？</text>
      </view>
    </view>
  </view>
</template>

<script>
  import services from '@/common/service-loader';
  let clear;
	export default {
		data() {
			return {
        phone:'',
        password: '',
        count: '获取验证码',
        disabled: false,
        confirmPassword: '',
        showCount: false,
        notDialed: true,
        captcha: '',
			}
    },

    onUnload() {
      clearInterval(clear);
    },

		methods: {
      getCaptcha(name) {
        if (this.count > 0) {
          return;
        }

        if (this.phone == '') {
          uni.showToast({
            title: '手机号码不能为空',
            icon: 'none',
          });
          return;
        }

        if (!(/^[1][3-9][0-9]{9}$/.test(this.phone))) {
          uni.showToast({
            title: '手机号码错误',
            icon: 'none',
          });
          return;
        }

        services('user').check(this.phone).then((res) => {
          if (res.data.error_code && res.data.error_code !== 'SUCCESS') {
            return;
          }

          if (res.data.registered === 0) {
            uni.showToast({
              title: '手机号码不存在，请注册',
              icon: 'none',
            });
            return;
          }

          // finish #2294
          if (name === 'tool.tts-sender') {
            this.notDialed = false;
          }
          if (this.notDialed === false) {
            name = 'tool.tts-sender';
          }

          services('tool').sendMessage(name, this.phone, 'reset').then((res) => {
            if (res.data.error_code && res.data.error_code !== 'SUCCESS') {
              return;
            }

            this.count = 60;
            this.disabled = true;
            this.showCount = true;
            clear = setInterval(this.countDown, 1000);
          })
        })
      },

      clickChangePassword() {
        /* fix issue #2023 */
        if (this.phone == '') {
          uni.showToast({
            title: '手机号码不能为空',
            icon: 'none',
          });
          return;
        }

        if (!(/^[1][3-9][0-9]{9}$/.test(this.phone))) {
          uni.showToast({
            title: '手机号码错误',
            icon: 'none',
          });
          return;
        }

        if (this.captcha === '' || this.password === '') {
          uni.showToast({
            title: '验证码和密码不能为空',
            icon: 'none',
          });
          return;
        }

        if (this.confirmPassword === '') {
          uni.showToast({
            title: '确认密码不能为空',
            icon: 'none',
          });
          return;
        }

        if (this.password.length > 20 || this.password.length < 6) {
          uni.showToast({
            title: '密码要求6到20个字符',
            icon: 'none',
          });
          return;
        }

        if (this.confirmPassword !== this.password) {
          uni.showToast({
            title: '密码不一致，请检查',
            icon: 'none',
          });
          return;
        }
        this.changePassword();
      },

      changePassword() {
        services('user').changePassword(this.phone, this.captcha, this.password).then((res)=> {
          if (res.data.error_code && res.data.error_code !== 'SUCCESS') {
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
          this.$jwt.remove();
          // finish #2541
          setTimeout(() => {
            this.$loc.open(`login/login?url=forget`);
          }, 1500);
        }).catch(() => {
          uni.showToast({
            title: '验证码错误，请重新获取',
            icon: 'none',
          });
          return;
        })
      },

      countDown() {
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
.wrapper {
  width: 750rpx;
  height: 1334rpx;
  background: #fff;
}

.logo {
  margin: 100rpx 250rpx;
  width: 250rpx;
  height: 250rpx;
}

.logo image{
  width: 250rpx;
  height: 250rpx;
}

.form-content {
  margin: 0 auto;
  width: 650rpx;
  box-sizing: border-box;
}

.title {
  margin: 0 auto 80rpx;
  padding-top: 120rpx;
  text-align: center;
  color: #333;
  font-size: 36rpx;
  font-weight: 500;
}

.forget-input {
  display: flex;
  justify-content: flex-start;
  margin: 20rpx auto 0;
  width: 650rpx;
  height: 90rpx;
  border-bottom: 1px solid #ccc; /* fix issue #2078 */
  color: #333;
  font-size: 30rpx;
}

.forget-input input {
  width: 310rpx;
}

.forget-input input {
  color: #333;
}

.forget-text {
  display: inline-block;
  width: 150rpx;
}

.input-button {
  margin-top: 80rpx;
}

.primary {
  margin: 0 auto;
  width: 650rpx;
  height: 84rpx;
  line-height: 84rpx;
  font-size: 36rpx;
  color: #fff;
  background: #237ee2;
  border-radius: 42rpx;
}

button::after {
  border: none;
}

.align-center {
  display: flex;
  justify-content: flex-start;
  align-items: center;
}

.captcha-button {
  /* finish #2847 */
  margin: 18rpx 0 0;
  padding: 0;
  color: #1d8fe2;
  font-size: 24rpx;
  background: none!important;
}

.tts {
  width: 582rpx;
  margin: 29rpx auto 0;
  text-align: right;
  box-sizing: border-box;
}

.tts-btn {
  font-size: 28rpx;
  color: #333;
}
</style>

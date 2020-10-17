<template>
  <view class="wrapper">
    <view class="main">
      <view class="old">
        <text class="old-text">当前手机号码</text>
        <text class="old-phone">{{ oldPhone }}</text>
      </view>
      <view class="loginform-input">
        <input type="text" v-model="newPhone" placeholder="请输入新手机号码" class="m-input">
      </view>
      <view class="loginform-input">
        <input class="m-input captcha" type="text" v-model="captcha" placeholder="请输入验证码">
        <button type="primary" class="captcha-button" :disabled="disabled" @tap="getCaptcha('tool.sms-sender')">
          {{count}}<text v-if="showCount">s</text>
        </button>
      </view>
      <button class="change" @tap="changePhone()">确认修改</button>
    </view>
  </view>
</template>

<script>
import service from '@/common/service-loader'
import { mapState, mapMutations } from "vuex";

let userId;
let clear;

export default {
  data() {
    return {
      oldPhone: '未绑定手机号码',
      newPhone: '',
      captcha: '',
      count: '获取验证码',
      disabled: false,
      showCount: false,
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
      this.getPhone();
    },

    getPhone() {
      service('user').getPhone(userId).then((res) => {
        if (res.data.error_code && res.data.error_code !== 'SUCCESS') {
          return;
        }
        this.oldPhone = res.data.items[0].user;
      })
    },

    checkphone(id) {
      if (this.newPhone.length === 0) {
        uni.showToast({
          title: '手机号不能为空',
          icon: 'none',
        });
        return;
      }
      if(!(/^[1][3-9][0-9]{9}$/.test(this.newPhone))) {
				uni.showToast({
					title: '手机号码格式错误',
					icon: 'none',
				});
				return;
      }
    },

    getCaptcha(name) {
      this.checkphone();

      service('user').check(this.newPhone).then((res) => {
        if (res.data.registered === 1) {
          uni.showToast({
            title: '该号码已注册过',
            icon: 'none',
          });
          return;
        }

        service('tool').sendMessage(name, this.newPhone, 'profile').then((res) => {
          if (res.data.error_code && res.data.error_code !== 'SUCCESS') {
            return;
          }

          this.count = 60;
          this.showCount = true;
          clear = setInterval(this.countDown,1000);
          this.disabled = true;
        })
      }).catch(() => {
        return;
      })
    },

    changePhone() {
      this.checkphone();

      if (this.newPhone.length === 0) {
        uni.showToast({
          title: '手机号不能为空',
          icon: 'none',
        });
        return;
      }

      if (this.captcha.length === 0) {
        uni.showToast({
          title: '验证码错误，请重新获取',
          icon: 'none',
        });
        return;
      }

      this.change();
    },

    change() {
      service('user').resetPassword(userId, {"captcha": this.captcha, "phone": this.newPhone}).then(res => {
        if (res.data.error_code !== 'SUCCESS') {
           uni.showToast({
             title: '验证码错误，请重新获取',
             icon: 'none',
           });
           return;
        }
        uni.showToast({
          title: '更换手机成功！',
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

    // 倒计时
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
  color: #000000;
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

button::after {
  border: none;
}

.loginform-input {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20rpx;
  width: 702rpx;
  height: 88rpx;
  padding: 0 30rpx;
  border-radius: 6rpx;
  border: 2rpx solid #eee;
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

.logoff {
  margin-top: 40rpx;
  text-align: right;
}

.logoff-text {
  font-size: 34rpx;
  color: #3b8bfd;
}
</style>



<template>
	<view>
    <!--  #ifdef  APP-PLUS -->
    <view class="status-bar">
      <!-- 这里是状态栏 -->
    </view>
    <!--  #endif -->
    <view class="create-box" :style="{paddingTop: type == 'appleid' ? '0' : '120rpx'}">
      <view class="create-box-text" @click="leave" v-if="type == 'appleid'">
        跳过
      </view>
      <view class="title">
        <text class="title-text">{{ title }}</text>
        <text class="title-beizhu">手机号仅用于登录和保护账号</text>
      </view>
      <view class="loginform-input">
        <text class="loginform-input-text">手机号</text>
        <input class="m-input phone" type="text" v-model="phone" :disabled="inputDisabled" placeholder="请输入您的手机号码">
      </view>
      <view class="loginform-input">
        <text class="loginform-input-text">验证码</text>
        <input class="m-input captcha" type="text" v-model="captcha" placeholder="请输入4位验证码">
        <button class="captcha-button" :disabled="disabled" @tap="getCaptcha('tool.sms-sender')">
          {{count}}<text v-if="showCount">s</text>
        </button>
      </view>
      <button class="login" @tap="login()" :disabled="!checked">{{ buttonTitle }}</button>
      <view class="tts" v-if="notDialed">
        <text class="tts-btn" @tap="getCaptcha('tool.tts-sender')">收不到验证码？</text>
      </view>
    </view>
    <checkbox-group class="checkbox-group" @change="checkboxChange" v-if="!status">
      <checkbox :checked="checked" class="checkbox"></checkbox>
      <view class="label-text">我已阅读并同意
        <text class="blue-text" @click="goPage('privacy')">《隐私政策》</text>和
        <text class="blue-text" @click="goPage('agreement')">《用户协议》</text>
      </view>
    </checkbox-group>
  </view>
</template>

<script>
import services from '@/common/service-loader';

let clear;
// #ifdef  APP-PLUS
let openId = null,
    user = null,
    url,
    deviceId,
    isRegistered,
    usersInfomation;
// #endif
export default {
	data() {
		return {
			phone: '',
			captcha: '',
			count: '获取验证码',
      disabled: false,
      showCount: false,
      // finish #1768
      notDialed: true,
      title: '绑定手机号',
      buttonTitle: '绑定',
      checked: true,
      inputDisabled: false,
      status: '',
      type: ''
		}
  },

  watch: {
    checked() {
      this.disabled = !this.disabled;
    }
  },

  // #ifdef  APP-PLUS
  onLoad(option) {
    url = option.url;
    this.type = option.type;
    this.status = option.status;
    if (this.status === 'check') {
      uni.setStorageSync('isDeviced', false);
    } else {
      uni.setStorageSync('isDeviced', true);
    }
    if (this.status === 'check') {
      this.title = '手机认证';
      this.buttonTitle = '确认';
      this.phone = option.phone;
      this.inputDisabled = true;
    }
    if (this.type) {
      openId = uni.getStorageSync(this.type);
    }
  },
  // #endif
  onUnload() {
    user = this.$jwt.user();
    clearInterval(clear);
  },
  
	methods: {
    checkboxChange() {
      this.checked = !this.checked;
    },

    getDeviceId() {
      plus.device.getInfo({
        success: (e) => {
          deviceId = e.uuid.replace(/[:,-]/g, '').toLowerCase();
          this.device();
        },
        fail: (e) => {
          uni.showToast({
            title: '获取手机设备失败',
            icon: 'none',
          });
          return;
        }
      });

    },

    leave() {
      services('user').login({"user": openId, "type": "appleid"}).then((res) => {
        this.$store.commit('login', res.data.token);
        this.$loc.back(2);
      }).catch((err) => {
        if (err.data.error_code === 'NOT_FOUND') {
          services('user').reg({"user": openId, "type": "appleid"}).then((res) => {
            this.$store.commit('login', res.data.token);
            this.$loc.back(2);
          })
        }   
      })
    },

    device() {
      let user = this.$jwt.user();

      services('user').setting(user.id, deviceId, this.phone, this.captcha).then((res) => {
        if (res.data.error_code && res.data.error_code !== 'SUCCESS') {
          return;
        }
        uni.showToast({
					title: '认证成功',
					icon: 'none',
        });

        uni.setStorageSync('isDeviced', true);
        if (url == 'courseware') {
          this.$loc.back(3);
          return;
        }
        this.$loc.back(2);
      }).catch((error) => {
        // issue #2936 验证码提示标语修改
        let message = error.data.message;
        if (message === "验证码错误") {
          message = "验证码错误，请重新获取";
        }
        uni.showToast({
					title: message,
					icon: 'none',
				});
        return;
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

		login() {
			if(this.phone === '') {
				uni.showToast({
					title: '手机号不能为空',
					icon: 'none',
				});
				return;
      }
      if(this.captcha === '') {
				uni.showToast({
					title: '验证码不能为空',
					icon: 'none',
				});
				return;
			}
      this.checkphone();
			if (isRegistered == 1) {
        this.auth();
      } else {
        this.reg();
      }
    },

    // 注册用户
    reg() {
      services('user').reg({"pass": this.captcha, "user": this.phone, "type": "captcha"}).then((res) => {
        uni.showToast({
          title: '登录成功',
          icon: 'none',
        });

        this.$store.commit('login', res.data.token);
        user = this.$jwt.save(res.data.token);
        this.createAuth();
        this.$loc.back(2);
      }).catch(() => {
        uni.showToast({
          title: '验证码错误，请重新获取',
          icon: 'none'
        })
      });
    },

    // 绑定微信令牌
    async createAuth() {
      let res;
      try {
        res = await services('user').createAuth(user.id, openId, this.type);

        if(res.data.error_code && res.data.error_code !== "SUCCESS") {
          return;
        }
        this.$loc.back(2);
        this.checkContract(user.id);

        if (res.data.token) {
          this.$store.commit('login', res.data.token);
          user = this.$jwt.save(res.data.token);
          this.checkContract(user.id);
        }
      } catch (error) {
        // nothing to do
        console.log(JSON.stringify(error))
      }

    },

    async checkContract(id) {
      try {
        usersInfomation = await this.getUser(id);
        services('contract').queryByUser(id).then((res) => {
          if (usersInfomation.data.role == 'R_VIP' && res.data.total_count == 0) {
            uni.setStorageSync('hasContract', false);
          } else {
            uni.setStorageSync('hasContract', true);
          }
        })
      } catch(error) {
        console.log(error);
      }
    },

    // issue #3278 部分用户信息调用用户详情接口获取
    getUser(id) {
      return services('user').get(id);
    },

    // 登录
		async auth() {
      if (this.status === 'check') {
        this.getDeviceId();
        return;
      }
      let res;
      try {
        res = await services('user').login({"user": this.phone, "pass": this.captcha, "type": "captcha"});

        uni.showToast({
          title: '登录成功',
          icon: 'none',
        });

        this.$store.commit('login', res.data.token);
        user = this.$jwt.save(res.data.token);
        usersInfomation = await this.getUser(user.id);

        if (openId) {
          if (usersInfomation.data.has_auth.indexOf("baidu_unionid") != -1) {
            usersInfomation.data.has_auth = usersInfomation.data.has_auth.split("baidu_unionid");
          }
          let hasOpenid = usersInfomation.data.has_auth.indexOf(this.type);
          if (hasOpenid == -1) {
            this.createAuth();
          } else {
            this.$store.commit('login', res.data.token);
            this.checkContract(user.id);
            this.$loc.back(2);
          }
          return;
        }

        this.$loc.back(2);
      } catch (error) {
        // finish #2461 #2936
        if (error.data.error_code) {
          uni.showToast({
            title: '验证码错误，请重新获取',
            icon: 'none'
          })
        }
      }
    },

    // 获取验证码
    getCaptcha(name) {
      // finish #1768
      if (this.count > 0) {
        return;
      }
      if (name === 'tool.tts-sender') {
        this.notDialed = false;
      }
      if (this.notDialed === false) {
        name = 'tool.tts-sender';
      }
      if(this.phone === '') {
				uni.showToast({
					title: '手机号码不能为空',
					icon: 'none',
				});
				return;
			}
      this.checkphone();

      services('user').check(this.phone).then((res) => {
        if(res.error_code && res.error_code !== 'SUCCESS') {
          return;
        }
        isRegistered = res.data.registered;
        let operation = isRegistered == 1 ? 'login' : 'reg';

        services('tool').sendMessage(name, this.phone, operation).then((res) => {
          if (res.data.error_code && res.data.error_code !== 'SUCCESS') {
            return;
          }
          this.count = 60;
          this.showCount = true;
          clear = setInterval(this.countDown,1000);
          this.disabled = true;
        })
      })
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
    },

		// 倒计时
		countDown() {
      // finish #1768
			if(this.count <= 0){
        this.disabled = false;
        this.showCount = false;
				this.count = '获取验证码';
				clearInterval(clear);
			} else {
				--this.count;
			}
		},
	}
}
</script>

<style scoped>
  /*  #ifdef  APP-PLUS  */
  .status-bar {
    height: var(--status-bar-height);
    width: 100%;
  }
  /*  #endif  */

  .captcha-button {
    padding: 0;
    color: #3b8bfd;
    font-size: 24rpx;
    border: none!important;
    background: none!important;
  }

  button::after {
    border: none!important;
  }

  .login {
    margin-top: 80rpx;
    width: 650rpx;
    height: 84rpx;
    background: #237ee2;
    border-radius: 42rpx;
    font-size: 36rpx;
    color: #fff;
    letter-spacing: 2rpx;
  }

  .title {
    padding-bottom: 40rpx;
  }

  .title-text {
    display: block;
    font-weight: 500;
    font-size: 36rpx;
    text-align: center;
    color: #333;
  }

  .title-beizhu {
    display: block;
    margin-top: 29rpx;
    font-size: 24rpx;
    text-align: center;
    color: #999;
  }

  .loginform-input {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    margin: 0 auto;
    width: 600rpx;
    height: 90rpx;
    border-bottom: 1px solid #ccc; /* fix issue #2078 */
    color: #333;
    font-size: 30rpx;
  }

  .loginform-input-text {
    display: block;
    width: 150rpx;
  }

  .loginform-input input {
    width: 320rpx;
    color: #333;
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

  .create-box {
    margin: 0 auto;
    padding: 0 25rpx 40rpx;
    width: 650rpx;
    height: 550rpx;
  }

  .checkbox-group {
    position: fixed;
    bottom: 50rpx;
    display: flex;
    align-items: center;
    margin-top: 80rpx;
    padding-left: 140rpx;
    color: #999;
  }

  .label-text {
    font-size: 22rpx;
  }

  .blue-text {
    color: #0191fd;
  }

  .checkbox {
    width: 40rpx;
    height: 40rpx;
    margin-right: 11rpx;
    transform: scale(0.8);
  }

  .create-box-text {
    margin-left: 580rpx;
    width: 80rpx;
    height: 40rpx;
    line-height: 40rpx;
    padding: 40rpx 0 80rpx;
    color: #0191fd;
    font-size: 32rpx;
    text-align: right;  
    box-sizing: border-box;
  }
</style>

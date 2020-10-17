<template>
  <view class="login-page">
    <view class="login-tab-box">
      <text @click="switchTab('captcha')" :class="[!isPassLogin ? 'text-blue' : '']">验证码登录</text>
      <text @click="switchTab('pass')" :class="[isPassLogin ? 'text-blue' : '']">密码登录</text>
    </view>
    <view class="loginform">
      <view class="loginform-input">
        <text class="loginform-text">手机号</text>
        <input type="number" v-model="phone" placeholder="请输入您的手机号码">
      </view>
      <view class="loginform-input" v-if="isPassLogin">
        <text class="loginform-text">密码</text>
        <input type="text" v-model="password" name="password" password placeholder="请输入6-20位密码">
      </view>
      <view class="loginform-input space-between"  v-if="!isPassLogin">
        <view class="align-center">
          <text class="loginform-text">验证码</text>
          <input type="number" v-model="captcha" placeholder="请输入4位验证码">
        </view>
        <button class="btn-captcha" :disabled="!checked" @click="getCaptcha('tool.sms-sender')">
          {{count}}<text v-if="showCount">s</text>
        </button>
      </view>
      <button class="btn-login" @click="login" :disabled="!checked">登录</button>
      <view class="login-tab" v-if="notDialed && !isPassLogin">
        <text @click="goPage('login/login-reg')">注册</text>
        <text @click="getCaptcha('tool.tts-sender')">收不到验证码？</text>
      </view>
      <view class="login-tab" v-if="isPassLogin">
        <text @click="goPage('login/login-reg')">注册</text>
        <text @click="goPage('forget/forget')">忘记密码</text>
      </view>
    </view>
    <view class="third-login">
      <view class="third-login-tip">其他登录</view>
      <view class="third-login-box">
        <!--  #ifdef  MP-WEIXIN -->
        <button class="wechat" open-type="getPhoneNumber" @getphonenumber="getPhoneNumber" :disabled="!checked">
          <text class="iconfont icon-weixin"></text>
        </button>
        <!--  #endif -->
        <!--  #ifdef  APP-PLUS -->
        <button class="wechat" @click="uniLogin('weixin')" :disabled="!checked">
          <text class="iconfont icon-weixin"></text>
        </button>
        <!--  #endif -->
        <button class="apple" @click="uniLogin('apple')" :disabled="!checked" v-if="isIOS">
        </button>
      </view>
    </view>
    <checkbox-group class="privacy-agreement" @change="checkboxChange">
      <checkbox :checked="checked" class="privacy-agreement-checkbox"></checkbox>
      <view class="privacy-agreement-text">我已阅读并同意
        <text class="text-blue" @click="goPage('user/privacy')">《隐私政策》</text>和
        <text class="text-blue" @click="goPage('user/agreement')">《用户协议》</text>
      </view>
    </checkbox-group>
  </view>
</template>

<script>
import services from '@/common/service-loader';
import WXBizDataCrypt from '@/common/WXBizDataCrypt';

let user,
    url,
    clear,
    registered,
    appleId,
    unionid,
    deviceId,
    userInfo;

export default {
  data() {
    return {
      sessionkey: '',
      phoneNumber: '',
      phone: '',
			captcha: '',
			count: '获取验证码',
      showCount: false,
      notDialed: true,
      checked: true,
      isPassLogin: false,
      password: '',
      isIOS: false
    }
  },

  onShow() {
    let isDeviced = uni.getStorageSync('isDeviced');
    if (!isDeviced) {
      this.$store.commit('logout');
      uni.$emit('logout', {logout: true})
    }
  },

  onUnload() {
    clearInterval(clear);
  },

  onLoad(options) {
    url = options.url;
    // #ifdef APP-PLUS
    plus.device.getInfo({
      success: (e) => {
        deviceId = e.uuid.replace(/[:,-]/g, '').toLowerCase();
      },
      fail: (e) => {
        this.uniShowToast('获取手机设备失败');
        return;
      }
    });
    // #endif
    // #ifdef  MP-WEIXIN
    this.sessionKey();
    // #endif

    uni.getSystemInfo({
      success: (res) => {
        let systemVersion = [];
        systemVersion = res.system.split(".")[0];
        if (res.platform == 'ios' && systemVersion >= 13) {
          this.isIOS = true;
        }
      }
    })
  },

  methods: {
    switchTab(e) {
      if (e == 'pass') {
        this.isPassLogin = true;
        return;
      }
      this.isPassLogin = false;
    },

    checkboxChange() {
      this.checked = !this.checked;
    },

    // #ifdef  APP-PLUS
    uniLogin(provider) {
      uni.login({
        provider: provider,
        success: res => {
          if (provider == 'weixin') {
            unionid = res.authResult.unionid;
            if (!unionid) {
              return;
            }
            uni.setStorageSync('unionid', unionid);
            this.uniAuth();
            return;
          }
          if (provider == 'apple') {
            uni.getUserInfo({
              provider: provider,
              success: res => {
                appleId = res.userInfo.openId;
                if (!appleId) {
                  return;
                };
                uni.setStorageSync('appleid', appleId);
                this.appleAuth();
              }
            });
          }
        },
        fail: function(err) {
          console.log(err)
        }
      })
    },
    // #endif

    sessionKey() {
      const accountInfo = wx.getAccountInfoSync();
      const appid = accountInfo.miniProgram.appId;
      const that = this;
      uni.login({
        provider: 'weixin',
        success: res => {
          if (!res.code) {
            return;
          }
          // 获取sessionkey、openid
          services('weixin').getSessionkey(appid, res.code).then((res) => {
            that.sessionkey = res.data.session_key;
            unionid = res.data.unionid;
          });
        },
      });
    },

    // 微信注册
    reg() {
      services('user').reg({"user": unionid, "type": "unionid"}).then((res) => {
        this.checkAuth(res.data.token, "unionid");
      });
    },

    getPhoneNumber(e) {
      if (e.detail.errMsg != 'getPhoneNumber:ok') {
        return;
      }
      this.userPhone(e.detail.encryptedData, e.detail.iv);
    },

    userPhone(encryptedData, iv) {
      // 此方法只有微信小程序使用，所以调用微信小程序方法
      const accountInfo = wx.getAccountInfoSync();
      const pc = new WXBizDataCrypt(accountInfo.miniProgram.appId, this.sessionkey);
      const data = pc.decryptData(encryptedData, iv)
      this.phoneNumber = data.purePhoneNumber;
      this.uniAuth();
    },

    // 微信登录
    uniAuth() {
      // fix issue #3698
      services('user').check(unionid, 'unionid').then(res => {
        const data = res.data;
        if (data.error_code && data.error_code !== 'SUCCESS') {
          return;
        }

        if (data.registered == 1) {
          services('user').login({"user": unionid, "type": "unionid"}).then((res) => {
            this.checkAuth(res.data.token, "unionid");
          }).catch((e) => {
            console.log(e);
          });
          return;
        }

        // #ifdef  MP-WEIXIN
        this.reg();
        // #endif
        // #ifdef  APP-PLUS
        this.$loc.open(`login/login-create?url=login&type=unionid`);
        // #endif
      })
    },

    // 苹果登录
    appleAuth() {
      services('user').login({"user": appleId, "type": "appleid"}).then((res) => {
        this.checkAuth(res.data.token, 'appleid');
      }).catch((err) => {
        this.$loc.open(`login/login-create?url=login&type=appleid`);
      })
    },

    // 判断手机号码是否绑定过
    async checkAuth(token, type) {
      user = this.$jwt.save(token);
      try {
        userInfo = await this.getUser(user.id);
        let hasPhone = userInfo.data.has_auth.indexOf("pass");
        if (hasPhone == -1) {
          // #ifdef  MP-WEIXIN
          this.createAuth(token);
          // #endif
          // #ifdef  APP-PLUS
          this.$loc.open(`login/login-create?url=login&type=${type}`);
          // #endif
          return;
        }
        this.$store.commit('login', token);
        this.updateUser();
      } catch (error) {
        console.log('error')
      }
    },

    updateUser() {
      user = this.$jwt.user();
      this.checkContract(user.id);
      if (url == 'forget' || url == 'reg') {
        this.$loc.openTab('study/index');
        return;
      }
      if (url == 'courseware') {
        this.$loc.back(2);
        return;
      }
      this.$loc.back();
    },

    // issue #3278 部分用户信息调用用户详情接口获取
    getUser(id) {
      return services('user').get(id);
    },

    // 绑定手机令牌
    createAuth(token) {
      services('user').createAuth(user.id, this.phoneNumber, 'pass').then((res) => {
        if (res.data.error_code && res.data.error_code !== "SUCCESS") {
          return;
        }
        if (res.data.token) {
          this.$store.commit('login', res.data.token);
        } else {
          this.$store.commit('login', token);
        }
        this.updateUser();
      });
    },

    // 获取验证码
    getCaptcha(name) {
      if (!this.checked) {
        return;
      }
      if (this.count > 0) {
        return;
      }
      if (this.phone === '') {
        this.uniShowToast('手机号码不能为空');
				return;
			}
      if (!this.checkphone()) {
        return;
      }
      services('user').check(this.phone).then((res) => {
        if (res.data.registered == 0) {
          this.uniShowToast('手机号未注册');
          return;
        }

        if (!this.notDialed) {
          name = 'tool.tts-sender';
        }

        services('tool').sendMessage(name, this.phone, 'login').then((res) => {
          if (res.data.error_code && res.data.error_code !== 'SUCCESS') {
            return;
          }
          if (name == 'tool.tts-sender' && this.notDialed) {
            this.notDialed = false;
          }
          this.count = 60;
          this.showCount = true;
          clear = setInterval(this.countDown, 1000);
        })
      })
    },

    // 倒计时
		countDown() {
      if (this.count > 0) {
        this.count--;
        return;
      }
      this.showCount = false;
      this.count = '获取验证码';
      clearInterval(clear);
		},

    login() {
			if (this.phone === '') {
        this.uniShowToast('手机号不能为空');
				return;
      }
      if (this.captcha === '' && !this.isPassLogin) {
        this.uniShowToast('验证码不能为空');
				return;
      }
      if (this.password === '' && this.isPassLogin) {
        this.uniShowToast('密码不能为空');
				return;
      }
      if (!this.checkphone()) {
        return;
      }
			this.auth();
    },

    // 登录
		async auth() {
      let res;
      let data;
      let needVerify;
      let deviceData;
      try {
        if (!this.isPassLogin) {
          res = await services('user').login({"user": this.phone, "pass": this.captcha, "device_id": deviceId, "type": "captcha"});
        }
        if (this.isPassLogin) {
          res = await services('user').login({"user": this.phone, "pass": this.password, "device_id": deviceId, "type": "pass"});
        }
        this.$store.commit('login', res.data.token);
        user = this.$jwt.user();
        // #ifdef APP-PLUS
        deviceData = await this.checkDevice(user.id, deviceId);
        if (deviceData.data.error_code && deviceData.data.result == 'OK') {
          needVerify = false;
        } else {
          needVerify = true;
        }
        if (needVerify && this.isPassLogin) {
          this.$loc.open(`login/login-create?status=check&phone=${this.phone}&url=courseware`);
          return;
        }
        // #endif
        this.uniShowToast('登录成功');
        this.updateUser();
      } catch (error) {
        if (!this.isPassLogin) {
          this.uniShowToast('验证码错误，请重新获取')
        } else {
          this.uniShowToast('手机号或密码错误')
        }
        console.log(error)
      }
    },

    checkDevice(id, deviceId) {
      return services('user').checkDevice(id, deviceId);
    },

    async checkContract(id) {
      try {
        userInfo = await this.getUser(id);

        services('contract').queryByUser(id).then((res) => {
          if (userInfo.data.role == 'R_VIP' && res.data.total_count == 0) {
            uni.setStorageSync('hasContract', false);
          } else {
            uni.setStorageSync('hasContract', true);
          }
        })
      } catch (error) {
        console.log(error);
      }
    },

    checkphone() {
      if (!(/^[1][3-9][0-9]{9}$/.test(this.phone))) {
        this.uniShowToast('手机号码格式错误');
        return false;
      }
      return true;
    },

    goPage(url) {
      this.$loc.open(`${url}`);
    },

    uniShowToast(title) {
      uni.showToast({
        title: title,
        icon: 'none',
      });
    },
  }
}
</script>

<style scoped>
  .login-page {
    padding-top: 100rpx;
    padding-bottom: 50rpx;
  }

  .login-tab-box {
    display: flex;
    justify-content: space-between;
    width: 100%;
    height: 34rpx;
    padding: 0 138rpx 90rpx;
    box-sizing: border-box;
    font-size: 36rpx;
    color: #999;
    font-weight: 400;
  }

  .text-blue {
    color: #237ee2;
    font-weight: 500;
  }

  .loginform-input {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    margin: 20rpx auto 0;
    width: 600rpx;
    height: 90rpx;
    border-bottom: 1px solid #ccc; /* fix issue #2078 */
    color: #333;
    font-size: 30rpx;
  }

  .loginform-input input {
    padding-left: 60rpx;
    color: #333;
    width: 320rpx;
  }

  input {
    font-size: 30rpx;
  }

  .btn-captcha {
    padding: 0;
    color: #3b8bfd;
    font-size: 24rpx;
    border: none!important;
    background: none!important;
  }

  button::after {
    border: none!important;
  }

  .btn-login {
    margin-top: 80rpx;
    width: 650rpx;
    height: 84rpx;
    background: #237ee2;
    border-radius: 42rpx;
    font-size: 36rpx;
    color: #fff;
    letter-spacing: 2rpx;
  }

  .third-login-tip {
    position: relative;
    margin-top: 350rpx;
    margin-left: auto;
    margin-right: auto;
    width: 600rpx;
    text-align: center;
    font-size: 24rpx;
    color: #999;
  }

  .third-login-tip::after {
    position: absolute;
    content: "";
    width: 199rpx;
    height: 2rpx;
    background: #eee;
    left: 0;
    top: 50%;
  }

  .third-login-tip::before {
    position: absolute;
    content: "";
    width: 199rpx;
    height: 2rpx;
    background: #eee;
    right: 0;
    top: 50%;
  }

  .third-login button {
    display: flex;
    align-items: center;
    margin: 38rpx auto 0;
    padding: 0;
    width: 77rpx;
    height: 77rpx;
    line-height: 61rpx;
    text-align: center;
    border-radius: 50%;
  }

  .wechat {
    padding-left: 10.5rpx !important;
    background: #66bf4c;
  }

  .third-login-box {
    display: flex;
    justify-content: space-around;
    margin: 0 auto;
    width: 400rpx;
  }

  .apple {
    background: transparent url('https://cdn.laixue.com/uniapp/icon-apple-signin.png') no-repeat 50% 50%;
    background-size: 112rpx 112rpx;
  }

  .icon-weixin {
    font-size: 56rpx;
    color: white;
  }

  .privacy-agreement-checkbox {
    width: 40rpx;
    height: 60rpx;
    margin-right: 11rpx;
    transform: scale(0.8);
  }

  .privacy-agreement {
    display: flex;
    align-items: center;
    padding-left: 140rpx;
    margin-top: 50rpx;
    color: #999;
  }

  .privacy-agreement-text {
    font-size: 22rpx;
  }

  .align-center {
    display: flex;
    justify-content: flex-start;
    align-items: center;
  }

  .space-between {
    justify-content: space-between;
  }

  .loginform-text {
    display: inline-block;
    width: 90rpx;
  }

  .login-tab {
    display: flex;
    justify-content: space-between;
    margin-top: 30rpx;
    padding: 0 70rpx;
    font-size: 28rpx;
    color: #4d4d4d;
  }

</style>

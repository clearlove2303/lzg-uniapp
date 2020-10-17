<template>
  <view class="me-content" :style="{height: windowHeight + 'px'}">
    <!--  #ifdef  APP-PLUS -->
    <view class="status-bar">
      <!-- 这里是状态栏 -->
    </view>
    <!--  #endif -->
    <view class="me-head">
      <view class="head-box">
        <view class="me-avator" @click="chooseImage">
          <!-- #ifdef  MP-WEIXIN -->
          <image :src="avator"></image>
          <!-- #endif -->
          <!-- #ifdef  APP-PLUS -->
          <cache-image :imgUrl="avator"></cache-image>
          <!-- #endif -->
        </view>
        <view class="me-nickname" v-if="user && nick !== '请登录/注册'">
          <text @click="goToLogin">{{ nick }}</text>
          <view class="me-user" :style="usersInfomation.role == 'R_VIP' ? 'background: #fbb700' : 'background: #bac3d2'">
            <!-- #ifdef  MP-WEIXIN -->
            <image class="iconfont me-user-icon" :src="usersInfomation.role == 'R_VIP' ? vipIcon : commonIcon"></image>
            <!-- #endif -->
            <!-- #ifdef  APP-PLUS -->
            <cache-image class="iconfont me-user-icon" :imgUrl="usersInfomation.role == 'R_VIP' ? vipIcon : commonIcon"></cache-image>
            <!-- #endif -->
            <text class="me-user-title">{{ usersInfomation.role == 'R_VIP' ? 'VIP用户' : '普通用户' }}</text>
          </view>
        </view>
        <text class="me-nickname-title" @click="goToLogin" v-else>{{ nick }}</text>
      </view>
    </view>
    <view class="me-menu"
    v-for="(module, i) in moduleList" :key="i">
      <text class="menu-title">{{ module.title }}</text>
      <view class="menu-content">
        <view class="menu-item"
        v-for="(item, index) in module.cellList" :key="index"
        :class="item.class"
        @click="goPage(item)">
          <!-- #ifdef  MP-WEIXIN -->
          <image :src="item.url" class="item-image"></image>
          <!-- #endif -->
          <!-- #ifdef  APP-PLUS -->
          <cache-image :imgUrl="item.url" class="item-image"></cache-image>
          <!-- #endif -->
          <text class="item-title">{{ item.title }}</text>
          <text class="reddot" v-if="item.title === '系统设置' && hasUpdate == '1'"></text>
        </view>
      </view>
    </view>
    <uni-popup ref="popup" type="center">
      <view class="tel-title">来学网在线客服热线</view>
      <view class="tel-dialog">来学网官方免费提供热线咨询，及时解答您的疑问，服务时间为早9点至晚6点。</view>
      <view class="tel-button">
        <text class="btn-left" @click="closePopup">暂不需要</text>
        <text class="btn-right" @click="telPhone">立即拨打</text>
      </view>
    </uni-popup>
    <modal
      :show="dialogShow"
      confirmText="前往确认"
      title= "提示"
      text= "为了您的正常的学习，请确认您报考的科目"
      :textShow= "true"
      @confirm="goEnroll">
    </modal>
  </view>
</template>

<script>
  import services from '@/common/service-loader';
  import { mapState } from 'vuex';
  // #ifdef  APP-PLUS
  import cacheImage from "@/components/media/cache-image.vue"
  // #endif
  import uniPopup from '@/components/vendor/uni-popup/uni-popup.vue';
  import modal from '@/components/custom/modal.vue';
  import cacheKeys from '@/plugins/cache/keys.js';

  const STATICURL = getApp().globalData.CDN;
  let hasContract = null;

	export default {
    components: {
      uniPopup,
      modal,
      // #ifdef  APP-PLUS
      cacheImage
      // #endif
    },

		data() {
			return {
        user: {},
        usersInfomation: {},
        avator: getApp().globalData.CDN + 'img-avator-default.jpg',
        nick: '请登录/注册',
        hasUpdate: '',
        dialogShow: false,
        systemInfo: {},
        windowHeight: '',
        vipIcon: `${STATICURL}icon-zuanshi-vip.png`,
        commonIcon: `${STATICURL}icon-zuanshi.png`,
        moduleList: [
          {
            title: '我的学习',
            cellList: [
              {
                url: `${STATICURL}icon-liebiao.png`,
                title: '已购课程',
                class: 'courses',
              },
              {
                url: `${STATICURL}icon-biaoqian.png`,
                title: '已购题库',
                class: 'exams',
              },
              // #ifdef APP-PLUS
              /* {
                url: `${STATICURL}icon-yunduan.png`,
                title: '视频缓存',
                class: 'cache',
              },*/
              // #endif
              {
                url: `${STATICURL}icon-shijian.png`,
                title: '观看历史',
                class: 'records',
              },
            ],
          },
          {
            title: '我的账户',
            cellList: [
              {
                url: `${STATICURL}icon-gerenzhongxin.png`,
                title: '我的订单',
                class: 'orders',
              },
              {
                url: `${STATICURL}icon-liwu.png`,
                title: '优惠券',
                class: 'coupons',
              },
              {
                url: `${STATICURL}icon-zichan.png`,
                title: '我的钱包',
                class: 'hidden',
              },
            ],
          },
          {
            title: '服务中心',
            cellList: [
              // #ifdef  APP-PLUS
              {
                url: `${STATICURL}icon-liaotian.png`,
                title: '在线客服',
                class: 'kefu',
              },
              // #endif
              {
                url: `${STATICURL}icon-dianhua.png`,
                title: '电话客服',
                class: 'service',
              },
              {
                url: `${STATICURL}icon-youjian.png`,
                title: '反馈问题',
                class: 'feedback',
              },
              {
                url: `${STATICURL}icon-bianji.png`,
                title: '系统设置',
                class: 'setting',
              },
            ],
          }
        ],
			}
    },

    computed: mapState(['hasLogin']),

    onShow() {
      // #ifdef APP-PLUS
      // issue 2689
      this.dialogShow = false;
      const hasContract = uni.getStorageSync('hasContract');
      const enrollShowed = uni.getStorageSync('enrollShowed');
      if (this.hasLogin && hasContract === false && !enrollShowed) {
        uni.setStorageSync('enrollShowed', true)
        this.dialogShow = true;
        uni.hideTabBar();
      }
      this.hasUpdate = uni.getStorageSync('hasUpdate');
      // #endif
    },

    onUnload() {
      uni.$off('login', this.login);
      uni.$off('logout', this.logout);
    },


    onLoad() {
      uni.getSystemInfo({
        success: (res) => {
          this.systemInfo = res;
          this.windowHeight = res.windowHeight;
        }
      })
      // #ifdef  MP-WEIXIN
      this.setTitle('我的');
      // #endif
      this.init();
      uni.$on('login', this.login);
      uni.$on('logout', this.logout);
    },

		methods: {
      goEnroll() {
        this.dialogShow = false;
        uni.showTabBar();
        this.$loc.open(`user/enroll`);
      },

      async login(data) {
        try {
          this.user = data;
          this.loadCacheData({
            key: cacheKeys.pages.user.profile,
            afterLoad: this.afterLoad,
            beforeCache: this.beforeCacheData}, 
            services('user').get(this.user.id), 
            'usersInfomation').then(res => {
              this.afterLoad(res.data);
            })

          this.handlerIosVip();
        } catch (error) {
          console.log(error);
        }
      },

      logout() {
        this.avator = getApp().globalData.CDN + 'img-avator-default.jpg';
        this.nick = '请登录/注册';
        // fix issue #2283
        uni.hideTabBarRedDot({
          index: 2,
        })
      },

      async init() {
        try {
          this.user = this.$jwt.user();
          if (this.user) {
            this.loadCacheData({
              key: cacheKeys.pages.user.profile,
              afterLoad: this.afterLoad,
              beforeCache: this.beforeCacheData}, 
              services('user').get(this.user.id), 
              'usersInfomation').then(res => {
                this.afterLoad(res.data);
              })
          } else {
            this.avator = getApp().globalData.CDN + 'img-avator-default.jpg';
            this.nick = '请登录/注册';
            // fix issue #2283
            uni.hideTabBarRedDot({
              index: 2,
            })
          }
          this.handlerIosVip();
        } catch (error) {
          console.log(error);
        }
      },

      afterLoad(usersInfomation) {
        this.handleData(usersInfomation);
      },

      beforeCacheData(data) {
        this.handleData(data);
        return data;
      },

      handleData(usersInfomation) {
        if (usersInfomation.avator == null) {
          this.avator = getApp().globalData.CDN + 'img-avator-default.jpg';
        } else {
          this.avator = usersInfomation.avator;
        }
        this.nick = usersInfomation.nick;
      },

      // issue #3278 部分用户信息调用用户详情接口获取
      getUser(id) {
        return services('user').get(id);
      },

      // issue 3046
      handlerIosVip() {
        // issue #3278
        this.moduleList[1].cellList[1].class = 'coupons'; // 初始化优惠劵
        this.moduleList[1].cellList[this.moduleList[1].cellList.length - 1].class = 'hidden'; // 初始化升级vip
        this.moduleList[1].cellList[2].class = 'hidden'; // 初始化我的钱包

        if (this.systemInfo.platform === 'ios') {
          this.moduleList[1].cellList[2].class = 'wallet'; // 我的钱包在ios端显示
          // ios端隐藏优惠券
          this.moduleList[1].cellList[1].class = 'hidden'; // 隐藏优惠劵
        }
      },

      goToLogin() {
        if (!this.hasLogin) {
          this.goLogin();
        }
      },

      goPage(cell) {
        switch (cell.class) {
          case 'courses':
            if (!this.hasLogin) {
              this.goLogin();
              return;
            }
            this.$loc.open(`user/course`);
            break;

          case 'records':
            if (!this.hasLogin) {
              this.goLogin();
              return;
            }
            this.$loc.open(`user/course-records`);
            break;

          case 'coupons':
            if (!this.hasLogin) {
              this.goLogin();
              return;
            }
            this.$loc.open(`user/coupons`);
            break;

          case 'orders':
            if (!this.hasLogin) {
              this.goLogin();
              return;
            }
            this.$loc.open(`user/orders`);
            break;

          case 'wallet':
            if (!this.hasLogin) {
              this.goLogin();
              return;
            }
            this.$loc.open(`user/wallet`);
            break;

          case 'exams':
            if (!this.hasLogin) {
              this.goLogin();
              return;
            }
            this.$loc.open(`user/tikus`);
            break;

          case 'service':
            this.$refs.popup.open();
            break;

          // #ifdef  APP-PLUS
          case 'kefu':
            this.$loc.open(`user/kefu`);
            break;
          case 'cache':
            this.$loc.open(`course/downloadlist`);
            break;
          // #endif

          case 'setting':
            this.$loc.open(`user/setting`);
            break;

          case 'feedback':
            if (!this.hasLogin) {
              this.goLogin();
              return;
            }
            this.$loc.open(`user/feedback`);
            break;
        }
      },

      closePopup() {
        this.$refs.popup.close();
      },

      telPhone() {
        uni.makePhoneCall({
            phoneNumber: '400-118-6070',
        });
      },

      chooseImage() {
        if (!this.hasLogin) {
          this.goLogin();
          return;
        }
        const baseUrl = getApp().globalData.API_URL;

        // #ifdef  APP-PLUS
        uni.chooseImage({
          count: 1,
          sizeType: ['compressed'],
          sourceType: ['album'],
          success: (res) => {
            const tempFilePaths = res.tempFilePaths;
            uni.uploadFile({
              url: `${baseUrl}files`,
              filePath: tempFilePaths[0],
              header: {
                "Authorization": `Bearer ${this.user.token}`
              },
              name: 'file',
              formData: {
                'dir': 'user'
              },
              success: (uploadFileRes) => {
                uni.showToast({
                  title: '开始上传图片...',
                  icon: 'none'
                });
                this.avator = JSON.parse(uploadFileRes.data).url;
                const upid = JSON.parse(uploadFileRes.data).id;
                const url = this.avator.replace("https://cdn.laixue.com", "");
                this.updateAvator(url, upid);
              }
            });
          }
        });
        // #endif
      },

      updateAvator(url, upid) {
        services('user').update(this.user.id, {"avator": url, upid}).then(res => {
          if (res.data.error_code && res.data.error_code !== 'SUCCESS') {
            return;
          }
          this.$store.commit('login', res.data.token);
        })
      }
		}
	}
</script>

<style scoped>
/*  #ifdef  APP-PLUS  */
.status-bar {
  height: var(--status-bar-height);
  width: 100%;
  background-color: #3b8bfd;
}
/*  #endif  */

.me-content {
  background: #f8f8f8;
}

.me-head {
  position: relative;
  margin-bottom: -2rpx;
  width: 750rpx;
  height: 278rpx;
  background-color: #3b8bfd;
  overflow: hidden;
}

.head-box {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  position: absolute;
  left: 60rpx;
  bottom: 55rpx;
}

.me-avator {
  border: 5px solid #60a1fd;
  border-radius: 100rpx;
  width: 110rpx;
  height: 110rpx;
  background: #fff;
}

.me-avator image {
  border-radius: 100rpx;
  width: 100%;
  height: 100%;
}

.me-nickname {
  display: flex;
  flex-direction: column;
  margin: 23rpx 0 0 30rpx;
  font-size: 34rpx;
  color: #fff;
}

.me-nickname-title {
  margin: 40rpx 0 0 30rpx;
  font-size: 34rpx;
  color: #fff;
}

.me-user {
  display: flex;
  align-items: center;
  width: 142rpx;
  height: 38rpx;
  border-radius: 22rpx;
  font-size: 24rpx;
  margin-top: 17rpx;
}

.me-user-icon {
  box-sizing: border-box;
  padding: 2rpx;
  margin: 2rpx 9rpx 0 5rpx;
  width: 28rpx!important;
  height: 28rpx;
  background: #fff;
  border-radius: 50%;
}

.me-menu {
  margin-top: 20rpx;
  background: #fff;
}

.menu-title {
  display: inline-block;
  margin: 25rpx 0 0 28rpx;
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
}

.menu-content {
  display: flex;
  margin-top: 36rpx
}

.menu-item {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 35rpx;
  width: 25%;
  border-left: 1px solid #f4f4f4;
}

.menu-item:first-of-type {
  border: none;
}

.item-image {
  width: 44rpx;
  height: 44rpx;
}

.item-title {
  margin-top: 24rpx;
  color: #333;
  font-size: 26rpx;
}

.hidden {
  display: none!important;
}

.tel-title {
  margin-bottom: 24rpx;
  font-size: 34rpx;
  font-weight: 700;
  text-align: center;
}

.tel-dialog {
  margin-left: 22rpx;
  margin-right: 22rpx;
  margin-bottom: 42rpx;
  text-indent: 2em;
  font-size: 26rpx;
  line-height: 36rpx;
  color: #666;
}

.tel-button {
  display: flex;
  align-items: center;
  border-top: 1rpx solid #d5d6d8;
  height: 88rpx;
  line-height: 88rpx;
}

.btn-left {
  border-right: 1rpx solid #d5d6d8;
}

.btn-left,
.btn-right {
  width: 50%;
  height: 88rpx;
  text-align: center;
  font-size: 36rpx;
  color: #007aff;
}

.reddot {
  position: absolute;
  right: 33%;
  display: inline-block;
  width: 15rpx;
  height: 15rpx;
  border-radius: 50%;
  background: #ff0000;
}
</style>

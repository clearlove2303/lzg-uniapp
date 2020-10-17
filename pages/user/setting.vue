<template>
  <view class="setting">
    <view class="setting-content">
      <view v-for="(cell, index) in userSetting"
        :key="index" :class="cell.class" class="cell-list" @click="goPage(cell)">
        <text class="cell-title">{{ cell.title }}</text>
        <text class="iconfont icon-gengduo"></text>
      </view>
      <view class="cell-list notify-setting" @click="openPage('notice')">
        <text class="cell-title">通知设置</text>
        <text class="iconfont icon-gengduo"></text>
      </view>
      <!--  #ifdef  APP-PLUS -->
      <view class="cell-list notify-setting" @click="openPage('tiku')">
        <text class="cell-title">答题设置</text>
        <text class="iconfont icon-gengduo"></text>
      </view>
      <view class="cell-list notify-setting" @click="clearCache">
        <text class="cell-title">清除缓存</text>
        <text class="cache-size">{{ cacheSize }}</text>
      </view>
      <!-- #endif -->
      <view v-for="(cell, index) in cellList" :key="cellList.length + index" :class="cell.class" class="cell-list" @click="goPage(cell)">
        <text class="cell-title">{{ cell.title }}</text>
        <text class="iconfont icon-gengduo"></text>
      </view>
      <!--  #ifdef  APP-PLUS -->
      <view class="cell-list" @click="openPage('about')">
        <text class="cell-title">关于来学宝典</text>
        <text class="reddot" v-if="hasUpdate == '1'"></text>
        <text class="iconfont icon-gengduo"></text>
      </view>
      <!-- #endif -->
      <button @click="logout" v-if="loginShow">退出登录</button>
    </view>
  </view>
</template>
<script>
import { mapState } from 'vuex';

export default {
  data() {
    return {
      hasUpdate: '',
      userSetting: [
        {
          title: '更换手机号',
          class: 'change-phone',
        },
        {
          title: '修改密码',
          class: 'change-password',
        },
        {
          title: '注销账号',
          class: 'logoff',
        },
      ],
      cellList: [
        {
          title: '授权老师查询',
          class: 'query-teacher',
        },
        {
          title: '联系我们',
          class: 'contact-us',
        },
        {
          title: '用户协议',
          class: 'user-agreement'
        },
        {
          title: '隐私条款',
          class: 'privacy-policy'
        }
      ],
      loginShow: false,
      // #ifdef APP-PLUS
      cacheSize: '0B',
      // #endif
    }
  },

  computed: mapState(['hasLogin']),

  watch: {
  	hasLogin(newValue) {
  		this.loginShow = newValue
  	}
  },

  onShow() {
    // #ifdef APP-PLUS
    this.hasUpdate = uni.getStorageSync('hasUpdate');
    // #endif
  },

  onUnload() {
    uni.$on('login', this.loadData);
  },

  onLoad() {
    // #ifdef APP-PLUS
    this.cacheSize = this.$cache.size();
    // #endif
    if (!this.hasLogin) {
      this.loginShow = false;
      return;
    }
    uni.$on('login', this.loadData);
    this.loginShow = true;
  },

  methods: {
    // #ifdef APP-PLUS
    clearCache() {
      this.$cache.clear();
      this.cacheSize = '0B';
      plus.io.resolveLocalFileSystemURL('_doc/cache/images', (entry) => {
        entry.removeRecursively();
      });
      uni.showToast({
        title: '缓存清除完成',
        icon: 'none'
      });
    },
    // #endif

    loadData() {
      this.loginShow = true;
    },

    goPage(cell) {
      switch (cell.class) {
        case 'change-phone':
          if (!this.hasLogin) {
            this.goLogin();
            return;
          }
          this.$loc.open(`user/change-phone`);
          break;

        case 'change-password':
          if (!this.hasLogin) {
            this.goLogin();
            return;
          }
          this.$loc.open(`user/change-password`);
          break;

        case 'notify-setting':
          if (!this.hasLogin) {
            this.goLogin();
            return;
          }
          this.$loc.open(`user/notice`);
          break;

        case 'query-teacher':
          this.$loc.open(`user/query`);
          break;

        case 'contact-us':
          this.$loc.open(`user/contact`);
          break;

        case 'user-agreement':
          this.$loc.open(`user/agreement`);
          break;

        case 'privacy-policy':
          this.$loc.open(`user/privacy`);
          break;
        case 'logoff':
          if (!this.hasLogin) {
            this.goLogin();
            return;
          }
          this.$loc.open(`logoff/explain`);
          break;
        default:
          break;
      }
    },

    openPage(item) {
      if (item == 'notice' || item == 'tiku') {
        if (!this.hasLogin) {
          this.goLogin();
          return;
        }
      }
      this.$loc.open(`user/${item}`);
    },

    logout() {
      this.$store.commit('logout');
      this.loginShow = false;
      uni.$emit('logout', {logout: true});
      this.setTitle('系统设置');
      this.goLogin();
    },
  }
}
</script>
<style scoped>
.cell-list {
  display: flex;
  position: relative;
  justify-content: space-between;
  align-items: center;
  margin-left: auto;
  margin-right: auto;
  padding: 0rpx 30rpx 0;
  border: 2rpx solid #e2e2e2;
  border-radius: 3px;
  width: 702rpx;
  height: 88rpx;
  box-sizing: border-box;
}

.pdt10 {
  padding-top: 10rpx!important;
}

.icon-gengduo {
  color: #c9c9c9;
  font-size: 40rpx;
}

.cell-title {
  font-size: 30rpx;
  color: #333;
}

.cache-size {
  font-size: 30rpx;
  color: #9a9a9a;
}

.logoff,
.notify-setting,
.query-teacher,
.auto-remove {
  margin-bottom: 20rpx;
}

.change-phone,
.change-password,
.contact-us,
.user-agreement {
  border-bottom: none!important;
}

/* #ifdef APP-PLUS */
.privacy-policy {
  border-bottom: none!important;
}
/* #endif */
button {
  display: block;
  margin: 40rpx auto 0;
  width: 360rpx;
  height: 88rpx;
  border: 1px solid #3b8bfd;
  border-radius: 44rpx;
  color: #3b8bfd;
  font-size: 34rpx;
}

.auto-remove {
  justify-content: space-between;
}

.remove-tips {
  font-size: 26rpx;
}

.reddot {
  position: absolute;
  right: 60rpx;
  width: 24rpx;
  height: 24rpx;
  border-radius: 50%;
  background: #ff0000;
}
</style>

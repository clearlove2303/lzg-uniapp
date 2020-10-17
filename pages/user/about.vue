<template>
  <view class="page-content">
    <view class="app-intro">
			<view class="app-logo">
        <!-- #ifdef  MP-WEIXIN -->
				<image :src="getUrl('logo-lxbd.png') | handleImgUrl('120', '120')" class="logo"></image>
        <!-- #endif -->
        <!-- #ifdef  APP-PLUS -->
        <cache-image :imgUrl="getUrl('logo-lxbd.png') | handleImgUrl('120', '120')" class="logo"></cache-image>
        <!-- #endif -->
				<text class="title">来学宝典</text>
			</view>
			<view class="description">
				<text >来学宝典是来学机构开发的一款针对职称考试的综合学习软件。来学机构一直致力于为广大考试提供优质的学习资料与工具，帮助广大考生顺利通过考试。</text>
			</view>
    </view>
    <view class="check" v-if="isAndroid" @click="checkUpdate">
      <text>检查更新</text>
      <view class="version"><text v-if="hasUpdate" class="tips"></text>V {{ version }}</view>
    </view>
    <view v-else class="center"><text class="ios-version">当前版本 V {{version}}</text></view>
    <uni-popup ref="popup" type="center">
      <view class="update-title">检测到新版本，是否更新？</view>
      <view class="update-button">
        <text class="btn-left" @click="cancel">取消</text>
        <text class="btn-right" @click="update">确定</text>
      </view>
    </uni-popup>
	</view>
</template>

<script>
import service from '@/common/service-loader';
// #ifdef  APP-PLUS
import cacheImage from "@/components/media/cache-image.vue";
// #endif
import uniPopup from '@/components/vendor/uni-popup/uni-popup.vue';

const APP_URL = getApp().globalData.APP_URL;

let main;

export default {
  components: { 
    uniPopup,
    // #ifdef  APP-PLUS
    cacheImage
    // #endif 
  },
	data() {
    return {
			isAndroid: false,
      version: '',
      hasUpdate: false,
		}
	},

	onLoad() {
		uni.getSystemInfo({
      success: (res) => {
        if (res.platform === 'android') {
					this.isAndroid = true;
				};
      }
    });
    uni.getStorage({
      key: 'hasUpdate',
      success: (res) => {
        if (res.data == 1) {
          this.hasUpdate = true;
        } else {
          this.hasUpdate = false;
        }
      }
    });
		plus.runtime.getProperty(plus.runtime.appid, (wgtinfo)=>{
			this.version = wgtinfo.version
    });
  },

  methods: {
    checkUpdate() {
      main = plus.android.runtimeMainActivity();
      service('tool').checkAppUpdate(this.version, main.getPackageName()).then((res) => {
        if (res.data.error_code && res.data.error_code != 'SUCCESS') {
          return;
        }
        if (res.data.hasNew == '1') {
          uni.showTabBarRedDot({
            index: 3,
          });

          this.$refs.popup.open();
        }
        uni.setStorageSync('hasUpdate', res.data.hasNew);
      }).catch((error) => {
        console.log(JSON.stringify(error.data));
      })
    },

    cancel() {
      this.$refs.popup.close();
    },

    update() {
      plus.runtime.openURL(`${APP_URL}?package=${main.getPackageName()}`);
    }
  }
}

</script>

<style>
	.app-logo {
		padding-top: 80rpx;
		text-align: center;
		border-bottom: 1px solid #d9d9d9;
	}

	.description {
		padding: 30rpx 0;
	}

	.title {
		display: block;
		margin: 20rpx 0;
		font-weight: bold;
	}

  .app-intro {
		padding: 0 16rpx;
		background-color: #fff;
		line-height: 48rpx;
		font-size: 30rpx;
		color: #000;
  }

  .version {
    color: #888;
	}

  .ios-version {
    font-size: 14px;
    color: #888;
  }

	.logo {
		width: 160rpx;
		height: 160rpx;
	}

	.check {
		display: flex;
		justify-content: space-between;
    align-items: center;
		margin-top: 20rpx;
		width: 100%;
		padding: 30rpx 16rpx;
		font-size: 30rpx;
		background: #fff;
		box-sizing: border-box;
		border-top: 1px solid #d9d9d9;
	}

  .tips {
    display: inline-block;
    margin-right: 10rpx;
    width: 16rpx;
    height: 16rpx;
    background: #f00;
    border-radius: 50%;
  }

	.center {
		display: inline-block;
		width: 100%;
		text-align: center;
	}

	page {
		background: #eee;
	}

  .update-title {
    margin-bottom: 24rpx;
    width: 540rpx;
    font-size: 30rpx;
    font-weight: 700;
    text-align: center;
  }

  .update-button {
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
    font-size: 28rpx;
    color: #007aff;
  }
</style>

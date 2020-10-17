<template>
  <view class="tiku-page">
    <view class="auto-remove cell-list">
      <view>
        <view class="cell-title">自动移除错题集</view>
        <view class="cell-title remove-tips">开启后，重做错题答对，即可移出错题集</view>
      </view>
      <switch class="remove-icon" :checked="autoRemove" color='#3b8bfd' @change="toggleSetting('autoRemove')" />
    </view>
    <view class="auto-remove cell-list">
      <view>
        <view class="cell-title">自动跳转下一题</view>
        <view class="cell-title remove-tips">开启后，试题答对，即可自动跳转下一题</view>
      </view>
      <switch class="remove-icon" :checked="autoSkip" color='#3b8bfd' @change="toggleSetting('autoSkip')" />
    </view>
  </view>
</template>
<script>
export default {
  data() {
    return {
      autoRemove: false,
      autoSkip: false,
    }
  },
  onLoad() {
    let storageAutoRemove = uni.getStorageSync('autoRemove');
    if (storageAutoRemove) {
      this.autoRemove = storageAutoRemove;
    }
    
    let storageAutoSkip = uni.getStorageSync('autoSkip');
    if (storageAutoSkip.length <= 0) {
      this.autoSkip = true;
      uni.setStorageSync('autoSkip', this.autoSkip);
      return;
    }
    this.autoSkip = storageAutoSkip;
  },
  methods:{
    toggleSetting(option) {
      let storageValue;
      if (option == 'autoSkip') {
        storageValue = !this.autoSkip;
        this.autoSkip = storageValue;
      }

      if (option == 'autoRemove') {
        storageValue = !this.autoRemove;
        this.autoRemove = storageValue;
        uni.$emit('getAutoRemove', this.autoRemove);
      }

      try {
        uni.setStorageSync(option, storageValue);
      } catch (e) {
        console.log(e);
      }
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
  margin: 0 auto 20rpx;
  padding: 0 30rpx 0;
  border: 2rpx solid #e2e2e2;
  border-radius: 3px;
  width: 702rpx;
  height: 88rpx;
  box-sizing: border-box;
}

.icon-gengduo {
  color: #c9c9c9;
  font-size: 40rpx;
}

.cell-title {
  font-size: 30rpx;
  color: #333;
}

.remove-tips {
  font-size: 26rpx;
}
</style>
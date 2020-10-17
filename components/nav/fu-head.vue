<template>
  <view class="head">
    <!-- finish #2148 -->
    <view class="left-icon"> 
      <slot name="left-icon"></slot>
    </view>
    <view class="middle">
      <view v-if="dropDown" @click="toggleDropdown">
        <!-- 给标题添加过滤器 fix issue #1984 -->
        <text class="head-title">{{ title | omitString(16) }}</text>
        <text v-if="unfold" class="iconfont icon-shouqi icon-shouqi"></text>
        <text v-else class="iconfont icon-shouqi icon-shouqi" style="transform: rotate(180deg)"></text>
      </view>
      <text v-else class="head-title">{{ title | omitString(16) }}</text>
    </view>
    <view class="right-icon">
      <!-- issue #3187 头部右侧图标采用插槽形式 -->
      <slot name="right-icon"></slot>
    </view>
  </view>
</template>
<script>
export default {
  props: {
    dropDown: {
      type: Boolean,
      default: () => false,
    },

    unfold: {
      type: Boolean,
      default: () => false,
    },

		title: {
			type: String,
			default: () => '',
    },

    leftIcon: {
      type: String,
      default: () => '',
    },

    xialaIcon: {
      type: String,
      default: () => '',
    },

    leftText: {
      type: String,
      default: () => '',
    },
  },

  methods: {
    toggleDropdown() {
      this.$emit('change');
    },
    leftClick() {
      this.$emit('leftIconClick');
    }
  },
}
</script>
<style scoped>
  .head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-left: 32rpx;
    padding-right: 32rpx;
    width: 750rpx;
    height: 90rpx;
    box-sizing: border-box;
    background: #fff;
  }

  .middle {
    display: flex;
    align-items: center;
  }

  .head-title {
    margin-right: 5rpx;
    font-size: 34rpx;
    color: #000;
  }

  .icon-style {
    font-size: 32rpx;
    color: #999;
  }

  .icon-shouqi {
    display: inline-block;
    margin: 5rpx 0 0 6rpx;
    font-size: 32rpx;
    color: #5c9fff;
  }

  .icon-lianxikefu {
    font-size: 24px;
    color: #3b8bfd;
  }

  .icon-zaixiankefu {
    font-size: 20px;
    color: #3b8bfd;
  }

  .title-center {
    text-align: center;
  }

  /* finish #2148 */
  .back {
    display: flex;
    flex-direction: row;
  }

  .left-icon {
    display: flex;
    flex-direction: row;
    min-width: 40rpx;
    min-height: 20rpx;
  }

  .right-icon {
    display: flex;
    flex-direction: row;
  }


  .left-text {
    margin-right: 10rpx;
    font-size: 30rpx;
    color: #666;
  }
</style>

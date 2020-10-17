<template>
  <view class="drawer" :class="[`${condensed} ${direction}`]" @click="btnClick">
    <text class="text" :class="[`${textColor} ${textBorder}`]" v-if="text">{{ text }}</text>
    <text class="iconfont" :class="[`${icon} ${iconColor} ${iconSize}`]"></text>
  </view>
</template>
<script>
export default {
  props: {
    direction: { // 文字图标排序默认左文字右图标，有 horizontal-reverse， horizontal-reverse， vertical-direction-reverse
      type: String,
      default: () => '',
    },

    condensed: { // 增加按钮左间距, 有 left-distance 可选
      type: String,
      default: () => '',
    },

    textColor: { // 文字是否标蓝, 有 primary 可选
      type: String,
      default: () => '',
    },

    textBorder: { // 是否显示文字边框, 有 primary-border 可选
      type: String,
      default: () => '',
    },

    iconSize: { // 图标型号，有 medium可选
      type: String,
      default: () => '',
    },

    iconColor: { // 图标颜色，有 primary可选
      type: String,
      default: () => '',
    },

    text: { // 文本内容
      type: String,
      default: () => '',
    },

    icon: { // 图标
      type: String,
      default: () => '',
    },
  },

  methods: {
    btnClick() {
      this.$emit('click');
    },
  }
}
</script>
<style scoped>
  .drawer {
    display: flex;
    align-items: center;
    height: 90rpx;
  }

  .vertical-direction {
    flex-direction: column;
  }

  .vertical-direction-reverse {
    flex-direction: column-reverse;
  }

  .horizontal-reverse {
    flex-direction: row-reverse;
  }

  .left-distance {
    margin-left: 40rpx;
  }

  .text {
    font-size: 30rpx;
    color: #666;
  }

  .primary-border {
    padding: 0 6rpx;
    height: 40rpx;
    line-height: 40rpx;
    font-size: 20rpx;
    border: 2rpx solid #3b8bfd;
    border-radius: 20%;
  }

  .primary {
    color: #3b8bfd!important;
  }

  .iconfont {
    font-size: 16px;
    color: #666;
  }

  .medium {
    font-size: 19px;
  }
</style>
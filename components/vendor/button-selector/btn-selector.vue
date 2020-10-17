<template>
  <div class="btn">
    <text class="btn-text" v-text="title" v-if="title"></text>
    <text class="btn-text" v-text="yearTitle" v-else></text>
    <text class="iconfont icon-xiala"></text>
  </div>
</template>

<script>
export default {
  props: {
    title: {
      type: String,
      default: () => '',
    },
    yearTitle: {
      type: Number,
      default: () => 0,
    }
  }
}
</script>

<style scoped>
.btn {
  display: flex;
  width:583rpx;
  height: 80rpx;
  margin-bottom: 33rpx;
  padding-left: 25rpx;
  padding-right: 25rpx;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  border-radius: 10rpx;
  background-color: #ffffff;
}

.btn-text {
  color: #666666;
  font-size: 30rpx;
}
</style>


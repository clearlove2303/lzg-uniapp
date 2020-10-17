<template>
  <view>
    <view class="explain">
      <text class="title">注销说明</text>
      <text class="content">
        一.请仔细阅读本说明
      </text>
      <text class="content">
        二.注销操作是不可逆的。帐号一旦注销，相关的所有信息将被清除，不可还原。被清除的信息包括但不限于：帐号信息、登录凭证、购买的课程、学习记录等。
      </text>
      <text class="content">
        三.注销操作有7天的后悔期，在7天内登录帐号则中止注销过程。
      </text>
    </view>
    <button @click="gopage">下一步</button>
  </view>
</template>

<script>
export default {
  methods: {
    gopage() {
      this.$loc.open(`logoff/reason`);
    }
  }
}
</script>

<style scoped>
button {
  display: block;
  margin: 40rpx auto 0;
  width: 702rpx;
  height: 88rpx;
  border-radius: 44rpx;
  background: #3b8bfd;
  border: none;
  font-size: 34rpx;
  color: #fff;
}

.explain {
  margin: 30rpx auto;
  width: 702rpx;
  padding: 40rpx 22rpx 165rpx 23rpx;
  box-shadow: 0 0 6px 2px #eee;
  box-sizing: border-box;
}

.title {
  display: block;
  width: 100%;
  text-align: center;
  font-size: 40rpx;
  color: #000;
  font-weight: 500;
}

.content {
  display: block;
  text-indent: 52rpx;
  margin-top: 29rpx;
  line-height: 36rpx;
  font-size: 26rpx;
  color: #333;
  font-weight: 500;
}

button::after {
  border: none;
}
</style>

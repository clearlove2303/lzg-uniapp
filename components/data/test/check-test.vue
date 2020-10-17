<template>
  <view class="check">
    <text class="check-btn" :class="{activeStyle: active === 'A'}" @click="selected('A')">正确</text>
    <text class="check-btn" :class="{activeStyle: active === 'B'}" @click="selected('B')">错误</text>
  </view>
</template>

<script>
export default {
  props: {
    test: {
      type: Object,
      default: () => ''
    },
    testId: {
      type: Number,
      default: () => null,
    },
    showAnswer: {
      type: Boolean,
      default: () => false,
    },
  },
  data() {
    return {
      active: 'nothing',
    }
  },
  created() {
    this.setWatch();
  },

  methods: {
    selected(item) {
      if (this.showAnswer) {
        return;
      }
      this.active = item;
      let value = {
        result: item === 'A' ? '正确' : '错误',
        isRight: this.test.answer === item,
        content: this.test.answer === 'A' ? '正确' : '错误',
      };

      this.$emit('change', value);
    },
    setWatch() {
      if (this.showAnswer) {
        this.active = this.test.answer;
      } else {
        this.active = 'nothing';
      }
    }
  },
  watch: {
    testId() {
      this.setWatch();
    },
    showAnswer() {
      this.setWatch();
    }
  }
}
</script>

<style scoped>
  .check {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-around;
  }
  .check-btn {
    display: block;
    width: 240rpx;
    height: 60rpx;
    border-radius: 30rpx;
    border-color: #e4e4e4;
    border-width: 1rpx;
    border-style: solid;
    font-size: 24rpx;
    color: #333;
    text-align: center;
    line-height: 60rpx;
  }

  .activeStyle {
    border: #fff 1rpx solid;
    background: #007aff;
    color: #ffffff;
  }
</style>

<template>
  <view class="wrapper">
    <textarea maxlength='-1'
      placeholder="请根据题干写下你的答案"
      v-model="shortAnswer"
      :disabled="disabled"
      class="textarea"></textarea>
    <button class="submit" :disabled="disabled" @click="answer">提交</button>
  </view>
</template>

<script>
  export default {
    props: {
      test: {
        type: Object,
        default: () => {},
      },
      showAnswer: {
        type: Boolean,
        default: () => false,
      },
      testId: {
        type: Number,
        default: () => null,
      },
    },

    data() {
      return {
        shortAnswer: '',
        windowHeight: '',
        disabled: false,
      }
    },

    onLoad() {
      const res = uni.getSystemInfoSync();
      this.windowHeight = res.windowHeight;
    },

    created() {
      this.setWatch();
    },

    methods: {
      answer() {
        if(this.shortAnswer === '') {
          uni.showToast({
            title: '请输入答案',
            icon: 'none'
          });
          return;
        };
        this.$emit('change', {
          result: this.shortAnswer,
          isRight: true
        });
      },
      setWatch() {
        if (this.showAnswer) {
          this.shortAnswer = this.test.answer;
          this.disabled = true;
        } else {
          this.shortAnswer = '';
          this.disabled = false;
        }
      }
    },

    watch: {
      testId() {
        this.setWatch();
      },
      showAnswer() {
        this.setWatch();
      },

    },
  }
</script>

<style scoped>

  .wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .textarea {
    margin-bottom: 30rpx;
    padding: 30rpx;
    width: 690rpx;
    height: 356rpx;
    box-sizing: border-box;
    -webkit-appearance: none;
    box-shadow: 0 0 10rpx 2rpx #eee;
    word-wrap: break-word;
  }

  .submit {
    width: 690rpx;
    height: 88rpx;
    border-radius: 44rpx;
    opacity: 1;
    background-color: rgb(59, 139, 253);
    color: rgb(255, 255, 255);
    font-size: 34rpx;
    -webkit-box-align: center;
    -webkit-box-pack: center;
  }

  button:after {
    border: 0;
  }
</style>


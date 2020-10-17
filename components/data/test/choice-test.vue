<template>
  <view class="choice">
    <view class="choice-options">
      <view
        v-for="(option, index) in test.options"
        :key="index">
        <view class="options-item">
          <text>{{ indexes[index] }}.</text>
          <rich-text :nodes="convertTestText(option.content)"></rich-text>
        </view>
      </view>
    </view>
    <view class="choice-subtests">
      <view v-for="(subtest, index) in test.subtests" :key="index" class="subtests-list">
        <!-- issue #3306 改为富文本显示 -->
        <view class="subtest-title">
          <text>({{ index + 1 }})</text>
          <rich-text :nodes="convertTestText(subtest.title)" class="title"></rich-text>
        </view>
        <fu-choice-selector
          :optionData="test.options"
          :text="showAnswer ? subtest.answer : null"
          :disabled="showAnswer"
          :subTestsIndex="index"
          @overlayBottomClick="answer"></fu-choice-selector>
      </view>
    </view>
    <button class="submit" @click="submit" :disabled="showAnswer">提交</button>
  </view>
</template>
<script>
const INDEXES = getApp().globalData.INDEXES;

import fuChoiceSelector from '@/components/form/fu-choice-selector.vue';

export default {
  components: {
    fuChoiceSelector,
  },

  props: {
    test: {
      type: Object,
      default: () => {}
    },
    showAnswer: {
      type: Boolean,
      default: () => false,
    },
  },

  watch: {
    test(newValue) {
      this.indexes = this.handleAscii(newValue.options);
    },
  },

  data() {
    return {
      indexes: [],
      subtestAnswer: '点击选择',
      answerArray: [],
      disabled: false,
    }
  },
  created() {
    this.indexes = this.handleAscii(this.test.options);
    this.setWatch();
  },

  methods: {
    answer(e) {
      // 将每个分题的答案存到答案数组中
      this.answerArray[e.subTestsIndex] = e.optionValue;
    },

    submit() {
      // 所有分题没有全部作答
      if (this.answerArray.length < this.test.subtests.length) {
        uni.showToast({
          title: '请完成所有的分题',
          icon: 'none'
        });
        return;
      }

      for (let m = 0 ; m < this.answerArray.length ; m++) {
        if (!this.answerArray[m]) {  // 当前数组为empty时
          uni.showToast({
            title: '请完成所有的分题',
            icon: 'none'
          });
          return;
        }
      }

      // 获取每个分题的正确答案
      let subtestsIsRight = [];
      this.test.subtests.forEach(i => {
        subtestsIsRight.push(i.answer);
      });

      let isRight;
      let isRightArray = [];
      const answerString = this.answerArray.join('');
      for (let i = 0; i < this.answerArray.length; i++) {
        if (this.answerArray[i] == subtestsIsRight[i]) {
          isRight = true;
          isRightArray.push(isRight);
        } else {
          isRight = false;
          isRightArray.push(isRight);
        }
      }

      if (isRightArray.indexOf(false) === -1) {
        isRight = true;
      } else {
        isRight = false;
      }

      this.$emit('change', {
        result: answerString,
        isRight
      });
    },

    setWatch() {
      if (!this.showAnswer) {
        this.answerArray = [];
      }
    }
  },

  watch: {
    test() {
      this.setWatch();
    },
    showAnswer() {
      this.setWatch();
    }
  },
}
</script>
<style scoped>
  .choice-options,
  .choice-subtests {
    margin: 0 auto 20rpx;
    padding: 30rpx;
    width: 690rpx;
    box-sizing: border-box;
    border: 1px solid #eee;
  }

  .options-item {
    display: flex;
    padding-top: 20rpx;
    padding-bottom: 20rpx;
    width: 630rpx;
    font-size: 34rpx;
    color: #333;
    word-wrap: break-word;
  }

  .title {
    padding-left: 30rpx;
  }

  .subtests-list {
    margin-bottom: 30rpx;
  }

  .subtest-title {
    display: flex;
    margin-bottom: 20rpx;
    font-size: 30rpx;
    color: #666;
    word-wrap:break-word;
  }

  .subtest-btn {
    display: block;
    margin: 0 auto;
    width: 600rpx;
    height: 80rpx;
    font-size: 30rpx;
    color: rgb(153, 153, 153);
    text-align: center;
    line-height: 80rpx;
    border-radius: 50rpx;
    border: 1rpx solid #e5e5e5;
  }

  .submit {
    margin: 0 auto;
    width: 690rpx;
    height: 88rpx;
    font-size: 34rpx;
    color: #3b8bfd;
    text-align: center;
    line-height: 88rpx;
    border-radius: 50rpx;
    border-top: 0;
    background: #f8f8f8;
  }

  button:after {
    border: 0;
  }

  .option-cell {
    height: 114rpx;
    line-height: 114rpx;
    font-size: 32rpx;
    color: #333;
    text-align: center;
    border-bottom: 1rpx solid #e5e5e5;
  }
</style>

<template>
  <view class="compre">
    <view class="compre-box" v-for="(item, index) in test.subtests" :key="index" :class=" item.type.base_type == type.QA ? 'shortAnswerStyle' : ''">
      <view v-if="item.type.base_type == type.MULTIPLE">
        <rich-text :nodes="convertTestText(item.title)" class="title"></rich-text>
         <multiple-test
          :test="item"
          :testId="item.id"
          :subIndex="index"
          :showAnswer="showAnswer"
          @fuCheckBoxListChecked="selectMultiple"
        ></multiple-test>
      </view>
      <view class="single" v-if="item.type.base_type == type.SINGLE">
        <rich-text :nodes="convertTestText(item.title)" class="title"></rich-text>
        <single-test
          :options="item.options"
          :test="item"
          :testId="item.id"
          :subIndex="index"
          :showAnswer="showAnswer"
          @change="selectSingle"></single-test>
      </view>
      <view class="checkTest" v-if="item.type.base_type == type.CHECK">
        <rich-text :nodes="convertTestText(item.title)" class="title"></rich-text>
        <view class="check">
          <text class="check-btn" :class="{activeStyle: checkOptions[index] === 'A'}" @click="checkTest('A', index)">正确</text>
          <text class="check-btn" :class="{activeStyle: checkOptions[index] === 'B'}" @click="checkTest('B', index)">错误</text>
        </view>
      </view>
      <view class="shortAnswer" v-if="item.type.base_type == type.QA">
        <rich-text :nodes="convertTestText(item.title)" class="title"></rich-text>
        <view class="wrapper">
          <textarea
            maxlength='-1'
            placeholder="请根据题干写下你的答案"
            v-model="shortOptions[index]"
            class="textarea"
            :disabled="disabled"
          ></textarea>
        </view>
      </view>
    </view>
    <button class="submit" :disabled="disabled" @click="submit">提交</button>
  </view>
</template>

<script>
import singleTest from './single-test';
import multipleTest from './multiple-test';

const TestType = getApp().globalData.TEST_TYPE;
let allResult= true; // 所有题型是否都对
let multipleOptions= {}; // 多选题选中的答案
let singleOptions= {}; // 单选题选中的答案
let questionResult= ''; // 我的答案
let isShortAnswer = false; // 判断是否包含简答题
let results = [];

export default {
  components: {
    singleTest,
    multipleTest
  },
  props: {
    test: {
      type: Object,
      default: () => {},
    },
    testNum: {
      type: Number,
      default: () => 1,
    },
    showAnswer: {
      type: Boolean,
      default: () => false,
    },
    // finish #2414
    testId: {
      type: Number,
      default: () => null,
    },
  },
  data() {
    return {
      type: TestType,
      checkOptions: {}, // 判断题选中的答案
      shortOptions: {}, // 简答题的答案
      disabled: false,
    };
  },

  created() {
    this.init();
  },

  methods: {
    init() {
      this.clear();
      this.setWatch();
    },
    selectMultiple(e) { // 多选
      multipleOptions[e.subIndex] = e.result;
    },
    selectSingle(e) { // 单选
      singleOptions[e.subIndex] = e.result;
    },
    checkTest(e, i) { // 判断
      // 禁用判断题
      if (this.showAnswer) {
        return;
      }
      this.$set(this.checkOptions, i, e)
    },
    submit() {
      questionResult = '';
      allResult = true;
      results = [];
      isShortAnswer = false;
      for (var i = 0; i < this.test.subtests.length; i++) {
        // 多选题
        if (this.test.subtests[i].type.base_type == this.type.MULTIPLE) {
          this.multipleFunction(this.test.subtests[i], i);
        }
        // 单选题
        if (this.test.subtests[i].type.base_type == this.type.SINGLE) {
          this.singleFunction(this.test.subtests[i], i);
        }
        // 判断题
        if (this.test.subtests[i].type.base_type == this.type.CHECK) {
          this.checkFunction(this.test.subtests[i], i);
        }
        // 简答题
        if (this.test.subtests[i].type.base_type == this.type.QA) {
          this.shortFunction(i);
          isShortAnswer = true;
        }
      }

      if(results.length < this.test.subtests.length) {
        uni.showToast({
          title: '请完成所有的分题',
          icon: 'none'
        });
        return;
      }

      for (var j = 0; j < results.length; j++) {
        let num = results[j].index + 1;
        let temp = results[j].answer;
        questionResult += `${num}、${temp}  `;
      }

      this.$emit('change', {result: questionResult, isRight: allResult, isShortAnswer: isShortAnswer});
    },
    shortFunction(i) {
      const testResult = {
        index: i,
        answer: null,
      };
      // 判断是否答完全部题目
      if (this.shortOptions[i] && this.shortOptions[i].length > 0) {
        // 对答完提后的处理
        testResult.answer = this.shortOptions[i];
        results.push(testResult);
      }
    },
    checkFunction(subItem, i) {
      const testResult = {
        index: i,
        answer: null,
      };
      // 判断是否答完全部题目
      if (this.checkOptions[i] && this.checkOptions[i].length > 0 ) {
        let temp = this.checkOptions[i];
        let result = [];
        if (temp == 'A') {
          temp = "正确";
        } else {
          temp = "错误";
        }
        // 把答对的题存进一个数组
        if (temp != subItem.answer) {
          allResult = false;
        }

        testResult.answer = temp;
        results.push(testResult);
      }
    },
    singleFunction(subItem, i) {
      const testResult = {
        index: i,
        answer: null,
      };
      // 判断是否答完全部题目
      if (singleOptions[i] && singleOptions[i].length > 0) {
        let temp = singleOptions[i];
        testResult.answer = temp;
        if (temp != subItem.answer) {
          allResult = false;
        }

        results.push(testResult);
      }
    },
    multipleFunction(subItem, i) {
      const testResult = {
        index: i,
        answer: null,
      };

      // 判断是否答完全部题目
      if (multipleOptions[i] && multipleOptions[i].length > 0) {
        // 对答完题后的处理
        let temp = multipleOptions[i];
        testResult.answer = temp;
        if (temp != subItem.answer) {
          allResult = false;
        }
        results.push(testResult);
      }
    },
    setWatch() {
      if (this.showAnswer) {
        this.disabled = true;
        for (var i =0; i < this.test.subtests.length; i++) {
          // 判断题
          if (this.test.subtests[i].type.base_type == this.type.CHECK) {
            if (this.test.subtests[i].answer == "正确") {
              this.$set(this.checkOptions, i, 'A')
            } else {
              this.$set(this.checkOptions, i, 'B')
            }
          }
          // 简答题
          if (this.test.subtests[i].type.base_type == this.type.QA) {
            this.$set(this.shortOptions, i, this.test.subtests[i].answer);
          }
        }
      } else {
        this.disabled = false;
        this.checkOptions = {};
        // finish #2414
        for (var i =0; i < this.test.subtests.length; i++) {
          // 简答题
          if (this.test.subtests[i].type.base_type == this.type.QA) {
            this.$set(this.shortOptions, i, '');
          }
        }
      }
    },
    clear() {
      allResult = true;
      singleOptions = {};
      results = [];
      multipleOptions = {};
      this.checkOptions = {};
      // finish #2414
      for (var i =0; i < this.test.subtests.length; i++) {
        // 简答题
        if (this.test.subtests[i].type.base_type == this.type.QA) {
          this.$set(this.shortOptions, i, '');
        }
      }
      questionResult = '';
    }
  },
  watch: {
    // finish #2414
    testId() {
      this.init();
    },
    showAnswer() {
      this.init();
    }
  },
}
</script>

<style scoped>

.compre-box {
  margin-bottom: 20rpx;
  border: 1rpx solid #eee;;
}
.title {
  display: inline-block;
  margin: 30rpx 0;
  padding-left: 30rpx;
  word-break:break-all;
}

.single {
  padding-bottom: 20rpx; /* fix issue #2128 */
}

.check {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-around;
  margin-top: 20rpx;
  margin-bottom: 20rpx;
}

.check-btn {
  display: block;
  width: 240rpx;
  height: 60rpx;
  border-radius: 30rpx;
  border: 1rpx solid #e4e4e4;
  font-size: 24rpx;
  color: #333;
  text-align: center;
  line-height: 60rpx;
}

.activeStyle {
  border: 1rpx solid #fff;
  background: #007aff;
  color: #ffffff;
}

.shortAnswerStyle {
  border-width: 0
}

.textarea {
  display: block;
  margin: 0 auto 30rpx;
  padding: 30rpx;
  width: 636rpx;
  height: 356rpx;
  box-sizing: border-box;
  -webkit-appearance: none;
  box-shadow: 0 0 10rpx 2rpx #eee;
  word-wrap: break-word;
}

.submit {
  width: 690rpx;
  height: 88rpx;
  border-top: 0;
  border-radius: 50rpx;
  opacity: 1;
  background: #f8f8f8;
  color: #4ca0fd;
  font-size: 34rpx;
  -webkit-box-align: center;
  -webkit-box-pack: center;
}

button:after {
  border: 0;
}
</style>

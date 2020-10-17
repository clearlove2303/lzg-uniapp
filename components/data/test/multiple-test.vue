<template>
  <view class="multiple">
  <view class="fu-radio-list">
    <view
      v-for="(option, index) in test.options"
      :key="index">
      <view class="wrapper"
        @click="baseInputClicked(option, index)">
        <view
        class="option-letter"
        :class="{checkedStyle: actived[index] || (showAnswer && option.is_right === 1)}">
        {{ indexes[index] }}</view>

        <view class="option-text">
          <rich-text :nodes="convertTestText(option.content)"></rich-text>
        </view>
      </view>
    </view>
  </view>
  <button class="button" :disabled="disabled" @click="submit" v-if="isMultipleType">提交</button>
  </view>
</template>
<script>
  export default {
    props: {
      test: {
        type: Object,
        default: () => {},
      },
      testId: {
        type: Number,
        default: () => null,
      },
      showAnswer: {
        type: Boolean,
        default: () => false,
      },
      isMultipleType: {
        type: Boolean,
        default: () => false,
      },
      subIndex: {
        type: Number,
        default: () => -1,
      },
    },
    data() {
      return {
        indexes: [],
        indexStatus: [],
        actived: [],
        checkedAnswer: {
          result: '',
          isRight: false,
        },
        checkedList: [],
        disabled: false,
      };
    },

    created() {
      this.init();
    },

    watch: {
      testId() {
        this.init();
      },
      showAnswer() {
        this.init();
      },
    },
    methods: {
      init() {
        this.clear();
        this.setWatch();
      },

      clear() {
        this.indexes = this.handleAscii(this.test.options);
        this.checkedList = [];
        this.indexStatus = new Array(this.test.options.length).fill(false);
        this.disabled = false;
        // 清空样式
        for(var i in this.actived) {
          this.actived[i] = false;
        };
        this.checkedAnswer = {
          result: '',
          isRight: false,
        };
      },

      baseInputClicked(option, index) {
        if (this.showAnswer) {
          return;
        }
        // 可同时选中多个
        this.indexStatus[index] = !this.indexStatus[index];
        option.status = this.indexStatus[index];
        let newActive = [...this.actived];
        newActive[index] = option.status;
        this.actived = newActive;
        // 选中几个记录几个，选中再取消时将本条记录消除
        let result = this.indexes[index];
        if (this.actived[index] === true) {
          this.checkedList.push(result);
        } else {
          let index = this.checkedList.indexOf(result);
          this.checkedList.splice(index, 1);
        };
        let checkedList = this.checkedList.sort();
        result = checkedList.join('');
        let isRight = result === this.test.answer;

        this.checkedAnswer = {result, isRight};
        if (!this.isMultipleType) {
          this.$emit('fuCheckBoxListChecked', { result, isRight, subIndex: this.subIndex});
        }
      },

      submit() {
        if (this.disabled == true) {
          return;
        };
        if(!this.checkedAnswer.result) {
          uni.showToast({
            title: '请选择选项',
            icon: 'none'
          });
          return;
        };

        let res = {};
        let result = this.checkedAnswer.result;
        let isRight = this.checkedAnswer.isRight;
        Object.assign(res, {result, isRight})
        this.$emit('change', res);

        this.disabled = true;
      },

      setWatch() {
        if (this.showAnswer) {
          this.actived = [];
          this.disabled = true;
        } else {
          this.disabled = false;
        }
      }
    },
  };
</script>

<style scoped>
  .fu-radio-list {
    margin: 0 auto 20rpx;
    border: 1rpx solid #eee;
  }
  .wrapper {
    display: flex;
    flex-direction: row;
    margin: 0 auto;
    padding-top: 20rpx;
    padding-bottom: 20rpx;
    width: 610rpx;
  }
  .option-letter {
    margin-right: 20rpx;
    width: 66rpx;
    height: 66rpx;
    border: 2rpx solid #e4e4e4;
    border-radius: 33rpx;
    background-color: #fff;
    line-height: 64rpx;
    text-align: center;
    font-size: 30rpx;
    color: #333;
  }

  .option-text {
    padding-top: 10rpx;
    width: 508rpx;
    line-height: 44rpx;
    font-size: 34rpx;
    color: #000;
    text-align: justify;
    word-wrap: break-word;
  }

  .checkedStyle {
    border: 1rpx solid #3b8bfd;
    background: #3b8bfd;
    color: #fff;
  }

  .button {
    margin: 0 auto;
    border-top: 0;
    width: 690rpx;
    height: 88rpx;
    line-height: 88rpx;
    text-align: center;
    font-size: 34rpx;
    color: #4ca0fd;
    border-radius: 50rpx;
    background: #f8f8f8;
  }

  button:after {
    border: 0;
  }
</style>

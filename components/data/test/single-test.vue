<template>
  <view class="single-radio">
    <view
      v-for="(option, index) in options"
      :key="index">
      <view class="single-list" @click="baseInputClicked(option, index)">
        <view
          class="option-letter"
          :class="{actived: actived === index || (showAnswer && option.is_right === 1)}">{{ indexes[index] }}</view>

        <view class="option-text">
          <rich-text :nodes="convertTestText(option.content)"></rich-text>
        </view>
      </view>
    </view>
  </view>
</template>
<script>
  export default {
    props: {
      options: {
        type: Array,
        default: () => [],
      },
      subIndex: {
        type: Number,
        default: () => -1,
      },
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
    },

    data() {
      return {
        indexes: [],
        actived: null,
      };
    },

    created() {
      this.indexes = this.handleAscii(this.test.options);
    },

    watch: {
      test(newValue) {
        this.indexes = this.handleAscii(newValue.options);
      },

      testId() {
        this.setWatch();
      },
      showAnswer() {
        this.setWatch();
      },
    },

    methods: {
      baseInputClicked(option, index) {
        if (this.showAnswer) {
          return;
        }
        let res = {};
        const isRight = option.is_right ? true : false;
        const result = this.indexes[index];
        this.actived = index;
        Object.assign(res, {result, subIndex: this.subIndex, isRight})
        this.$emit('change', res);
      },
      setWatch() {
        this.actived = null
      }
    },
  };
</script>

<style scoped>
  .single-radio {
    margin: 0 auto;
    border: 1rpx solid #eee;
  }
  .single-list {
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
    padding: 0;
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

  .actived {
    border: 1rpx solid #3b8bfd;
    background: #3b8bfd!important;
    color: #fff!important;
  }
</style>


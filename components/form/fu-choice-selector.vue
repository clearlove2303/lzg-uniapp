<template>
  <view class="selector">
    <text
      v-text="subtestAnswer"
      @click="openPopup"
      class="subtest-btn"></text>
    <uni-popup ref="popup" type="bottom">
      <text
        v-for="(item, index) in optionData"
        :key="index"
        class="option-cell"
        @click="overlayBottomClick(index)">{{ indexes[index] }}</text>
    </uni-popup>
  </view>
</template>

<script>
import uniPopup from "@/components/vendor/uni-popup/uni-popup.vue";
export default {
  components: {
    uniPopup
  },

  props: {
    text: {
      type: String,
      default: () => null,
    },
    disabled: {
      type: Boolean,
      default: () => false,
    },
    optionData: {
      type: Array,
      default: () => []
    },
    subTestsIndex: {
      type: Number,
      default: () => null
    },
  },

  data() {
    return {
      indexes: [],
      selected: '点击选择',
    }
  },

  computed: {
    subtestAnswer() {
      return this.text || this.selected;
    },
  },

  methods: {
    openPopup() {
      if (this.disabled) {
        return;
      }

      this.$refs.popup.open();
    },

    overlayBottomClick(index) {
      this.selected = this.indexes[index];
      this.$refs.popup.close();
      this.$emit('overlayBottomClick', {
        optionValue: this.indexes[index],
        subTestsIndex: this.subTestsIndex,
      });
    },
  },

  created() {
    this.indexes = this.handleAscii(this.optionData);
  },

  watch: {
    optionData(newValue) {
      this.indexes = this.handleAscii(newValue);
      this.selected = '点击选择';
    },

    disabled() {
      this.selected = '点击选择';
    },
  },
}
</script>

<style scoped>
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
    border: 2rpx solid #e5e5e5;
  }

  .option-cell {
    display: block;
    height: 114rpx;
    line-height: 114rpx;
    font-size: 32rpx;
    color: #333;
    text-align: center;
    border-bottom: 1rpx solid #e5e5e5;
  }
</style>

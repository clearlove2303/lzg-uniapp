<template>
  <view>
    <view class="wxc-search-bar"
         :style="barStyle"
    >
      <input @blur="onBlur"
             @focus="onFocus"
             @input="onInput"
             @return="onSubmit"
             @confirm="onConfirm"
             confirm-type="search"
             :return-key-type="returnKeyType"
             :autofocus="autofocus"
             :disabled="disabled"
             :value="value"
             ref="search-input"
             :type="inputType"
             :placeholder="placeholder"
             :style="{ width: needShowCancel ? '630rpx' : '710rpx' }"
             class="search-bar-input" />
      <view v-if="disabled"
           @click="inputDisabledClicked"
           class="disabled-input"></view>
      <!--  #ifdef  MP-WEIXIN -->
      <image class="search-bar-icon"
             :aria-hidden="true"
             :src="inputIcon"
      ></image>
      <image class="search-bar-close"
             v-if="showClose"
             :imgUrl="closeIcon"
             @imgClick="closeClicked"
      ></image>
      <!--  #endif -->
      <!--  #ifdef  APP-PLUS -->
      <cache-image class="search-bar-icon"
             :imgUrl="inputIcon"
      ></cache-image>
      <cache-image class="search-bar-close"
             v-if="showClose"
             :imgUrl="closeIcon"
             @imgClick="closeClicked"
      ></cache-image>
      <!--  #endif -->
      <text :class="['search-bar-button','search-bar-button-']"
            :style="buttonStyle"
            v-if="needShowCancel"
            @click="cancelClicked">{{cancelLabel}}</text>
    </view>
  </view>
</template>

<script>
  // #ifdef  APP-PLUS
  import cacheImage from '../media/cache-image'
  // #endif
  const INPUT_ICON = "https://gw.alicdn.com/tfs/TB1FZB.pwMPMeJjy1XdXXasrXXa-30-30.png";
  const CLOSE_ICON = "https://gw.alicdn.com/tfs/TB1sZB.pwMPMeJjy1XdXXasrXXa-24-24.png";
  export default {
    name: 'fu-searchbar',
    // #ifdef  APP-PLUS
    components: {
      cacheImage
    },
    // #endif
    props: {
      disabled: {
        type: Boolean,
        default: false
      },
      alwaysShowCancel: {
        type: Boolean,
        default: false
      },
      inputType: {
        type: String,
        default: 'text'
      },
      returnKeyType: {
        type: String,
        default: 'default'
      },
      mod: {
        type: String,
        default: 'default'
      },
      autofocus: {
        type: Boolean,
        default: false
      },
      theme: {
        type: String,
        default: 'gray'
      },
      barStyle: {
        type: Object,
        default: () => ({})
      },
      defaultSearchTitle: {
        type: String,
        default: ''
      },
      placeholder: {
        type: String,
        default: '搜索'
      },
      cancelLabel: {
        type: String,
        default: '取消 '
      },
      depName: {
        type: String,
        default: '杭州'
      }
    },
    computed: {
      needShowCancel() {
        return this.alwaysShowCancel || this.showCancel;
      },
      buttonStyle() {
        const { barStyle } = this;
        if (barStyle.backgroundColor) {
          return { backgroundColor: barStyle.backgroundColor }
        }
        return {}
      }
    },
    data: () => ({
      inputIcon: INPUT_ICON,
      closeIcon: CLOSE_ICON,
      showCancel: false,
      showClose: false,
      value: ''

    }),
    watch: {
      defaultSearchTitle(newValue) {
        this.value = newValue;
        if (this.disabled) {
          this.showCancel = true;
          this.showClose = false;
        }
      },
    },
    methods: {
      onBlur() {
        const self = this;
        setTimeout(() => {
          self.showCancel = true;
          self.detectShowClose();
          self.$emit('searchbarInputOnBlur', { value: self.value });
        }, 10);
      },
      autoBlur() {
        this.$refs['search-input'].blur();
      },
      onFocus() {
        if (this.isDisabled) {
          return;
        }
        this.showCancel = true;
        this.detectShowClose();
        this.$emit('searchbarInputOnFocus', { value: this.value });
      },
      closeClicked() {
        this.value = '';
        this.showCancel && (this.showCancel = false);
        this.showClose && (this.showClose = false);
        this.$emit('searchbarCloseClicked', { value: this.value });
        this.$emit('searchbarInputOnInput', { value: this.value });
      },
      onInput(e) {
        this.value = e.detail.value;
        this.showCancel = true;
        this.detectShowClose();
        this.$emit('searchbarInputOnInput', { value: this.value });
      },
      onSubmit(e) {
        this.onBlur();
        this.value = e.detail.value;
        this.showCancel = true;
        this.detectShowClose();
        this.$emit('searchbarInputReturned', { value: this.value });
      },
      onConfirm(e) {
        this.onBlur();
        this.value = e.detail.value;
        this.showCancel = true;
        this.detectShowClose();
        this.$emit('tapToSearch', { value: this.value });
      },
      cancelClicked() {
        // issue #3309 右侧按钮改为搜索功能
        this.$emit('searchbarClicked', { value: this.value });
      },
      detectShowClose() {
        this.showClose = (this.value.length > 0) && this.showCancel;
      },
      depClicked() {
        this.$emit('searchbarDepChooseClicked', {});
      },
      inputDisabledClicked() {
        this.$emit('earchbarInputDisabledClicked', {});
      },
      setValue(value) {
        this.value = value;
      }
    }
  };
</script>

<style scoped>
  .wxc-search-bar {
    display: flex;
    flex-direction: row;
    padding-left: 20rpx;
    padding-right: 20rpx;
    width: 750rpx;
    height: 128rpx;
    background-color: #f5f9ff;
  }

  .search-bar-input {
    position: absolute;
    top: 20rpx;
    padding: 0 110rpx 0 60rpx;
    width: 624rpx;
    height: 88rpx;
    line-height: 88rpx;
    font-size: 34rpx;
    background-color: #fff;
    border-radius: 6rpx;
    box-sizing: border-box;
  }

  .search-bar-icon {
    position: absolute;
    left: 34rpx;
    top: 40rpx;
    width: 40rpx;
    height: 40rpx;
  }

  .search-bar-close {
    position: absolute;
    right: 120rpx;
    top: 40rpx;
    width: 40rpx;
    height: 40rpx;
  }

  .search-bar-button {
    position: absolute;
    right: 8rpx;
    top: 4rpx;
    width: 94rpx;
    height: 88rpx;
    line-height: 88rpx;
    margin-top: 16rpx;
    margin-right: 0;
    color: #3B8BFD;
    font-size: 34rpx;
    text-align: center;
    background-color: transparent;
  }


  .dep-text {
    flex: 1;
    margin-right: 6rpx;
    text-align: center;
    font-size: 26rpx;
    color: #666;
    lines: 1;
    text-overflow: ellipsis;
  }

  .disabled-input {
    position: absolute;
    left: 0;
    width: 750rpx;
    height: 64rpx;
    background-color: transparent;
  }

</style>

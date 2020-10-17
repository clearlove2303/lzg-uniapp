<template>
  <view
    v-if="showPopup"
    class="uni-popup">
    <view
      :class="[ani, animation ? 'ani' : '', !custom ? 'uni-custom' : '']"
      class="uni-popup__mask"
      @click="close(true)" />
    <view
      :class="[type, ani, animation ? 'ani' : '', !custom ? 'uni-custom' : '']"
      class="uni-popup__wrapper"
      @click="close(true)">
      <view
        class="uni-popup__wrapper-box"
        @click.stop="close(true)">
        <slot />
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'UniPopup',
  props: {
    // 开启动画
    animation: {
      type: Boolean,
      default: true
    },
    // 弹出层类型，可选值，top: 顶部弹出层；bottom：底部弹出层；center：全屏弹出层
    type: {
      type: String,
      default: 'center'
    },
    // 是否开启自定义
    custom: {
      type: Boolean,
      default: false
    },
    // maskClick
    maskClick: {
      type: Boolean,
      default: true
    },
    show: {
      type: Boolean,
      default: true
    }
  },
  data () {
    return {
      ani: '',
      showPopup: false
    }
  },
  watch: {
    show(newValue) {
      if (newValue) {
        this.open()
      } else {
        this.close()
      }
    }
  },
  methods: {
    open() {
      this.$emit('change', {
        show: true
      })
      this.showPopup = true
      this.$nextTick(() => {
        setTimeout(() => {
          this.ani = 'uni-' + this.type
        }, 30)
      })
    },
    close(type) {
      // if (!this.maskClick && type) return
      this.$emit('change', {
        show: false
      })
      this.ani = ''
      this.$nextTick(() => {
        setTimeout(() => {
          this.showPopup = false
        }, 300)
      })
    }
  }
}
</script>
<style lang="scss">
.uni-popup {
  position: fixed;
  top: 140rpx;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 99999;
  overflow: hidden;

  &__mask {
    position: absolute;
    top: 90rpx;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 998;
    background: rgba(0, 0, 0, 0.4);
    opacity: 0;

    &.ani {
      transition: all 0.3s;
    }

    &.uni-top,
    &.uni-bottom,
    &.uni-center {
      opacity: 1;
    }
  }

  &__wrapper {
    position: absolute;
    z-index: 999;
    box-sizing: border-box;

    &.ani {
      transition: all 0.3s;
    }

    &.top {
      top: 0;
      left: 0;
      width: 100%;
      transform: translateY(-100%);
    }

    &.bottom {
      bottom: 0;
      left: 0;
      width: 100%;
      transform: translateY(100%);
    }

    &-box {
      position: relative;
      box-sizing: border-box;
    }

    &.uni-custom {
      & .uni-popup__wrapper-box {
        background: #fff;
      }

      &.center {
        & .uni-popup__wrapper-box {
          position: relative;
          max-width: 80%;
          max-height: 80%;
          overflow-y: scroll;
        }
      }

      &.top,
      &.bottom {
        & .uni-popup__wrapper-box {
          width: 100%;
          max-height: 500px;
          overflow-y: scroll;
        }
      }
    }

    &.uni-top,
    &.uni-bottom {
      transform: translateY(0);
    }

    &.uni-center {
      transform: scale(1);
      opacity: 1;
    }
  }
}
</style>

<template>
  <view class="content" v-if="showMask" @click="closeMask" @touchmove.stop.prevent="">
    <view class="arrows">
      <cache-image class="image" :imgUrl="arrowImg"></cache-image>
      <text class="title">{{ maskTitle }}</text>
    </view>
  </view>
</template>
<script>
import cacheImage from '../media/cache-image'
const STATICURL = getApp().globalData.CDN;
export default {
  components: {
    cacheImage
  },
  props: {
    showMask: {
      type: Boolean,
      default: false
    },
    maskTitle: {
      type: String,
      default: '点击这里可以切换科目'
    }
  },
  data() {
    return {
      arrowImg: `${STATICURL}img-arrow.png`,
    }
  },
  methods: {
    closeMask() {
      this.$emit('changeMask')
    }
  }
}
</script>
<style scoped>
.content {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 999;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
}

.arrows {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: fixed;
  top: 125rpx;
  left: 31%;
  z-index: 9999;
}

.image {
  display: inline-block;
  width: 41rpx;
  height: 67rpx;
}

.title {
  color: #fff;
  font-size: 28rpx;
  margin-top: 31rpx;
}

.home-arrows {
  top: 668rpx;
}
</style>

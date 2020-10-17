<template>
  <view class="query-page">
    <web-view :src="url" class="contact-page"></web-view>
  </view>
</template>
<script>
const StaticUrl = getApp().globalData.H5Url;

export default {
  data() {
    return {
      url: null,
    };
  },

  onLoad() {
    this.url = `${StaticUrl}kefu.html`;
  }
}
</script>
<style scoped>
.query-page {
  display: flex;
  flex-direction: column;
}
.query-page {
  flex: 1;
  width: 750px;
}
</style>
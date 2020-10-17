<template>
  <view class="contact-page">
    <!-- #2226 更改地址协议为https -->
    <web-view :src="`${baseUrl}contact.html`" class="contact-page"></web-view>
  </view>
</template>
<script>
export default {
  data() {
    return {
      // finish #2332
      baseUrl: getApp().globalData.H5Url,
    };
  },
};
</script>
<style scoped>
.contact-page {
  display: flex;
  flex-direction: column;
}
.contact-page {
  flex: 1;
  width: 750px;
}
</style>



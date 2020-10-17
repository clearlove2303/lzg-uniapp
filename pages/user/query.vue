<template>
  <view class="query-page">
    <!-- #2226 更改地址协议为https -->
    <web-view :src="`${baseUrl}weixin/query.html`" class="contact-page"></web-view>
  </view>
</template>
<script>
export default {
  data() {
    return {
      baseUrl: getApp().globalData.WWW_URL,
    };
  },
};
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



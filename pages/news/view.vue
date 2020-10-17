<template>
  <web-view :src="url"></web-view>
</template>

<script>
  const StaticUrl = getApp().globalData.H5Url;

  export default {
    data() {
      return {
        url: '',
      };
    },

    onLoad(option) {
      this.url = `${StaticUrl}news/view.html?id=${option.id}`;
    },

  };
</script>

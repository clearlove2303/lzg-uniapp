<template>
  <web-view :src="url"></web-view>
</template>

<script>
const StaticUrl = getApp().globalData.H5Url;
let user = null;

export default {
  data() {
    return {
      url: null,
    };
  },

  onLoad(option) {
    user = this.$jwt.user()
    this.loadData(option.id);
  },

  methods: {
    loadData(id) {
      this.url = `${StaticUrl}document/view.html?id=${id}&token=${user.token}`;
    },
  },

};
</script>

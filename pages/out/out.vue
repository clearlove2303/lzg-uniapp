<template>
  <web-view :src="link" @message="handleMessage"></web-view>
</template>

<style>

</style>

<script>
export default {
  data() {
    return {
      link:'',
      url: '',
    }
  },
  onLoad(option) {
    this.link = decodeURIComponent(option.url);
  },
  onUnload() {
    uni.$emit('goBack', {url: this.url});
  },
  methods: {
    handleMessage(evt) {
      if (evt.detail.data.length <= 0) {
        return;
      }
      if (evt.detail.data[0].action == 'sign') {
        this.$loc.openTab(`study/index`);
      }
      if (evt.detail.data[0].action == 'courseView') {
        let duration = evt.detail.data[0].duration;
        this.url = evt.detail.data[0].url;
        uni.$emit('courseView', { duration : duration })
      }
    }
  }
}

</script>

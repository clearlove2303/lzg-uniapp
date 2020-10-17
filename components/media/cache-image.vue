<template>
  <image :src="imgSrc" :mode="imgMode" :resize="imgResize" @click="imgClick"></image>
</template>

<script>

import md5 from 'js-md5'
export default {
  data () {
    return {
      imgSrc: this.imgUrl,  
    }
  },
  props: {
    imgUrl : {
      type: String,
			default: () => '',
    },
    imgMode : {
      type: String,
			default: () => '',
    },
    imgResize : {
      type: String,
			default: () => '',
    }
  },

  watch: {
    imgUrl() {
      this.imgSrc = this.imgUrl;
      this.handleImageUrl();
    }
  },

  mounted () {
    this.imgSrc = this.imgUrl;
    this.handleImageUrl();
  },

  methods: {
    handleImageUrl() {
      if (this.imgUrl == '') {
        return false;
      }
      const imgName = md5(this.imgUrl);
      const savePath = `_doc/cache/images/${imgName}.jpg`;
      const url = plus.io.convertLocalFileSystemURL(savePath);
      setTimeout(() => {
        plus.io.resolveLocalFileSystemURL(url, (entry) => {
          this.imgSrc = savePath;
        }, (e) => {
          const dtask = plus.downloader.createDownload(this.imgUrl, { filename: savePath }, (res, status) => {
            if (res.state === 4) {
              let size = uni.getStorageSync('image-size');
              if (!size) {
                size = 0;
              }
              size += res.downloadedSize;
              uni.setStorageSync('image-size', size);
            }
          });
          dtask.start(); 
        })
      }, 500);
    },

    imgClick() {
      this.$emit('imgClick');
    }
  },
}
</script>

<style>

</style>
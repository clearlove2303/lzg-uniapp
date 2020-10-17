<template>
    <view class="download-page" :style="{height: systemInfo.windowHeight + 'px'}">
      <view class="status-bar"></view>
      <view class="head">
        <fu-head title="下载完成">
          <template slot="left-icon">
            <btn-icon
              icon="icon-back1"
              @click="goBack"></btn-icon>
          </template>
          <template slot="right-icon">
            <btn-icon
              :text="headRigthText"
              :textColor="textColor"
              @click="openPopup"></btn-icon>
          </template>
        </fu-head>
      </view>
      <view class="download-content">
        <checkbox-group>
          <view v-for="(item, index) in sections" :key="index" @click="checkItem(item)" 
            class="course-list" :style="{ padding: showPopup ? '0 24rpx' : '0' }">
            <checkbox class="checkbox" :checked="item.checked" :value="item.id" v-if="showPopup"></checkbox>
            <view class="course-item" :style="{ width: showPopup ? '648rpx' : '702rpx' }">
              <!-- #ifdef  MP-WEIXIN -->
              <image
                :src="item.cover != null ? item.cover.url : null"
                mode="scaleToFill"
                class="section-img"
                :class="item.cover != null ? '' : 'section-img-none'"></image>
              <!-- #endif -->
              <!-- #ifdef  APP-PLUS -->
              <cache-image
                :imgUrl="item.cover != null ? item.cover.url : null"
                imgMode="scaleToFill"
                class="section-img"
                :class="item.cover != null ? '' : 'section-img-none'"></cache-image>
              <!-- #endif -->
              <view class="course-content">
                <text class="course-title">{{ item.title }}</text>
                <text class="course-size">{{ item.totalSize | formatFileSize }}</text>
              </view>
            </view>
          </view>
        </checkbox-group>
      </view>
      <view class="popup-box" v-if="showPopup">
        <text class="popup-text" @click="toggleChooseAll">{{ chooseText }}</text>
        <text class="popup-text" @click="deleteSection" :style="{ background: chooseIds.length >= 1 ? '#e5e5e5' : '#f5f5f5' }">删除</text>
      </view>
      <view class="no-course" v-if="noCourse">
        <!-- #ifdef  MP-WEIXIN -->
        <image :src="noCourseImage | handleImgUrl('507', '345')" mode="scaleToFill" class="no-course-img"></image>
        <!-- #endif -->
        <!-- #ifdef  APP-PLUS -->
        <cache-image :imgUrl="noCourseImage | handleImgUrl('507', '345')" imgMode="scaleToFill" class="no-course-img"></cache-image>
        <!-- #endif -->
        <text class="no-course-text">没有下载视频~</text>
      </view>
    </view>
</template>
<script>
import fuHead from "@/components/nav/fu-head.vue";
import btnIcon from "@/components/nav/btn-icon.vue";
// #ifdef  APP-PLUS
import cacheImage from "@/components/media/cache-image.vue";
// #endif
import DownloadUtil from '@/common/download-util';
import CourseDownloader from "@/common/course-downloader";

const STATICURL = getApp().globalData.CDN;
export default {
  data() {
    return {
      systemInfo: {},
      sections: [],
      courseID: 0,
      showPopup: false,
      headRigthText: '编辑',
      chooseText: '全选',
      chooseAll: false,
      chooseIds: [],
      textColor: 'primary',
      noCourse: false,
      noCourseImage: `${STATICURL}img-no-video.png`,
      downloadStatus: getApp().globalData.DOWNLOAD_STATUS,
      downloadedSections: {},
    }
  },

  components: {
    fuHead, 
    btnIcon,
    // #ifdef  APP-PLUS
    cacheImage
    // #endif
  },

  watch: {
    showPopup(newVal) {
      if (newVal) {
        this.headRigthText = '取消'
      } else {
        this.headRigthText = '编辑'
      }
    },

    chooseAll(newVal) {
      if (newVal) {
        this.chooseText = '取消全选';
      } else {
        this.chooseText = '全选';
      }
    }
  },

  onLoad(option) {
    this.courseID = option.id;
    uni.getSystemInfo({
      success: (res) => {
        this.systemInfo = res;
      }
    })
    this.init();
  },

  onUnload() {
    this.saveStorage();
  },

  onHide() {
    this.saveStorage();
  },

  methods: {
    init() {
      this.downloadedSections = CourseDownloader.getDownloadedSections(this.courseID);
      for (let i in this.downloadedSections) {
        let section = Object.assign(this.downloadedSections[i], {id: i})
        this.sections.push(section);
      }
    },

    saveStorage() {
      CourseDownloader.saveCache(this.courseID);
    },

    openPopup() {
      if (this.sections.length <= 0) {
        return;
      }

      this.showPopup = !this.showPopup;
      this.chooseIds = [];
      
      for (var i = 0; i < this.sections.length; i++) {
        const item = this.sections[i];
        this.$set(item, 'checked', false)
      }
    },

    checkItem(item) {
      if (!this.showPopup) {
        this.$loc.open(`course/view?id=${this.courseID}&sid=${item.id}`)
        return;
      }

      item.checked = !item.checked;

      if (item.checked) {
        this.chooseIds.push(Number(item.id));
      } else {
        this.chooseIds.splice(this.chooseIds.findIndex(id => id == item.id), 1)
      }

      this.chooseAll = false;
      if (this.chooseIds.length == this.sections.length) {
        this.chooseAll = true;
      }
    },

    toggleChooseAll() {
      this.chooseAll = !this.chooseAll;
      this.chooseIds = [];
      this.sections.forEach(item => {
        this.$set(item, 'checked', this.chooseAll);
        if (this.chooseAll) {
          this.chooseIds.push(Number(item.id));        
        }    
      });
    },

    deleteSection() {
      if (this.chooseIds.length < 1) {
        uni.showToast({
          title: '您还没有勾选哦~',
          icon: 'none',
        });
        return;
      }

      this.showPopup = false;

      for (let i = 0; i < this.sections.length; i++) {
        const section = this.sections[i];
        let index = this.chooseIds.findIndex(id => id == Number(section.id));
        if (index != -1) {
          this.sections.splice(index, 1);
          CourseDownloader.removeDownloaded(this.courseID, section.id)
          uni.removeSavedFile({
            filePath: section.filename
          });
        }

        if (this.sections.length <= 0) {
          this.textColor = 'gary';
          this.noCourse = true;
        }
      }
 
    },

    goBack() {
      this.$loc.back()
    }
  }
}
</script>
<style scoped>
  .download-page {
    position: relative;
    width: 750rpx;
  }

  .status-bar {
    position: fixed;
    top: 0;
    left: 0;
    height: var(--status-bar-height);
    width: 100%;
    z-index: 9;
    background: #ffffff;
  }

  .head {
    position: fixed;
    top: var(--status-bar-height);
    left: 0;
    z-index: 9;
  }

  .download-content {
    padding-top: calc(var(--status-bar-height) + 90rpx);
    padding-bottom: 120rpx;
  }

  .active {
    color: #5B87C8;
  }

  .course-list {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .course-item {
    display: flex;
    justify-content: space-between;
    margin: 20rpx auto 0;
    padding: 20rpx;
    box-sizing: border-box;
    box-shadow: 0 0 7rpx rgba(0, 0, 0, 0.15);
    border-radius: 10rpx;
  }

  .checkbox {
    width: 34rpx;
    height: 34rpx;
    margin-right: 20rpx;
    transform: scale(0.8);
  }

  .section-img {
    margin-right: 25rpx;
    width: 164rpx;
    height: 120rpx;
  }

  .section-img-none {
    background-size: cover;
    background-image: url("../../static/img/img-cover.jpg");
  }

  .course-content {
    width: calc(100% - 190rpx);
  }

  .course-title {
    height: 76rpx;
    line-height: 38rpx;
    font-size: 30rpx;
    font-weight: bold;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow: hidden;
  }

  .course-size {
    display: flex;
    flex-direction: row-reverse;
    font-size: 24rpx;
    color: #999999;
  }

  .popup-box {
    display: flex;
    justify-content: space-between;
    position: fixed;
    bottom: 0;
    left: 0;
    width: 750rpx;
    height: 98rpx;
  }

  .popup-text {
    display: flex;
    justify-content: center;
    align-items: center;
    flex: 1;
    height: 98rpx;
    font-size: 30rpx;
    color: #555555;
    font-weight: bold;
    background: #e5e5e5;
  }

  .no-course-img {
    display: block;
    margin:  140rpx auto 0;
    width: 507rpx;
    height: 345rpx;
  }

  .no-course-text {
    display: block;
    text-align: center;
    font-size: 28rpx;
    color: #999;
  }
</style>
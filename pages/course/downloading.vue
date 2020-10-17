<template>
    <view class="downloading-page" :style="{height: systemInfo.windowHeight + 'px'}">
      <view class="status-bar"></view>
      <view class="head">
        <fu-head title="正在下载">
          <template slot="left-icon">
            <btn-icon
              icon="icon-back1"
              @click="goBack"></btn-icon>
          </template>
          <template slot="right-icon">
            <btn-icon
              :text="headRigthText"
              :textColor="textColor"
              @click="changeEdit"></btn-icon>
          </template>
        </fu-head>
      </view>
      <view class="download-content">
        <checkbox-group>
          <view v-for="(item, index) in sections" :key="index">
            <view
              class="course-list"
              :style="{ padding: isEdit ? '0 24rpx' : '0' }"
              @click="checkItem(item, index)"
              >
              <checkbox class="checkbox" :checked="chooseIds.includes(index)" :value="index" v-if="isEdit"></checkbox>
              <view class="item-box" :style="{ width: isEdit ? '648rpx' : '702rpx' }">
                <!-- #ifdef  MP-WEIXIN -->
                <image
                  :src="item.cover != null ? item.cover.url : null"
                  mode="scaleToFill"
                  class="section-img"
                  :class="item.cover != null ? '' : 'item-img-none'"></image>
                <!-- #endif -->
                <!-- #ifdef  APP-PLUS -->
                <cache-image
                  :imgUrl="item.cover != null ? item.cover.url : null"
                  imgMode="scaleToFill"
                  class="section-img"
                  :class="item.cover != null ? '' : 'item-img-none'"></cache-image>
                <!-- #endif -->
                  <view class="item-content">
                    <text class="item-title">{{ item.title }}</text>
                  <text class="percent-title" v-if="item.status == downloadStatus.DOWNLOADING">{{ item.speed | formatFileSize }}/s</text>
                  <text class="percent-title" v-else>{{ item.status | convertStatus }}</text>
                  <progress
                    :percent="item.progress"
                    :activeColor="[item.status ? '#999' : '#3b8bfd']"
                    backgroundColor="#e4e4e4"
                    border-radius='10'
                    duration="3000"
                    stroke-width='4'
                    class="percent-progress" />
                </view>
              </view>
            </view>
          </view>
        </checkbox-group>
      </view>
      <view class="control-box" v-if="!noCourse">
        <text
          class="control-text"
          @click="clickLeftButton"
          :style="{ background: !isEdit && disabledStartAll ? '#f5f5f5' : '' }">{{ chooseLeftText }}</text>
        <text class="control-text"
          @click="clickRightButton"
          :style="{ background: (chooseIds.length < 1 && isEdit) || (!isEdit && disablePauseAll) ? '#f5f5f5' : '' }">{{ chooseRightText }}</text>
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
import btnIcon from "@/components/nav/btn-icon.vue";
// #ifdef  APP-PLUS
import cacheImage from "@/components/media/cache-image.vue";
// #endif
import CourseDownloader from "@/common/course-downloader";
import DownloadUtil from '@/common/download-util';
import fuHead from "@/components/nav/fu-head.vue";

let courseID = null;
const STATICURL = getApp().globalData.CDN;

export default {
  data() {
    return {
      systemInfo: {},
      sections: {},
      isEdit: false,
      headRigthText: '编辑',
      chooseLeftText: '全部开始',
      chooseRightText: '全部暂停',
      chooseAll: false,
      chooseIds: [],
      textColor: 'primary',
      noCourse: false,
      noCourseImage: `${STATICURL}img-no-video.png`,
      downloadStatus: getApp().globalData.DOWNLOAD_STATUS,
      disablePauseAll: false, // 禁用全部暂停按钮
      disabledStartAll: false, // 禁用全部开始按钮
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
    isEdit(newVal) {
      if (newVal) {
        this.headRigthText = '取消';
        this.chooseLeftText = "全选";
        this.chooseRightText = "删除";
      } else {
        this.headRigthText = '编辑'
        this.chooseLeftText = "全部开始";
        this.chooseRightText = "全部暂停";
      }
    },
    chooseAll(newVal) {
      if (!this.isEdit) {
        return;
      }
      if (newVal) {
        this.chooseLeftText = "取消全选";
      } else {
        this.chooseLeftText = "全选";
      }
    }
  },

  filters: {
    convertStatus(status) {
      let title;
      switch(status) {
        case -1:
          title = "待下载";
          break;
        case 0:
          title = "下载中";
          break;
        case 1:
          title = "下载完成";
          break;
        case 2:
          title = "暂停中";
          break;
        case 3:
          title = "已暂停";
          break;
        case 4:
          title = "删除中";
          break;
        case 5:
          title = "已删除";
      }
      return title;
    }
  },

  onLoad(option) {
    courseID = option.id;
    uni.getSystemInfo({
      success: (res) => {
        this.systemInfo = res;
      }
    })
    this.init();
    uni.$on("section:downloaded", this.handleDownloaded);
  },

  onUnload() {
    uni.$off("section:downloaded", this.handleDownloaded);
    this.saveStorage();
  },

  methods: {
    init() {
      this.sections = {};
      this.sections = CourseDownloader.getDownloadingSections(courseID);
      for (let [index, section] of Object.entries(this.sections)) {
        if (section.status == this.downloadStatus.ABORTED) {
          this.$delete(this.sections, index);
        }
      }
      if (Object.keys(this.sections).length <= 0) {
        this.textColor = 'gary';
        this.noCourse = true;
      }
      this.checkisStartAllAndisPauseAll();
    },

    // 监听下载完成的小节
    handleDownloaded(e) {
      if (!this.sections[e.sectionId]) {
        return;
      }
      // 下载完成情况
      if (e.result.status == this.downloadStatus.DOWNLOADED) {
        this.$delete(this.sections, e.sectionId);
        if (Object.keys(this.sections).length <= 0) {
          this.textColor = 'gary';
          this.noCourse = true;
        }
      } else {
        this.$set(this.sections, e.sectionId, Object.assign(this.sections[e.sectionId], e.result));
      }
      this.checkisStartAllAndisPauseAll();
    },

    updateSectionStatus(tasks) {
      if (tasks.length <= 0) {
        return;
      }

      for (let [index, section] of Object.entries(this.sections)) {
        for (let task of tasks) {
          if (section.taskId == task.id) {
            section.status = task.status;
            this.$set(this.sections, index, section);
            break;
          }
        }
      }
    },

    saveStorage() {
      CourseDownloader.saveCache(courseID);
    },

    changeEdit() {
      if (Object.keys(this.sections).length <= 0) {
        return;
      }
      this.isEdit = !this.isEdit;
      this.chooseIds = [];
    },

    checkItem(item, index) {
      if (this.isEdit) {

        if (this.chooseIds.includes(index)) {
          this.chooseIds.splice(this.chooseIds.findIndex(id => id == index), 1);
        } else {
          this.chooseIds.push(index);
        }

        this.checkisChooseAll();
        return;
      }

      // 暂停中、删除中的视频点击无反应
      if (item.status ==  this.downloadStatus.TOPAUSE ||
        item.status ==  this.downloadStatus.TOABORT) {
        return;
      }

      // 点击在下载的、待下载会暂停， 暂停的会继续下载
      let task = CourseDownloader.toggle(courseID, index);
      if (task) {
        this.$set(this.sections, index, Object.assign(item, { status: task.status }));
      } else {
        this.$set(this.sections, index, Object.assign(item, { status: this.downloadStatus.ABORTED }));
      }
      this.checkisStartAllAndisPauseAll();
    },

    // 检查是否禁用全部开始按钮和全部暂停按钮
    checkisStartAllAndisPauseAll() {
      // 没有已暂停的则禁用全部开始按钮
      let isDisableStartAll = Object.values(this.sections).find(item => {
        return item.status == this.downloadStatus.PAUSED || item.status == this.downloadStatus.TOPAUSE;
      })
      if (isDisableStartAll) {
        this.disabledStartAll = false;
      } else {
        this.disabledStartAll = true;
      }

      // 没有已开始的则禁用全部暂停按钮
      let isDisablePauseAll = Object.values(this.sections).find(item => {
        // 待下载状态点击会暂停
        return (item.status == this.downloadStatus.TODOWNLOAD) || (item.status == this.downloadStatus.DOWNLOADING);
      })
      if (isDisablePauseAll) {
        this.disablePauseAll = false;
      } else {
        this.disablePauseAll = true;
      }
    },

    checkisChooseAll() {
      if (this.chooseIds.length == Object.keys(this.sections).length) {
        this.chooseAll = true;
      } else {
        this.chooseAll = false;
      }
    },

    clickLeftButton() {
      // 全选/取消全选
      if (this.isEdit) {
        this.chooseAll = !this.chooseAll;
        for (let index of Object.keys(this.sections)) {
          if (this.chooseAll) {
            this.chooseIds.push(index);
          } else {
            this.chooseIds = [];
          }
        }
        return;
      };

      // 全部开始
      let tasks = [];
      for (let [index, section] of Object.entries(this.sections)) {
        if (section.status == this.downloadStatus.PAUSED) {
          let task = CourseDownloader.resume(courseID, index);
          tasks.push(task);
        }
      }
      this.updateSectionStatus(tasks);
      this.checkisStartAllAndisPauseAll();
    },

    clickRightButton() {
      // 删除功能
      if (this.isEdit) {
        if (this.chooseIds.length < 1) {
          uni.showToast({
            title: '您还没有勾选哦~',
            icon: 'none',
          });
          return;
        }

        this.isEdit = false;
        let tasks = [];
        for (let id of this.chooseIds) {
          let task = CourseDownloader.remove(courseID, id);
          tasks.push(task);
        }
        this.updateSectionStatus(tasks);

        for (let index of Object.keys(this.sections)){
          if (this.chooseIds.find(id => id == index)) {
            this.$delete(this.sections, index);
          }
        }

        this.chooseIds = [];
        this.checkisStartAllAndisPauseAll();

        if (Object.keys(this.sections).length <= 0) {
          this.textColor = 'gary';
          this.noCourse = true;
        };
        return;
      };

      // 全部暂停功能
      let tasks = [];
      for (let [index, section] of Object.entries(this.sections)) {
        if (section.status == this.downloadStatus.TODOWNLOAD || section.status == this.downloadStatus.DOWNLOADING) {
          let task = CourseDownloader.pause(courseID, index)
          tasks.push(task)
        }
      }
      this.updateSectionStatus(tasks);
      this.checkisStartAllAndisPauseAll();
    },

    goBack() {
      this.$loc.back()
    }
  }
}
</script>
<style scoped>
  .downloading-page {
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
    background: #fff;
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

  .item-box {
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

  .item-img-none {
    background-size: cover;
    background-image: url("../../static/img/img-cover.jpg");
  }

  .item-content {
    width: calc(100% - 190rpx);
  }

  .item-title {
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
    color: #999;
  }

  .percent-title {
    display: flex;
    flex-direction: row-reverse;
    margin: -14rpx 0  9rpx 0;
    height: 34rpx;
    font-size: 24rpx;
    font-weight: bold;
    color: #3b8bfd;
  }

  .control-box {
    display: flex;
    justify-content: space-between;
    position: fixed;
    bottom: 0;
    left: 0;
    width: 750rpx;
    height: 98rpx;
  }

  .control-box .control-text:nth-child(1) {
    border-right: 1px solid #f5f5f5;
  }

  .control-text {
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

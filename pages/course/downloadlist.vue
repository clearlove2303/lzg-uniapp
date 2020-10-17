<template>
  <view class="page-download" :style="{height: systemInfo.windowHeight + 'px'}">
    <view class="status-bar"></view>
    <view class="course-head">
      <fu-head title="我的下载">
        <template slot="left-icon">
          <btn-icon
          icon="icon-back1"
          @click="goBack"></btn-icon>
        </template>
        <template slot="right-icon">
          <btn-icon
          :text="rightText"
          :textColor="textColor"
          @click="rightButtonClick"
          ></btn-icon>
        </template>
      </fu-head>
    </view>
    <view class="download-content" v-if="isDownloadingCourse.length > 0 || downloadFinishCourse.length > 0">
      <view class="downloading-list" v-if="isDownloadingCourse.length > 0">
        <text class="download-title">正在下载</text>
        <checkbox-group>
          <view v-for="(item, index) in isDownloadingCourse" :key="index" class="course-list"
          :style="{ padding: showBottomBtn ? '0 24rpx' : '0' }"  @click="goPage(item, 'downloading')">
            <checkbox class="checkbox" :checked="item.checked" :value="item.id" v-if="showBottomBtn && item.isDeleted != true"></checkbox>
            <view class="course-item" :style="{ width: showBottomBtn ? '648rpx' : '702rpx' }"  v-if="item.isDeleted != true">
              <image
                :src="item.cover != null ? item.cover.url : null"
                mode="scaleToFill"
                class="course-img"
                :class="item.cover && item.cover.url ? '' : 'course-img-none'"></image>
              <view class="course-content">
                <view class="course-title" v-if="!showBottomBtn">{{ item.title | omitString(24) }}</view>
                <view class="course-title" v-else>{{ item.title | omitString(20) }}</view>
                <view class="progress-box" v-if="item.isPaused">
                  <view class="progress-text">已暂停</view>
                  <progress
                    :percent="item.progress"
                    activeColor='#999999'
                    backgroundColor="#e4e4e4"
                    border-radius='10'
                    class="progress-percent"></progress>
                </view>
                <view v-else>
                  <view class="progress-text">{{ item.speed | formatFileSize }}/s</view>
                  <progress
                    :percent="item.progress"
                    activeColor='#3b8bfd'
                    backgroundColor="#e4e4e4"
                    border-radius='10'
                    class="progress-percent"></progress>
                </view>
              </view>
            </view>
          </view>
        </checkbox-group>
      </view>
      <view class="downloaded-list" v-if="downloadFinishCourse.length > 0">
        <text class="download-title">下载完成</text>
        <checkbox-group>
          <view v-for="(item, index) in downloadFinishCourse" :key="index" class="course-list"
          :style="{ padding: showBottomBtn ? '0 24rpx' : '0' }" @click="goPage(item, 'downloaded')">
            <checkbox class="checkbox" :checked="item.checked" :value="item.id" v-if="showBottomBtn"></checkbox>
            <view class="course-item" :style="{ width: showBottomBtn ? '648rpx' : '702rpx' }">
              <!-- #ifdef  MP-WEIXIN -->
              <image
                :src="item.cover != null ? item.cover.url : null"
                mode="scaleToFill"
                class="course-img"
                :class="item.cover != null ? '' : 'course-img-none'"></image>
              <!-- #endif -->
              <!-- #ifdef  APP-PLUS -->
              <cache-image
                :imgUrl="item.cover != null ? item.cover.url : null"
                imgMode="scaleToFill"
                class="course-img"
                :class="item.cover != null ? '' : 'course-img-none'"></cache-image>
              <!-- #endif -->
              <view class="course-content">
                <view class="course-title" v-if="!showBottomBtn">{{ item.title | omitString(24) }}</view>
                <view class="course-title" v-else>{{ item.title | omitString(20) }}</view>
                <view class="course-desp">
                  <text class="course-size">{{ item.sections }}个视频</text>
                  <text class="course-size">{{ item.totalSize | formatFileSize }}</text>
                </view>
              </view>
            </view>
          </view>
        </checkbox-group>
      </view>
    </view>
    <view class="no-course" v-else>
      <!-- #ifdef  MP-WEIXIN -->
      <image :src="noCourseImage | handleImgUrl('507', '345')" mode="scaleToFill" class="no-course-img"></image>
      <!-- #endif -->
      <!-- #ifdef  APP-PLUS -->
      <cache-image :imgUrl="noCourseImage | handleImgUrl('507', '345')" imgMode="scaleToFill" class="no-course-img"></cache-image>
      <!-- #endif -->
      <text class="no-course-text">当前考试暂无视频~</text>
    </view>
    <view class="bottom-btn" v-if="showBottomBtn">
      <text class="bottom-btn-text choice-text" @click="chooseAll">{{ chooseText }}</text>
      <text class="bottom-btn-text" @click="deleteCourse" :style="{ background: hasChoosed ? '#e5e5e5' : '#f5f5f5' }">删除</text>
    </view>
  </view>
</template>
<script>
import DownloadUtil from '@/common/download-util';
import btnIcon from "@/components/nav/btn-icon.vue";
// #ifdef  APP-PLUS
import cacheImage from "@/components/media/cache-image.vue";
// #endif
import fuHead from "@/components/nav/fu-head.vue";
import CourseDownloader from "@/common/course-downloader";
import cache from "@/plugins/cache/core.js";
import cacheKeys from '@/plugins/cache/keys.js';
import services from '@/common/service-loader';
const STATICURL = getApp().globalData.CDN;

let downloadedCourse = [];
let downloadingCourse = [];

export default {
  components: {
    fuHead, 
    btnIcon,
    // #ifdef  APP-PLUS
    cacheImage
    // #endif
  },


  data() {
    return {
      systemInfo: {},
      showBottomBtn: false,
      rightText: '编辑',
      chooseText: '全选',
      isChooseAll: false,
      courseIds: [],
      size: 0,
      noCourseImage: `${STATICURL}img-no-video.png`,
      downloadFinishCourse: [],
      isDownloadingCourse: [],
      textColor: 'primary',
      hasChoosed: false,
      downloadStatus: getApp().globalData.DOWNLOAD_STATUS,
    }
  },

  watch: {
    showBottomBtn(newVal) {
      if (newVal) {
        this.rightText = '取消'
      } else {
        this.rightText = '编辑'
      }
    },

    courseIds(newValue) {
      if (newValue.length >= 1) {
        this.hasChoosed = true;
      } else {
        this.hasChoosed = false;
      }
    },

    isChooseAll(newVal) {
      if (newVal) {
        this.chooseText = '取消全选';
      } else {
        this.chooseText = '全选';
      }
    },
  },

  onUnload() {
    this.saveStorage();
    // uni.$off("section:downloaded", this.handleDownloaded);
  },

  onHide() {
    this.saveStorage();
  },

  onLoad() {
    uni.getSystemInfo({
      success: (res) => {
        this.systemInfo = res;
      }
    });

    uni.$on("course:downloading", this.handleDownloadingCourse);

    uni.$on("section:downloaded", this.handleDownloaded);
  },

  onShow() {
    this.init();
  },

  methods: {
    handleDownloadingCourse(e) {
      // console.log(e.courseId)
    },

    init() {
      downloadingCourse = CourseDownloader.getDownloadingCourses();
      downloadedCourse = CourseDownloader.getDownloadedCourses();
     
      if (downloadingCourse == undefined) {
        this.isDownloadingCourse = [];
      }

      if (downloadedCourse == undefined) {
        this.downloadFinishCourse = [];
      }

      if (downloadingCourse != {}) {
        this.isDownloadingCourse = [];
        for (var i in downloadingCourse) {
          let courseObj;
          let tempCourse = downloadingCourse[i];
          services('course').get(Number(i)).then((res) => {
            courseObj = Object.assign(tempCourse, {id: res.data.id, title: res.data.title, cover: res.data.cover});
            this.isDownloadingCourse.push(courseObj);
          })
        }
      }

      if (downloadedCourse != {}) {
        this.downloadFinishCourse = [];
        for (var i in downloadedCourse) {
          let courseObj;
          let tempCourse = downloadedCourse[i];
          let sections = CourseDownloader.getDownloadedSections(Number(i));
          services('course').get(Number(i)).then((res) => {
            courseObj = Object.assign(tempCourse, {id: res.data.id, title: res.data.title, cover: res.data.cover, sections: Object.keys(sections).length});
            this.downloadFinishCourse.push(courseObj);
          })
        }
      }

      if (this.downloadFinishCourse == [] && this.isDownloadingCourse == []) {
        this.textColor = 'gray';
      }
    },

    handleDownloaded(e) {
      this.init();
    },

    initData() {
      this.courseIds = [];
      this.isChooseAll = false;
      this.chooseText = '全选';
    },

    rightButtonClick() {
      if (this.textColor === 'gray') {
        return;
      }

      this.initData();
      this.showBottomBtn = !this.showBottomBtn;

      for (let i in this.downloadFinishCourse) {
        this.$set(this.downloadFinishCourse[i], 'checked', false)
      }

      for (let i in this.isDownloadingCourse) {
        this.$set(this.isDownloadingCourse[i], 'checked', false)
      }
    },

    handleChooseData(type) {
      this.courseIds = [];
      this.downloadFinishCourse.forEach(item => {
        if (item.checked) {
          let obj = {
            id: item.id,
            type
          }
          this.courseIds.push(obj);
        }
      });

      this.isDownloadingCourse.forEach(item => {
        if (item.checked) {
          let obj = {
            id: item.id,
            type
          }
          this.courseIds.push(obj);
        }
      });

      if (this.courseIds.length === (this.isDownloadingCourse.length + this.downloadFinishCourse.length)) {
        this.isChooseAll = true;
      } else {
        this.isChooseAll = false;
      }
    },

    chooseAll() {
      this.isChooseAll = !this.isChooseAll;

      this.downloadFinishCourse.forEach(item => {
        this.$set(item, 'checked', this.isChooseAll);
        if (this.isChooseAll) {
          let obj = {
            id: item.id,
            type: 'downloaded'
          }
          this.courseIds.push(obj);
        } else {
          this.courseIds = [];
        }
      });

      this.isDownloadingCourse.forEach(item => {
        this.$set(item, 'checked', this.isChooseAll);
        if (this.isChooseAll) {
          let obj = {
            id: item.id,
            type: 'downloading'
          }
          this.courseIds.push(obj);
        } else {
          this.courseIds = [];
        }
      });
    },

    deleteCourse() {
      if (this.courseIds.length < 1) {
        uni.showToast({
          title: '您还没有勾选哦~',
          icon: 'none',
        });
        return;
      }

      this.showBottomBtn = false;

      let downloadingSections = [];
      let downloadedSections = [];

      for (let i = 0; i < this.courseIds.length; i++) {
        if (this.courseIds[i].type == 'downloading') {
          let sections = CourseDownloader.getDownloadingSections(this.courseIds[i].id);
          for (let i in sections) {
            downloadingSections.push(sections[i]);
          }
          this.removeCourse(this.courseIds[i].id, downloadingSections, 'downloading');
        }
        
        if (this.courseIds[i].type == 'downloaded') {
          CourseDownloader.removeDownloaded(this.courseIds[i].id);
          let sections = CourseDownloader.getDownloadedSections(this.courseIds[i].id);
          for (let i in sections) {
            downloadedSections.push(sections[i]);
          }
          this.removeCourse(this.courseIds[i].id, downloadedSections, 'downloaded');
        }
      }
    },

    removeCourse(courseId, sectios, type) {
      if (type == 'downloaded') {
        let index = this.downloadFinishCourse.findIndex(item => item.id == courseId);
        if (index != -1) {
          this.downloadFinishCourse.splice(index, 1);
        }
        for (var i in sectios) {
          uni.removeSavedFile({
            filePath: sectios[i].filename,
          });
        } 
      }

      if (type == 'downloading') {
        let index = this.isDownloadingCourse.findIndex(item => item.id == courseId);
        if (index != -1) {
          this.isDownloadingCourse.splice(index, 1);
        }
        for (var i in sectios) {
          CourseDownloader.remove(courseId, sectios[i]);
          uni.removeSavedFile({
            filePath: sectios[i].filename,
          });
        } 
      }
    },

    updateStatus(tasks) {
      tasks.forEach(task => {
        for (let i = this.isDownloadingCourse.length - 1; i >= 0; i--) {
          for (let index = this.isDownloadingCourse[i].sections.length - 1; index >= 0; index--) {
            if (this.isDownloadingCourse[i].sections[index].taskId == task.id) {
              if (task.status === this.downloadStatus.ABORTED) {
                this.isDownloadingCourse[i].sections.splice(index, 1);
              } else {
                this.isDownloadingCourse[i].sections[index].status = task.status;
              }
            }        
            if (this.isDownloadingCourse[i].sections.length < 1) {
              this.isDownloadingCourse.splice(i, 1);
            }
          }
        }   
      })
    },

    saveStorage() {
      let downloadingCourse = CourseDownloader.getDownloadingCourses();
      let downloadedCourse = CourseDownloader.getDownloadedCourses();
      let courseIds = [];
      if (downloadingCourse != {} || downloadingCourse != undefined) {
        for (let i in downloadingCourse) {
          courseIds.push(Number(i));
        }
      }

      if (downloadedCourse != {} || downloadedCourse != undefined) {
        for (let i in downloadedCourse) {
          courseIds.push(Number(i));
        }
      }

      courseIds.forEach(item => {
        CourseDownloader.saveCache(item);
      })
    },

    goPage(item, type) {
      if (this.showBottomBtn) {
        item.checked = !item.checked;
        this.handleChooseData(type);
        return;
      }

      if (type == 'downloaded') {
        this.$loc.open(`course/download-finish?id=${item.id}`);
      } else {
        this.$loc.open(`course/downloading?id=${item.id}`);
      }
    },

    goBack() {
      this.$loc.back();
    },
  }
}
</script>
<style scoped>
  .page-download {
    position: relative;
    width: 750rpx;
  }

  .status-bar {
    height: var(--status-bar-height);
    width: 100%;
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
    height: 160rpx;
    box-sizing: border-box;
    box-shadow: 0 0 7rpx rgba(0, 0, 0, 0.15);
    border-radius: 10rpx;
  }

  .course-img {
    margin-right: 25rpx;
    width: 164rpx;
    height: 120rpx;
  }

  .course-img-none {
    background-size: cover;
    background-image: url("../../static/img/img-cover.jpg");
  }

  .course-content {
    width: calc(100% - 190rpx);
  }

  .course-title {
    margin-top: -12rpx;
    height: 92rpx;
    line-height: 48rpx;
    font-size: 30rpx;
    font-weight: bold;
  }

  .course-desp {
    display: flex;
    justify-content: space-between;

  }

  .course-size {
    font-size: 24rpx;
    color: #999999;
  }

  .bottom-btn {
    display: flex;
    justify-content: space-between;
    position: absolute;
    bottom: 0;
    left: 0;
    width: 750rpx;
    height: 98rpx;
  }

  .bottom-btn-text {
    display: flex;
    justify-content: center;
    align-items: center;
    flex: 1;
    height: 98rpx;
    font-size: 30rpx;
    color: #555555;
    font-weight: bold;
    background: #f5f5f5;
  }

  .choice-text {
    background: #e5e5e5;
  }

  .download-title {
    display: block;
    margin: 30rpx 0 20rpx 24rpx;
    height: 34rpx;
    line-height: 34rpx;
    padding-left: 14rpx;
    color: #000;
    font-size: 34rpx;
    font-weight: bold;
    box-sizing: border-box;
    border-left: 6px solid #007aff;
  }

  .checkbox {
    width: 34rpx;
    height: 34rpx;
    margin-right: 20rpx;
    transform: scale(0.8);
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

   .progress-text {
    margin-top: -18rpx;
    margin-bottom: 10rpx;
    text-align: right;
    color: #3b8bfd;
    font-size: 24rpx;
  }
</style>

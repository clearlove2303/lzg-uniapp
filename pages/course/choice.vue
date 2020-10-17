<template>
  <view class="choice-page">
    <uni-popup ref="popup" type="bottom" class="section-list" @change="change">
      <view
        v-for="(item, index) in playInfo"
        :key="index"
        class="section-cell"
        @click="checkedNav(item, index)"
      >
        <text
          :class="[
            'download-type-title',
            item.title == downloadType.title ? 'active' : '',
          ]"
          >{{ item.title }}</text
        >
      </view>
    </uni-popup>
    <view class="popup-box" v-if="sections.length > 0">
      <view>当前清晰度：</view>
      <view @click="toggleDropdown">
        <text class="head-title">{{ downloadType.title }}</text>
        <text
          class="iconfont icon-shouqi"
          :style="{ transform: isUnfold ? '' : 'rotate(180deg)' }"
        ></text>
      </view>
    </view>
    <view
      :class="['section', item.checked ? 'section-active' : '']"
      v-for="(item, index) in sections"
      :key="index"
      @click="download(item, index)"
    >
      <text class="section-title"
        >{{ (index + 1) | addPreZero }}-{{ item.title }}</text
      >
      <text
        class="iconfont icon-checkmark"
        v-show="downloadedSections.hasOwnProperty(item.id)"
      ></text>
      <text
        class="iconfont icon-xiangxia"
        v-show="downloadingSections.hasOwnProperty(item.id)"
      ></text>
    </view>
    <view class="dialog">
      <view
        @click="chooseAll"
        :style="{ background: isDownloadAll ? '#f5f5f5' : '#e5e5e5' }"
        >{{ leftClickText }}</view
      >
      <view @click="goPage" v-if="leftClickText == '全部下载'">
        查看我的下载<text
          v-if="Object.keys(downloadingSections).length > 0"
          class="blue-text"
          >{{ Object.keys(downloadingSections).length }}</text
        >
      </view>
      <view @click="downloadAll" v-else style="color: #3b8bfd">
        确定下载<text class="blue-text">{{ choicesCount }}</text>
      </view>
    </view>
    <uni-load-more :loadingType="loadingType"></uni-load-more>
    <modal
      :show="showModal"
      confirmText="确认"
      title="提示"
      :text="modalText"
      :textShow="true"
      @confirm="confirm"
      :noCancel="true"
      @cancel="cancel"
    ></modal>
  </view>
</template>

<script>
import services from "@/common/service-loader";
import CourseDownloader from "@/common/course-downloader";
import DownloadUtil from "@/common/download-util";
import uniLoadMore from "@/components/vendor/uni-load-more/uni-load-more.vue";
import uniPopup from "@/components/custom/exam-popup/exam-popup.vue";
import modal from "@/components/custom/modal.vue";
let courseObj = null,
  page = 1,
  pageCount = null,
  chapters = [],
  downloadCourse = [],
  condition = {
    expand: "section",
  };
export default {
  components: { uniLoadMore, uniPopup, modal },
  data() {
    return {
      sections: [],
      downloadingSections: {},
      downloadedSections: {},
      loadingType: 0, // 定义加载方式 0---contentdown  1---contentrefresh 2---contentnomore
      title: "",
      isUnfold: true,
      downloadType: "",
      isChooseAll: false,
      playInfo: [
        {
          title: "标清 270P",
          type: "LD",
        },
        {
          title: "高清 480P",
          type: "SD",
        },
        {
          title: "取消",
        },
      ],
      leftClickText: "全部下载",
      choicesCount: 0,
      downloadStatus: getApp().globalData.DOWNLOAD_STATUS,
      showModal: false,
      chooseItem: 0,
      modalText: "",
      tasks: [],
    };
  },

  onLoad(option) {
    courseObj = JSON.parse(option.course);

    uni.$on("section:downloading", (e) => {
      // console.log(e);
    });

    uni.$on("section:downloaded", this.handleDownloaded);

    setTimeout(() => {
      this.showLoading();
      this.getChapter();
    }, 300);
  },

  onShow() {
    this.init();
  },

  onUnload() {
    page = 1;
    this.saveStorage();
  },

  onHide() {
    this.saveStorage();
  },

  watch: {
    isChooseAll(newValue) {
      if (newValue) {
        this.leftClickText = "取消全选";
      } else {
        this.leftClickText = "全部下载";
      }
    },
  },

  onReachBottom() {
    this.scrolltolower();
  },

  computed: {
    isDownloadAll() {
      return (
        Object.keys(this.downloadingSections).length === this.sections.length
      );
    },
  },

  methods: {
    init() {
      this.downloadType = this.playInfo[0];
      this.downloadingSections = CourseDownloader.getDownloadingSections(
        courseObj.id
      );
      this.downloadedSections = CourseDownloader.getDownloadedSections(
        courseObj.id
      );
    },

    handleDownloaded(e) {
      if (this.downloadingSections.hasOwnProperty(e.sectionId)) {
        this.$delete(this.downloadingSections, e.sectionId);
        this.$set(this.downloadedSections, e.sectionId, e.result);
      }
    },

    toggleDropdown() {
      if (this.isUnfold) {
        this.$refs.popup.open();
        this.isUnfold = false;
      } else {
        this.$refs.popup.close();
        this.isUnfold = true;
      }
    },

    change(e) {
      if (e.show == false) {
        this.isUnfold = true;
      }
    },

    checkedNav(item) {
      this.$refs.popup.close();
      this.isUnfold = true;
      if (this.downloadType == item || item.title == "取消") {
        return;
      }
      this.downloadType = item;
    },

    goPage() {
      this.$loc.open(`course/downloadlist`);
    },

    getVideoUrl(section) {
      if (!section.video_id) {
        return;
      }

      services("video")
        .find(section.video_id)
        .then((res) => {
          if (res.data.error_code && res.data.error_code !== "SUCCESS") {
            return;
          }
          section.play_info = res.data.play_info;
          section.cover = res.data.cover;
          if (!this.downloadingSections.hasOwnProperty(section.id)) {
            if (section.play_info) {
              let playinfo = section.play_info.filter(
                (item) => item.definition == this.downloadType.type
              );
              if (playinfo.length == 1) {
                this.$set(
                  this.downloadingSections,
                  section.id,
                  CourseDownloader.download(
                    courseObj.id,
                    section,
                  )
                );
                this.$set(section, "checked", false);
                return;
              }
            }
            this.noUrlAlert(section);
          }
        })
        .catch((e) => {
          this.noUrlAlert(section);
        });
    },

    saveStorage() {
      CourseDownloader.saveCache(courseObj.id);
    },

    getChapter() {
      services("course")
        .queryChapters(courseObj.id, condition, page)
        .then((res) => {
          this.hideLoading();
          if (res.data.error_code && res.data.error_code !== "SUCCESS") {
            return;
          }

          pageCount = res.data.page_count;

          if (page > 1) {
            chapters = chapters.concat(res.data.items);
          } else {
            chapters = res.data.items;
          }
          this.sections = [];

          chapters.forEach((item) => {
            if (item.sections) {
              item.sections.forEach((section) => {
                this.$set(section, "checked", false);
                this.sections.push(section);
              });
            }
          });
          if (page >= pageCount) {
            this.loadingType = 2;
            uni.hideNavigationBarLoading();
          }

          this.handleChapter();
        })
        .catch((err) => {
          this.hideLoading();
          this.loadingType = 2;
          uni.hideNavigationBarLoading();
        });
    },

    async download(item, index) {
      if (this.isChooseAll) {
        item.checked = !item.checked;
        this.handleChoiceCount();
        return;
      }
      this.chooseItem = index;
      
      if (this.downloadedSections.hasOwnProperty(item.id)) {
        this.showModal = true;
        this.modalText = "视频已下载，是否删除该视频？";
        return;
      }

      if (this.downloadingSections.hasOwnProperty(item.id)) {
        if (this.downloadingSections[item.id].status == this.downloadStatus.TOABORT) {
          let aborted = await CourseDownloader.isAborted(courseObj.id, item.id);
          if (aborted) {
            uni.showToast({
              title: "视频已删除，请重新下载",
              icon: "none",
            });
          } else {
            uni.showToast({
              title: "视频正在删除中...",
              icon: "none",
            });
          } 
        } else {
          this.modalText = "视频已在下载队列，是否移除该视频？";
        }
        this.showModal = true;
        return;
      }

      this.$set(item, "checked", true);
      this.getVideoUrl(item);
    },

    downloadAll() {
      this.isChooseAll = false;

      if (this.choicesCount < 1) {
        return;
      }

      this.sections.forEach((item, index) => {
        if (item.checked) {
          this.getVideoUrl(item);
        }
      });
    },

    chooseAll() {
      if (this.isDownloadAll) {
        return;
      }

      this.isChooseAll = !this.isChooseAll;

      if (this.isChooseAll) {
        this.sections.forEach((item) => {
          if (!this.downloadingSections.hasOwnProperty(item.id) && !this.downloadedSections.hasOwnProperty(item.id)) {
            this.$set(item, "checked", true);
          }
        });
        this.handleChoiceCount();
      } else {
        this.sections.forEach((item) => {
          this.$set(item, "checked", false);
        });
      }
    },

    handleChoiceCount() {
      let arr = [];

      this.sections.forEach((item) => {
        if (item.checked) {
          arr.push(item);
        }
      });

      this.choicesCount = arr.length;
    },

    scrolltolower() {
      if (this.loadingType !== 0) {
        return;
      }

      if (page < pageCount) {
        this.loadingType = 1;
        uni.showNavigationBarLoading();
        page++;
        this.getChapter();
      } else {
        this.loadingType = 2;
        uni.hideNavigationBarLoading();
        return;
      }
    },

    cancel() {
      this.showModal = false;
    },

    confirm() {
      this.showModal = false;
      if (this.downloadedSections.hasOwnProperty(this.sections[this.chooseItem].id)) {
        CourseDownloader.removeDownloaded(courseObj.id, this.sections[this.chooseItem].id);
        this.deleteSection(this.sections[this.chooseItem]);
        return;
      }

      if (this.downloadingSections.hasOwnProperty(this.sections[this.chooseItem].id)) {
        CourseDownloader.remove(courseObj.id, this.sections[this.chooseItem].id);
        this.deleteSection(this.sections[this.chooseItem]);
      }
    },

    deleteSection(section) {
      if (this.downloadedSections.hasOwnProperty(section.id)) {
        uni.removeSavedFile({
          filePath: this.downloadedSections[section.id].filename,
        });
        delete this.downloadedSections[section.id];
      } else {
        if (this.downloadingSections[section.id].filename) {
          uni.removeSavedFile({
            filePath: this.downloadingSections[section.id].filename,
          });
        }
        delete this.downloadingSections[section.id];
      }
    },

    noUrlAlert(section) {
      uni.showToast({
        title: `没有可用的下载地址：${section.title}`,
        icon: "none",
      });
      this.$set(section, "checked", false);
    },
  },
};
</script>

<style scoped>
.choice-page {
  padding-top: 82rpx;
  padding-bottom: 98rpx;
}

.iconfont {
  color: #3b8bfd;
}

.section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 20rpx auto 0;
  width: 702rpx;
  height: 88rpx;
  line-height: 88rpx;
  padding: 0 21rpx;
  border: 1px solid #e4e4e4;
  font-size: 30rpx;
  color: #000;
  box-sizing: border-box;
  font-weight: bold;
}

.dialog {
  position: fixed;
  bottom: 0;
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 98rpx;
  line-height: 98rpx;
  text-align: center;
  font-size: 30rpx;
  color: #555;
  background: #e5e5e5;
}

.dialog view {
  flex: 1;
  display: block;
}

.dialog view:nth-child(1) {
  background: #e5e5e5;
  border-right: 1px solid #f5f5f5;
}

.blue-text {
  display: inline-block;
  margin-left: 10rpx;
  font-weight: bold;
  color: #3b8bfd;
}

.middle {
  display: flex;
  align-items: center;
}

.head-title {
  margin-right: 5rpx;
  color: #3b8bfd;
}

.icon-shouqi {
  display: inline-block;
  margin: 5rpx 0 0 6rpx;
  font-size: 24rpx;
  color: #3b8bfd;
}

.popup-box {
  position: fixed;
  top: 0;
  display: flex;
  justify-content: center;
  width: 750rpx;
  height: 82rpx;
  line-height: 82rpx;
  background: #fff;
  font-size: 34rpx;
  color: #000;
  font-weight: bold;
}

.choice-page >>> .uni-popup {
  top: 0;
  text-align: center;
}

.choice-page >>> .uni-popup__mask {
  top: 0;
}

.section-cell {
  width: 100%;
  height: 88rpx;
  line-height: 88rpx;
  box-sizing: border-box;
  border-bottom: 1rpx solid #efefef;
  background: #fafafa;
}

.section-title {
  display: inline-block;
  width: 600rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.download-type-title {
  font-size: 30rpx;
  color: #333;
}

.active {
  color: #3b8bfd;
}

.section-active {
  border: 1px solid #3b8bfd;
}
</style>

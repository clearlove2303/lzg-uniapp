<template>
  <view class="wrapper">
    <view class="video">
      <video id="video" :src="playUrl" :poster="poster" play-status="play"
        autoplay="true" controls @timeupdate="getTime" @click="closeCover" @play="playVideo" @ended="playend">
        <!-- #ifdef H5 || MP-WEIXIN -->
        <cover-image
          v-if="coverImage"
          @click.stop="showSwitchSpeed"
          :src="speedIcon"
          class="speedIcon"></cover-image>
        <!-- #endif -->
        <cover-image
          v-if="coverImage"
          @click.stop="showSwitchDefinition"
          :src="definitionIcon"
          class="definitionIcon"></cover-image>
        <!-- fix issue #2227 -->
        <template v-if="showBgCoverView">
          <cover-view class="bgCoverView"></cover-view>
        </template>
        <template v-if="showSpeed">
          <cover-view
            v-for="(item, index) in speeds"
            :key="index"
            @click="switchSpeed(item)"
            class="cover-item"
            :class="[{actived: item == speedContent}, coverItemSpeed(index)]">{{ item }}</cover-view>
        </template>
        <template v-if="showDefinition">
          <cover-view
            v-for="(item, index) in playInfo"
            :key="index"
            @click="switchDefinition(item)"
            class="cover-item"
            :class="[{actived: item.definition == definition}, coverItemDefinition(index)]">{{ definitions[item.definition] }}</cover-view>
        </template>
        <!-- #ifdef H5 || MP-WEIXIN -->
        <cover-view  class="next-chapter" v-if="showCountDown">
          <cover-view class="self-play">自动播放下一节({{ countDown }}S)</cover-view>
          <cover-view class="cancel" @click="cancleDjs">取消</cover-view>
        </cover-view>
        <!-- #endif -->
      </video>
    </view>
    <view class="swiper-tab">
      <view v-for="(menuTab, index) in menuTabs" :key="index"
        :class="['swiper-tab-list', currentTab == index ? 'active' : '']"
        @click="swichMenu(index)">{{ menuTab.name }}</view>
    </view>
    <swiper :current="currentTab" class="swiper-box-list"
      duration="300" @change="swiperChange" :style="{height: windowHeight + 'px'}">
      <swiper-item class="directory">
        <chapter
        :chapters="chapters"
        :course="course"
        :sectionId="sectionId"
         @change="sectionVideo"
         ref="chapter"
         :style="{height: windowHeight + 'px'}"></chapter>
      </swiper-item>
      <swiper-item class="handout">
        <courses
        :course="course"
        :chapters="chapters"
        @change="showPopup"
        :sectionId="sectionId"
        :style="{height: windowHeight + 'px'}"
        ></courses>
      </swiper-item>
      <swiper-item class="introduction">
        <introduction :course="course"></introduction>
      </swiper-item>
    </swiper>
    <modal
      :show="modalShow"
      confirmText="确认"
      title= "此课件需要购买课程才可下载"
      :text="`课程名：${course.year ? course.year : ''}${course.title}`"
      :textShow="true"
      @confirm='confirm'>
      </modal>
  </view>
</template>

<script>
import { mapState } from 'vuex';

import introduction from '@/components/data/course/introduction.vue'
import courses from '@/components/data/course/courses.vue'
import chapter from '@/components/data/course/chapter.vue'
import modal from '@/components/custom/modal.vue';
import services from '@/common/service-loader';

let videoContext = null;
let timeout;
let seeking = false;
let currentSectionId = null;
// issue 2280
let timer = null;
let isShowNextChapter = false;
let page = 1;
let pageCount = 0;
let condition = {
  expand: 'section',
}

export default {
  components: {
    modal,
    introduction,
    courses,
    chapter,
  },
  data()  {
    return {
      currentTab: 0,
      poster: '',
      windowHeight: '',
      playUrl: '',
			menuTabs: [{
        name: '目录'
      }, {
        name: '讲义'
      }, {
        name: '介绍'
      }],
      course: {},
      chapters: {},
      sectionId: 0,
      courseId: 0,
      duration: 0,
      user: null,
      buyCourse: false,
      dialogTitle: '来学网',
      speeds: ['正常', '1.25x', '1.5x', '2.0x'],
      currentSpeed: 1.0,
      speedContent: '正常',
      speedIcon: `/static/img/1x.png`,
      showSpeed: false,
      playInfo: {},
      definition: '高清',
      showDefinition: false,
      definitionIcon: `/static/img/SD.png`,
      coverImage: false,
      definitions: {
        OD: '原画',
        FD: '流畅',
        LD: '标清',
        SD: '高清',
        HD: '超清',
      },
      showBgCoverView: false,
      showCountDown: false,
      countDown: 5,
      // issue 2280
      finished: 0,
      // finish #2569
      modalShow: false,
    }
  },

  watch: {
    chapters(newValue) {
      this.$nextTick(() => {
        if (newValue.length < 1) {
          return;
        }

        newValue.forEach(item => {
          if (!item.sections) {
            return;
          }
          item.sections.forEach(section => {
            if (this.sectionId == section.id) {
              item.open = true;
            }
          })
        })
      });
    }
  },
  computed: mapState(['hasLogin']),

  onLoad(option) {
    if (this.hasLogin) {
      this.user = this.$jwt.user();
    }
    const res = uni.getSystemInfoSync();
    this.windowHeight = res.windowHeight - 200;
    this.courseId = option.id;
    this.sectionId = option.sid;
    this.getCourseView();
    uni.$on('login', this.loadData);
	},

  onReady() {
    videoContext = uni.createVideoContext('video');
  },

  onUnload() {
    this.updateWatchRecord(this.sectionId);
    uni.$off('login', this.loadData);
  },

  onReachBottom() {
    if (page < pageCount) {
      page++;
      this.getChapter(this.courseId, condition, page);
    }
  },

  methods: {
    loadData(data) {
      this.user = data;
      this.getCourseView();
    },

    coverItemSpeed(index) {
      return "coverItemSpeed" + (index + 1);
    },

    coverItemDefinition(index) {
      return "coverItemDefinition" + (index + 1);
    },

    getTime(event) {
      if (seeking) {
        videoContext.seek(this.duration);
        seeking = false;
      }
      // issue 2102
      // issue 2284 视频观看完毕不自动跳到下一节
      this.duration = Math.floor(event.detail.currentTime);
      this.finished = 0;
    },

    playend() {
      this.finished = 1;
      isShowNextChapter = false;
      // issue 2102
      // issue 2284 视频观看完毕不自动跳到下一节
      clearInterval(timer);
      this.showCountDown = true;
      this.countDown = 5;
      // #ifdef  APP-PLUS
      this.countDown = 2;
      // #endif
      // 对章节进行处理
      let nextData = null;
      nextData =  this.getNextSection();
      if (!nextData) {
        clearInterval(timer);
        return;
      }
      timer = setInterval(() => {
        this.countDown--;
        if (this.countDown <= 0) {
          clearInterval(timer);
          // 应该跳到下个小节
          this.showCountDown = false;
          this.$refs.chapter.changeVideo(nextData.section);
          // issue 2285 最后一章播放完毕后应该收起本章节展开下一章节
          if (isShowNextChapter) {
            this.$refs.chapter.$refs.chapterItem[nextData.chapter].onClick();
          }
        }
      }, 1000);
    },

    getNextSection() {
      let nextData = {
        section: {
          chapter_id: null,
          id: null,
          price: null,
          title: null,
          video_id: null,
        },
        chapter: null,
      };
      let lastSection = null;
      for (let i = 0; i < this.chapters.length; i++) {
        if (!this.chapters[i].sections) {
          continue;
        }
        for (let j = 0; j < this.chapters[i].sections.length; j++) {
          lastSection = this.chapters[this.chapters.length - 1].sections[this.chapters[this.chapters.length - 1].sections.length - 1].id
          // 最后一章最后一节不提示跳转下一节
          if (currentSectionId === lastSection) {
            this.cancleDjs();
            return;
          }

          if (currentSectionId == this.chapters[i].sections[j].id) {
            // 如果当前小节不是所在章中的最后一节则找本章中的下一个小节
            if (j + 1 < this.chapters[i].sections.length) {
              nextData.section = this.chapters[i].sections[j + 1];
              return nextData;
            } else {
            // 如果当前小节是所在章中的最后一个小节则找下一个章中的第一个小节
              nextData.section = this.chapters[i + 1].sections[0];
              nextData.chapter = i + 1;
              isShowNextChapter = true;
              return nextData;
            }
          }
        }
      }
    },

    cancleDjs() {
      this.showCountDown = false;
      clearInterval(timer);
    },

    swichMenu(current) {
      if (this.currentTab == current) {
        return false;
      } else {
        this.currentTab = current;
      }
    },

    swiperChange(event) {
      this.currentTab = event.target.current;
    },

    // 视频章节
    getChapter(courseId, condition, page) {
      services('course').queryChapters(courseId, condition, page).then((res) => {
        if (res.data.error_code && res.data.error_code !== 'SUCCESS') {
          return;
        }
        pageCount = res.data.page_count;
        let chapters = res.data.items;
        let section = {};

        if (this.course.is_buyed == 0) {
          chapters.forEach((chapter) => {
            chapter.sections = chapter.sections.filter(section => section.price <= 0)
          })
        }

        for (let i = 0; i < chapters.length; i++) {
          let chapter = chapters[i];
          if (!chapter.sections) {
            continue;
          }
          if (!this.sectionId) {
            section = chapter.sections[0];
            this.sectionId = section.id;
            break;
          }
          for (let item = 0; item < chapter.sections.length; item++) {
            if (chapter.sections[item].id == this.sectionId && this.sectionId) {
              section = chapter.sections[item];
            }
          }
        }

        if (page > 1) {
          this.chapters = this.chapters.concat(chapters)
        } else {
          this.chapters = chapters
        }
        this.getVideoUrl(section);

        // 页面初始化时获得初始section.id
        currentSectionId = this.sectionId;
      });
    },

    // 视频地址
    getVideoUrl(section) {
      services('video').find(section.video_id).then((res) => {
        if (res.data.error_code && res.data.error_code !== 'SUCCESS') {
          return;
        }
        this.playInfo = res.data.play_info;
        this.playUrl = res.data.play_info[0].playurl;
        if (res.data.cover) {
          this.poster =  res.data.cover.url;
        }
        this.getSectionRecord(section.id);
      })
    },

    // 视频介绍
    getCourseView() {
      services('course').get(this.courseId).then((res) => {
        if (res.data.error_code && res.data.error_code !== 'SUCCESS') {
          return;
        }
        this.course = res.data;
        if (!this.user) {
          this.course.is_buyed = 0;
        }

        if (!this.course.description) {
        	this.course.description = '讲师根据新大纲要求，细致、深入、系统地讲解考纲所涉及的各个知识要点，突出考试重点、难点，紧跟命题方向，透彻解析教材，帮助考生形成专业理论构架，建立正确的解题思维体系，提高考生综合应试能力。';
        }

        this.getChapter(this.courseId, condition, page);
        let routes = getCurrentPages();
        let curRoute = routes[routes.length - 1].route;
        if (curRoute.indexOf('course/view') == -1) {
          return;
        }
        this.setTitle(this.course.title);
      })
    },

    // 切换视频
    sectionVideo(res) {
      // 切换视频时获得当前section.id
      currentSectionId = res.section.id;
      this.showCountDown = false;

      this.updateWatchRecord(this.sectionId);
      this.duration = 0;
      // issue 2286 观看未购买的章节不应该显示讲义
      this.sectionId = res.section.id;
      this.getVideoUrl(res.section);
    },

    showPopup(res) {
      // finish #2569
      if (this.course.is_buyed === 0) {
        this.modalShow = res.isShow;;
        return false;
      }
    },

    goPage() {
      this.$loc.open(`login/login`);
    },

    // 更新观看记录
    updateWatchRecord(sectionId) {
      // issue #3121
      if (sectionId === '' || this.duration <= 0 || !this.user) {
        return;
      }
      const tempDuration = this.duration;
      uni.request({
        url: 'https://pv.sohu.com/cityjson?ie=utf-8',
        success: (res) => {
          const substr = res.data.match(/"cip": "(\S*)", "cid"/);
          const ip = substr[1];
          const condition = {
            uid: this.user.id,
            cid: this.courseId,
            duration: tempDuration,
            is_finished: this.finished,
            ip,
          }
          services('course-record').watch(sectionId, condition);
        }
      });
    },

    // 获取观看记录
    getSectionRecord(sectionId) {
      services('course-record').queryBySection(sectionId).then((res) => {
        if (res.data.error_code) {
          return;
        }
        // issue 2280
        if (res.data.is_finished == 1) {
          videoContext.seek(0);
        } else {
          videoContext.seek(res.data.duration);
        }

        setTimeout(() => {
          videoContext.play();
        },1000);
      }).catch((error) => {
        videoContext.seek(0);
        setTimeout(() => {
          videoContext.play();
        }, 1000);
      })
    },

    confirm() {
      this.modalShow = false;
    },

    showSwitchSpeed() {
      this.showSpeed = true;
      this.showDefinition = false;
      this.showBgCoverView = true;
    },

    switchSpeed(e) {
      switch (e) {
        case '正常':
          this.speedIcon = `/static/img/1x.png`;
          this.currentSpeed = 1.0;
          this.speedContent = '正常';
          break;
        case '1.25x':
          this.speedIcon = `/static/img/1.25x.png`;
          this.currentSpeed = 1.25;
          this.speedContent = '1.25x';
          break;
        case '1.5x':
          this.speedIcon = `/static/img/1.5x.png`;
          this.currentSpeed = 1.5;
          this.speedContent = '1.5x';
          break;
        case '2.0x':
          this.speedIcon = `/static/img/2x.png`;
          this.currentSpeed = 2.0;
          this.speedContent = '2.0x';
          break;
        default:
          break;
      }
      this.showSpeed = false;
      this.showBgCoverView = false;
      videoContext.playbackRate(Number(this.currentSpeed));
    },

    showSwitchDefinition() {
      this.showDefinition = true;
      this.showSpeed = false;
      this.showBgCoverView = true;

      setTimeout(() => {
        this.showDefinition = false;
        this.showBgCoverView = false;
      }, 5000);
    },

    switchDefinition(e) {
      switch (e.definition) {
        case 'OD':
          this.definitionIcon = `/static/img/OD.png`;
          this.definition = '原画';
          break;
        case 'FD':
          this.definitionIcon = `/static/img/FD.png`;
          this.definition = '流畅';
          break;
        case 'LD':
          this.definitionIcon = `/static/img/LD.png`;
          this.definition = '标清';
          break;
        case 'SD':
          this.definitionIcon = `/static/img/SD.png`;
          this.definition = '高清';
          break;
        case 'HD':
          this.definitionIcon = `/static/img/HD.png`;
          this.definition = '超清';
          break;
        default:
          break;
      }

      for (let i = 0; i < this.playInfo.length; i++) {
        if (this.playInfo[i].definition == e.definition) {
          this.playUrl = this.playInfo[i].playurl;
        }
      }

      videoContext.play();
      seeking = true;
      this.showDefinition = false;
      this.showBgCoverView = false;
    },
    // fix issue #2229
    // #ifdef H5 || MP-WEIXIN
    closeCover() {
      if (this.coverImage) {
        this.coverImage = false;
      } else {
        clearTimeout(timeout);
        this.showCoverIcons();
      }
      if (this.showDefinition || this.showSpeed) {
        this.showDefinition = false;
        this.showSpeed = false;
        this.showBgCoverView = false;
      }
    },
    // #endif

    showCoverIcons() {
      this.coverImage = true;
      // fix issue #2229
      // #ifdef H5 || MP-WEIXIN
      timeout = setTimeout(() => {
        this.coverImage = false;
        this.showSpeed = false;
        this.showDefinition = false;
        this.showBgCoverView = false;
      }, 5000);
      // #endif
    },

    playVideo() {
      this.showCountDown = false;
      clearInterval(timer);
      this.showCoverIcons();
    }
  }
}
</script>

<style scoped>
  .wrapper {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .video {
    position: relative;
    height: 400rpx;
  }

  #video {
    position: relative;
    width: 750rpx;
    height: 400rpx;
  }

  .tab-bra {
    display: flex;
  }

  .swiper-tab {
    display: flex;
    justify-content: space-around;
    height: 76rpx;
    line-height: 76rpx;
    background: #fff;
    border-bottom: 1px solid #dcdcdc;
  }

  .swiper-tab-list {
    padding-left: 15rpx;
    padding-right: 15rpx;
    font-size: 30rpx;
    color: #222222;
  }

  .swiper-box-list {
    flex: 1;
    /* height: 800rpx; */
  }

  .active {
    color: #007aff;
    border-bottom: 2px solid #007aff;
  }

  .popup-title {
    margin-left: 45rpx;
    font-size: 40rpx;
  }

  .popup-btn {
    margin: 30rpx 40rpx 40rpx;
    height: 80rpx;
    line-height: 80rpx;
  }

  .speedIcon {
    position: absolute;
    top: 50%;
    right: 30rpx;
    margin-top: -100rpx;
    width: 80rpx;
    height: 80rpx;
  }

  .definitionIcon {
    position: absolute;
    top: 50%;
    right: 30rpx;
    width: 80rpx;
    height: 80rpx;
  }

  .cover-item {
    position: absolute;
    top:50%;
    right: 120rpx;
    width: 80rpx;
    height: 50rpx;
    font-size: 24rpx;
    line-height: 50rpx;
    color: #fff;
    font-weight: bold;
    text-align: center;
  }

  .cover-item.actived {
    color: #00d8ff;
  }

  .coverItemSpeed1 {
    margin-top: -100rpx;
  }

  .coverItemSpeed2 {
    margin-top: -50rpx;
  }

  .coverItemSpeed4 {
    margin-top: 50rpx;
  }

  .coverItemDefinition1 {
    margin-top: -50rpx;
  }

  .bgCoverView {
    position: absolute;
    margin-top: -120rpx;
    top: 50%;
    right: 120rpx;
    width: 80rpx;
    height: 240rpx;
    background-color: rgba(0, 0, 0, 0.65);
    border-top-left-radius: 50rpx;
    border-top-right-radius: 50rpx;
    border-bottom-right-radius: 50rpx;
    border-bottom-left-radius: 50rpx;
  }

  /*  #ifdef MP-WEIXIN  */
  .next-chapter {
    position: absolute;
    right: 23rpx;
    /* issue 2104 */
    bottom: 70rpx;
    width: 296rpx;
    height: 68rpx;
    color: #fff;
    font-size: 26rpx;
  }

  .next-chapter .self-play {
    display: flex;
    justify-content: space-between;
    line-height: 62rpx;
  }

  .next-chapter .cancel {
    position: absolute;
    right: 8rpx;
    bottom: 5rpx;
    width: 52rpx;
    font-size: 27rpx;
    line-height: 66rpx;
    background: none;
    color: #0c73ef;
  }
  /*  #endif  */
</style>

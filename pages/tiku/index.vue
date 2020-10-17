<template>
  <view class="exams">
    <!--  #ifdef  APP-PLUS -->
    <view class="status-bar">
      <!-- 这里占位div -->
    </view>
    <!--  #endif -->
    <view v-if="showExams">
      <!--  #ifdef  MP-WEIXIN -->
      <view class="nav" v-if="exams.length > 1">
        <scroll-view scroll-x="true" class="nav-scroller">
          <text
            v-for="(item, index) in exams"
            :key="index"
            :class="['nav-title', item.title == exam.title ? 'active' : '']"
            @click="checkedNav(item, index)">{{ item.title }}</text>
        </scroll-view>
      </view>
      <view class="search" @click="goPage('SEARCH')">
        <text class="search-title">搜索 {{ exam.title }} 题库</text>
        <text class="iconfont icon-query"></text>
      </view>
      <!--  #endif -->
      <!-- app头部组件 -->
      <!--  #ifdef  APP-PLUS -->
      <view v-if="exams.length > 1" class="tiku-head">
        <fu-head
        @change="examClicked"
        :title="exam.title"
        :dropDown="dropdownShow"
        :unfold="isUnfold">
          <template slot="left-icon">
            <btn-icon
            icon="icon-back1"
            @click="goBack"></btn-icon>
          </template>
          <template slot="right-icon">
            <btn-icon
            icon="icon-query"
            @click="goPage('SEARCH')"></btn-icon>
          </template>
        </fu-head>
      </view>
      <!-- fix issue #1983 -->
      <view v-else class="tiku-head">
        <fu-head
        :dropDown="false"
        :title="exam.title">
          <template slot="left-icon">
            <btn-icon
            icon="icon-back1"
            @click="goBack"></btn-icon>
          </template>
          <template slot="right-icon">
            <btn-icon
            icon="icon-query"
            @click="goPage('SEARCH')"></btn-icon>
          </template>
        </fu-head>
      </view>
      <!-- 题库切换 -->
      <uni-popup ref="popup" type="top" class="exam-list" @change="change">
        <view v-for="(item, index) in exams" :key="index" class="exam-cell" @click="checkedNav(item, index)">
          <text class="exam-title">{{ item.title }}</text>
        </view>
      </uni-popup>
      <!--  #endif -->
      <view class="circleprogress">
        <view class="progress-txt">
          <view class="progress-info">
            {{ rightPercent }}
            <text>%</text>
          </view>
          <text>正确率</text>
        </view>
        <view class="wrapper wrapper-l">
          <view class="leftprogress" :style="{ transform: leftprogress}"></view>
        </view>
        <view class="wrapper wrapper-r">
          <view class="rightprogress" :style="{ transform: rightprogress}"></view>
        </view>
      </view>
      <view class="exam-day">
        <view class="day-answer">
          <text class="day-answer-text">练习天数</text>
          <text class="day-answer-num">{{ examTotal.total_days }}</text>
          <text class="day-answer-num" v-if="examTotal.total_days == undefined">0</text>
        </view>
        <view class="day-answer">
          <text class="day-answer-text">累计答题</text>
          <text class="day-answer-num">{{ examTotal.total_tests }}</text>
          <text class="day-answer-num" v-if="examTotal.total_tests == undefined">0</text>
        </view>
      </view>
      <view class="history-box" @click="goToExamHistory()">
        <text class="iconfont icon-datijilu"></text>
        <text class="history-title">历史答题</text>
        <text class="history-exam-name" v-if ="historyPaperTitle == ''">暂无记录</text>
        <view class="history-arrow" v-else>
          <text class="history-exam-name">{{ historyPaperTitle }}</text>
          <text class="iconfont icon-gengduo"></text>
        </view>
      </view>
      <view class="favorite-box">
        <view class="favorite favorite-mistake" @click="goPage('FAV')">
          <text class="favorite-mistake-txt">我的收藏</text>
          <view class="favorite-mistake-icon">
            <text class="iconfont icon-favorite_diss favorite-mistake-iconfont"></text>
          </view>
        </view>
        <view class="mistake favorite-mistake" @click="goPage('WRONG')">
          <text class="favorite-mistake-txt">错题重做</text>
          <view class="favorite-mistake-icon">
            <text class="iconfont icon-cuotiku favorite-mistake-iconfont"></text>
          </view>
        </view>
      </view>
      <view class="exam-paper">
        <view
          class="paper"
          v-for="(item, index) in paperCategories"
          :key="index"
          :class="'paper-' + (index % paperIcon.length)"
          @click="goPapers(item)"
        >
          <text
            class="iconfont paper-icon"
            :class="'icon-' + paperIcon[index % paperIcon.length]"
          ></text>
          <text class="paper-txt">{{ item.title }}</text>
        </view>
      </view>
    </view>
    <!-- 没有数据展示 -->
    <view v-if="noExams" class="no-mine">
      <!-- app头部组件 -->
      <!-- #ifdef  APP-PLUS -->
      <fu-head @leftIconClick="goBack" leftIcon="icon-back1" :dropDown="false" :title="exam.title"></fu-head>
      <cache-image :imgUrl="noExamPic | handleImgUrl('507', '345')" imgMode="scaleToFill" class="no-mine-img"></cache-image>
      <!--  #endif -->
      <!-- #ifdef  MP-WEIXIN -->
      <image :src="noExamPic | handleImgUrl('507', '345')" mode="scaleToFill" class="no-mine-img"></image>
      <!-- #endif -->
      <view class="no-mine-text"> {{ noExamText }} </view>
    </view>
    <!-- #ifdef  APP-PLUS -->
    <first-mask :showMask="showMask" @changeMask="changeMask"></first-mask>
    <!-- #endif -->
  </view>
</template>

<script>
import btnIcon from "@/components/nav/btn-icon.vue";
import cacheKeys from '@/plugins/cache/keys.js';
import fuHead from "@/components/nav/fu-head.vue";
import { mapState } from 'vuex';
import services from '@/common/service-loader';
import uniPopup from "@/components/custom/exam-popup/exam-popup.vue";
// #ifdef  APP-PLUS
import cacheImage from "@/components/media/cache-image.vue";
import firstMask from '@/components/custom/first-mask.vue';
//  #endif

const StaticUrl = getApp().globalData.CDN;

let userId = null;
let majorId = null;

export default {
  // #ifdef  APP-PLUS
  components: { fuHead, btnIcon, uniPopup, firstMask, cacheImage },
  // #endif

  data() {
    return {
      exam: {
        id: null,
        title: '题库',
      },
      noExamText: '该题库暂无数据',
      exams: [],
      examTotal: {},
      paperCategories: [],
      showExams: false,
      noExams: false,
      scrollTop: 0 ,
      scrollMaxHeight: 200,
      leftprogress: 'rotate(-45deg)',
			rightprogress: 'rotate(45deg)',
      // #ifdef  APP-PLUS
      dropdownShow: true,
      isUnfold: true,
      showMask: false,
      // #endif
      historyPaperTitle: '',
      rightPercent: 0,
      paperIcon: ['zhangjiezhuanhuan', 'gaokaochongci', 'qiehuan', 'linianzhenti', 'changjingguanli', 'zuoti', 'zhangjiechuti'],
      noExamPic: StaticUrl + 'img-no-exam.png',
      lastPaper: null,
      angle0: true,
      angleThan180: false,
      rightTests: 0,
    }
  },

  onUnload() {
    uni.$off('doTest', this.updateExamSummary);
  },

  onLoad(option) {
    const user = this.$jwt.user();
    userId = user.id;
    //issue2020
    // #ifdef APP-PLUS
    // issue #2973
    let firstActive;
    firstActive = uni.getStorageSync('first-active');
    if (!firstActive) {
      firstActive = Object.assign({}, {tiku: 0});
    }
    if (!firstActive.tiku || firstActive.tiku != 1) {
      this.showMask = true;
      firstActive = Object.assign(firstActive, {tiku: 1});
      uni.setStorageSync('first-active', firstActive);
    }
    // #endif
    uni.$on('doTest', this.updateExamSummary);
    majorId = option.major_id;
    if (majorId) {
      this.getExamData(userId);
    } else if (option.id) {
      this.setTitle(option.title);

      this.showExams = true;
      this.exam = option;
      this.getPaperCategories(this.exam.id);
      this.getExamRecord(this.exam.id);
    } else {
      // nothing to do
    }
  },

  methods: {
    updateExamSummary(data) {
      const paperArray = ['错题集', '我的收藏', '搜索结果'];
      if (paperArray.includes(data.lastPaper.paper_title)) {
        return;
      }
      this.lastPaper = data.lastPaper;
      this.historyPaperTitle = this.lastPaper.paper_title;
      this.rightTests = data.testRecord.rightTotal + this.rightTests;
      this.examTotal.total_tests = data.testRecord.newRecordTotal + this.examTotal.total_tests;
      this.rightPercent = this.rightTests * 100 / this.examTotal.total_tests;
      this.rightPercent = Math.floor(this.rightPercent);
      this.progressBar();
    },

    getExamData(id) {
      this.loadCacheData(
        {
          key: cacheKeys.exams.pcats,
          params: [id],
          afterLoad: this.afterExamsLoad
        },
        services('exam').query(id, {"major_id": majorId}), 
        'exams'
      ).then((res) => {
        if (res.data.error_code) {
          return;
        }
        this.afterExamsLoad(res.data.items);
        this.getExamRecord(this.exam.id);
      });
    },

    afterExamsLoad(exams) {
      if (!exams || exams.length == 0) {
        this.exams = [];
        this.noExams = true;
        return;
      }
      if (exams.length <= 1) {
        // #ifdef  APP-PLUS
        this.dropdownShow = false;
        // #endif
      }
      this.showExams = true;

      // 设置当前题库
      this.exam = exams[0];
      this.setTitle(this.exam.title);
      this.getPaperCategories(this.exam.id);
    },

    // #ifdef  APP-PLUS
    examClicked() {
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
    // #endif

    goBack() {
      this.$loc.back();
    },

    checkedNav(item, index) {
      this.setTitle(item.title);
      uni.setStorageSync('tiku', item)
      uni.$emit('getTiku', item)
      this.exam = Object.assign({}, this.exam, item);
      this.getPaperCategories(this.exam.id);
      this.getExamRecord(item.id);

      // #ifdef  APP-PLUS
      this.$refs.popup.close();
      this.isUnfold = true;
      // #endif
    },

    /**
     * 获取答题记录
     *
     * @param {Number} id 题库id
     */
    getExamRecord(id) {
      this.resetRecord();
      this.getExamSummary(id);
      this.getLastPaper(id);
    },

    // 获取试卷分类
    getPaperCategories(examId) {
      const data = {
        parent: 0
      }
      this.loadCacheData(
        {
          key: cacheKeys.exams.papers,
          params: [examId, majorId],
        },
        services('paper-category').query(examId, data), 
        'paperCategories'
      )
    },

    resetRecord() {
      // 初始化统计和历史的数据，避免数据获取失败后缓存上次记录
      this.examTotal = {
        total_days: 0,
        total_tests: 0,
      }
      this.rightTests = 0;
      this.rightPercent = 0;
      this.historyPaperTitle = '暂无记录';
      this.paperCategories = [];
    },

    // 获取题库统计结果
    getExamSummary(examId) {
      services('exam').getSummary(userId, examId).then(res => {
        this.getExamSummaryData(res);
      })
    },

    getExamSummaryData(res) {
      if (res.data.error_code) {
        this.progressBar();
        return;
      }
      this.examTotal = res.data;
      this.rightPercent = res.data.right_percent;
      this.rightTests = (this.rightPercent * this.examTotal.total_tests) / 100;
      this.progressBar();
    },

    // 进度条
    progressBar() {
      let val = this.rightPercent;
      let deg = val/100*360;
      if (deg <= 180) {
        this.rightprogress = 'rotate('+(45+deg)+'deg)'
        this.leftprogress = 'rotate('+(-45)+'deg)'
      } else	{
        this.rightprogress = 'rotate('+(45+180)+'deg)'
        this.leftprogress = 'rotate('+(-45+(deg-180))+'deg)'
      }

      if (deg === 0 || deg < 180) {
        this.angle0 = true;
        this.angleThan180 = false;
      } else if (deg >= 180) {
        this.angleThan180 = true;
        this.angle0 = false;
      }
    },

    // 获取答题记录
    getLastPaper(examId) {
      // 获取最后一次答题数据
      services('test-record').getLastPaper(userId, {"exam_id": examId}).then((res)=> {
        this.getLastPaperData(res.data);
      });
    },

    getLastPaperData(data) {
      if (data.error_code && data.error_code !== 'SUCCESS') {
        return;
      }
      this.lastPaper = data;
      if (data.paper_title) {
        this.historyPaperTitle = data.paper_title;
      }
    },

    goPapers(item) {
      this.$loc.open(`tiku/papers?id=${item.id}&title=${item.title}&tiku_title=${this.exam.title}&exam_id=${this.exam.id}`);
    },

    goPage(page) {
      this.goPageHandler(this.exam.id, page);
    },

    goToExamHistory() {
      if (this.historyPaperTitle === '暂无记录') {
        return;
      }
      this.$loc.open(`tiku/paper?exam_id=${this.exam.id}&id=${this.lastPaper.paper_id}&paper_title=${this.lastPaper.paper_title}&test_order=${this.lastPaper.test_order}&source=history`);
    },

    goPageHandler(examId, page) {
      if (page === 'FAV') {
        this.$loc.open(`tiku/mine?id=${examId}&mode=${page}`);
      }
      if (page === 'WRONG') {
        this.$loc.open(`tiku/mine?id=${examId}&mode=${page}`);
      }
      if (page === 'SEARCH') {
        this.$loc.open(`tiku/search?id=${examId}`);
      }
    },

    changeMask() {
      this.showMask = false;
    }
  },
}
</script>

<style scoped>
.exams-head {
  position: fixed;
  top: 0;
  display: flex;
  flex-direction: row;
  width: 750rpx;
}

.exams {
  overflow: -Scroll;
  overflow-x: hidden;
  background-color: #ffffff;
}

.no-exam {
  display: flex;
  align-items: center;
  padding-top: 267rpx;
  margin-top: 90rpx;
}

.no-exam-text {
  margin-top: 45rpx;
  color: #999;
  font-size: 28rpx;
}

.exam-day {
  display: flex;
  flex-direction: row;
  margin-top: 59rpx;
}

.day-answer {
  display: flex;
  flex: 1;
  flex-direction: row;
  align-items: center;
  justify-content: center;
}

.day-answer-text {
  color: #666666;
  font-size: 34rpx;
}

.day-answer-num {
  padding-left: 30rpx;
  padding-top: 7rpx;
  font-size: 34rpx;
  font-weight: bold;
}

.history-arrow {
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
}

.history-box text:nth-child(3){
  display: block;
}

.iconfont {
  font-size: 35rpx;
}

.icon-datijilu {
  color: #3b8bfd;
}

.history-exam-name {
  width: 350rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: right;
  font-size: 34rpx;
  color: #3b8bfd;
}

.icon-gengduo {
  padding-top: 7rpx;
  color: #c9c9c9;
}

.favorite-box {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin-top: 40rpx;
  padding-left: 24rpx;
  padding-right: 24rpx;
}

.favorite-mistake {
  width: 341rpx;
  height: 180rpx;
  border-radius: 16rpx;
}

.favorite {
  background-color: #8c9ced;
}

.mistake {
  background-color: #aab1d2;
}

.favorite-mistake-txt {
  display: block;
  margin-top: 30rpx;
  margin-left: 30rpx;
  color: #fff;
  font-size: 30rpx;
}

.favorite-mistake-icon {
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  padding-right: 31rpx;
}

.favorite-mistake-iconfont {
  font-size: 78rpx;
  color: #fff;
  opacity: 0.5;
}

.exam-paper {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  flex-wrap: wrap;
  margin-bottom: 20rpx;
  padding-left: 35rpx;
  padding-right: 55rpx;
}

.paper {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 200rpx;
  height: 200rpx;
  box-sizing: border-box;
  margin-top: 20rpx;
  margin-left: 20rpx;
  border-radius: 16rpx;
}

.paper text {
  display: block;
}


.paper-icon {
  margin-bottom: 40rpx;
  font-size: 60rpx;
  color: #ffffff;
}

.paper-txt {
  width: 100%;
  padding: 0 30rpx;
  box-sizing: border-box;
  margin-left: 10rpx;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 30rpx;
  color: #fff;
}

.paper-0 {
  background-color: #edc293;
}

.paper-1 {
  background-color: #ed93a5;
}

.paper-2 {
  background-color: #94d4ed;
}

.paper-3 {
  background-color: #aa93ed;
}

.paper-4 {
  background-color: #c2ed93;
}

.paper-5 {
  background-color: #e6aae0;
}

.paper-6 {
  background-color: #ed93a5;
}


.history-box {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 702rpx;
  height: 88rpx;
  line-height: 88rpx;
  margin: 40rpx auto 0;
  padding: 0 54rpx;
  border: 2rpx solid #e2e2e2;
  box-sizing: border-box;
}

.history-box text {
  display: block;
}

.history-title {
  font-size: 34rpx;
  color: #000;
}

/* 进度条 */
.circleprogress{
  position: relative;
  display: flex;
  justify-content: center;
  /* margin-left: 100rpx; */
  width: 100%;
  height: 160px;
  padding-top: 30px;
  /*  #ifdef  APP-PLUS  */
  /* issue #2899 */
   margin-top: calc(var(--status-bar-height) + 45px);
  /*  #endif  */
  text-align: center;
}

.circleprogress .wrapper {
  width: 80px;
  height: 160px;
  overflow: hidden;
}

.circleprogress .leftprogress,.rightprogress {
  width: 120px;
  height: 120px;
  border: 20px solid #eee;
  border-bottom: 20px solid #3b8bfd;
  border-radius: 50%;
}

.circleprogress .leftprogress {
  border-right-color: #3b8bfd;
}

.circleprogress .rightprogress{
  margin-left: -80px;
  border-left-color: #3b8bfd;
}

.progress-txt {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100px;
  margin: -25px 0 0 -50px;
  font-size: 15px;
  color: #000;
}
.progress-info {
  font-size: 45px;
  font-family: PingFang SC;
  font-weight: 800;
  color:#000;
}
.progress-info text {
  font-size: 15px;
  font-weight: 400;
}
.icon-datijilu {
  font-size: 34rpx;
  margin-top: 6rpx;
}
.icon-query {
  font-size: 40rpx;
}
/*  #ifdef MP-WEIXIN  */
.nav-scroller {
  padding-left: 25rpx;
  padding-right: 25rpx;
  width: 700rpx;
  height: 60rpx;
}

.nav-title {
  white-space: nowrap;
  padding-left: 10rpx;
  padding-right: 10rpx;
  height: 60rpx;
  font-size: 30rpx;
  color: #000;
  font-weight: bold;
  line-height: 60rpx;
}

.nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.active {
  color: #3b8bfd;
}

.search {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 15rpx auto 0;
  padding: 0 29rpx;
  width: 702rpx;
  height: 88rpx;
  box-sizing: border-box;
  border-radius: 50rpx;
  border: 2rpx solid #9fc7ff;
}

.search-title {
  font-size: 34rpx;
  color: #999;
}
/*  #endif  */
/*  #ifdef  APP-PLUS  */
.exam-list {
  top: calc(var(--status-bar-height) + 90rpx);
  width: 750rpx;
}

.exam-cell {
  padding-left: 54rpx;
  width: 100%;
  height: 88rpx;
  line-height: 88rpx;
  box-sizing: border-box;
  border-bottom: 1rpx solid #efefef;
  background: #fafafa;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.exam-title {
  font-size: 30rpx;
  color: #333;
}
/* issue #2899 */
.status-bar {
  position: fixed;
  top: 0;
  left: 0;
  height: var(--status-bar-height);
  width: 100%;
  background: #fff;
  z-index: 9;
}
/* issue #2899 */
.tiku-head {
  position: fixed;
  top: var(--status-bar-height);
  left: 0;
  background: #fff;
  z-index: 9;
}
/*  #endif  */

.no-mine-img {
  display: block;
  margin:  140rpx auto 0;
  width: 507rpx;
  height: 345rpx;
}

.no-mine-text {
  display: block;
  text-align: center;
  font-size: 28rpx;
  color: #999;
}

.exams >>> .arrows {
  left: 50%;
}
</style>

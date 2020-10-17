<template>
	<view class="study">
    <!--  #ifdef  APP-PLUS -->
    <view class="status-bar">
      <!-- 这里占位div -->
    </view>
    <!--  #endif -->
    <!--  #ifdef  MP-WEIXIN -->
    <uni-nav-bar
      class = "nav-bar"
      leftText="选考试"
      :title="major.name"
      status-bar="true"
      shadow="false"
      border="false"
      @click-left-text="opencategories"
      fixed=true>
      </uni-nav-bar>
    <!--  #endif -->
    <!--  #ifdef  APP-PLUS -->
    <view class="home-head">
      <fu-head :title="major.name">
        <template slot="left-icon">
          <btn-icon
          text="选考试"
          textBorder="primary-border"
          textColor="primary"
          @click="opencategories"></btn-icon>
        </template>
        <template slot="right-icon">
          <btn-icon
          condensed="left-distance"
          icon="icon-zaixiankefu"
          iconColor="primary"
          iconSize="medium"
          @click="goPage('kefu')"></btn-icon>
        </template>
      </fu-head>
    </view>
    <!--  #endif -->
    <!-- 广告 -->
    <view class="advertisement">
      <swiper class="advertisement-swiper" autoplay="true" circular="true" interval=3000>
        <template v-for="(item, index) in advertisements">
          <swiper-item v-if="item.cover" :key="index">
            <!--  #ifdef  MP-WEIXIN -->
            <image :src="item.cover.url" class="banner" @click="swiperImgClicked(item)" mode="aspectFill"></image>
            <!--  #endif -->
            <!--  #ifdef  APP-PLUS -->
            <cache-image :imgUrl="item.cover.url" class="banner" @imgClick="swiperImgClicked(item)" imgMode="aspectFill"></cache-image>
            <!--  #endif -->
          </swiper-item>
        </template>
      </swiper>
    </view>
    <view class="categories-box" v-if="categories">
      <view
        class="categories-title"
        v-for="(category, index) in categories" :key="index"
        @click="checkCategories(category)">
        <text>{{ category | filterLength }}</text>
      </view>
      <text class="categories-title categories-all" @click="opencategories">全部</text>
    </view>
    <view class="image-content">
      <view class="image-content-left" @click="showTikuMask">
        <image class="xiangji" src="../../static/img/img-xiangji.jpg"></image>
        <text class="image-content-title image-left-title-top">拍照搜题</text>
      </view>
      <view class="image-content-right">
        <view class="image-content-guide" @click="goPage('news')">
          <text class="image-content-title image-right-title">报考指南</text>
          <image class="img-guide" src="../../static/img/img-guide.jpg"></image>
        </view>
        <view class="image-content-search" @click="goPage('query-teacher')">
          <text class="image-content-title image-right-title">微信查询</text>
          <image class="img-search" src="../../static/img/img-search.jpg"></image>
        </view>
      </view>
    </view>
    <!-- VIP课程 -->
    <view class="section-box" v-if="vipCourses">
      <text class="section-content-title">VIP课程</text>
      <view class="more-content" @click="openMore('latest')">
        <text class="section-more">查看全部</text>
        <text class="iconfont icon-gengduo"></text>
      </view>
    </view>
    <view class="vip-box" v-if="vipCourses">
      <view
        class="vip-content-item"
        v-for="(item, index) in vipCourses"
        :key="index"
        @click="watchCourse(item.id)">
        <view class="vip-teacher">
          <!--  #ifdef  MP-WEIXIN -->
          <image
          class="vip-image"
          mode="aspectFill"
          :src="item.teacher != null ? item.teacher.avatar : defaultAvatar"></image>
          <!--  #endif -->
          <!--  #ifdef  APP-PLUS -->
          <cache-image
          class="vip-image"
          imgMode="aspectFill"
          :imgUrl="item.teacher != null ? item.teacher.avatar : defaultAvatar"></cache-image>
          <!--  #endif -->
          <text class="vip-teacher-name" v-if="item.teacher">{{ item.teacher.name }}</text>
        </view>
        <view class="vip-content">
          <view class="vip-star-content">
            <text class="vip-tag">{{ major.name }}</text>
            <view class="icon-star" v-if="item.star">
              <text v-for="i in item.star" :key="i" class="iconfont icon-dafen02 "></text>
              <text class="icon-star-title">{{ item.star }}</text>
            </view>
          </view>
          <text class="vip-content-title">{{ item.year ? item.year : ''}}{{ item.title }}</text>
          <view class="vip-bottom-box">
            <text class="vip-tip-course">总课时：{{ item.hours }}</text>
            <view class="vip-button">免费试看</view>
          </view>
        </view>
      </view>
    </view>
    <!-- 免费课程 -->
    <view class="section-box" v-if="latestCourses">
      <text class="section-content-title">免费课程</text>
      <view class="more-content" @click="openMore('free')">
        <text class="section-more">查看全部</text>
        <text class="iconfont icon-gengduo"></text>
      </view>
    </view>
    <swiper class="course-box" v-if="latestCourses">
      <swiper-item
      class="couse-item-box"
      v-for="(item, index) in latestCourses"
      :key="index">
        <view class="couse-item" @click="watchCourse(item.id)">
          <!--  #ifdef  MP-WEIXIN -->
          <image
            class="course-image"
            mode="aspectFill"
            :src="item.cover != null ? item.cover.url : defaultCover"></image>
          <!--  #endif -->
          <!--  #ifdef  APP-PLUS -->
          <cache-image
            class="course-image"
            imgMode="aspectFill"
            :imgUrl="item.cover != null ? item.cover.url : defaultCover"></cache-image>
          <!--  #endif -->
          <text class="course-title">{{ item.year ? item.year : ''}}{{ item.title }}</text>
          <view class="course-tip">
            <text class="course-tip-left">{{ major.name }}</text>
            <view class="course-tip-course">
              <text class="course-tip-course-title">{{ item.hits }}</text>次播放
            </view>
          </view>
        </view>
      </swiper-item>
    </swiper>
    <!-- 在线题库 -->
    <view class="section-box" v-if="exams.length > 0">
      <text class="section-content-title">在线题库</text>
    </view>
    <swiper
      v-if="exams.length > 0"
      class="tiku-box"
      :style="{'height': swiperHeight + 'rpx'}"
      indicator-color="#e5e5e5"
      indicator-active-color="#237ee2"
      :indicator-dots="tikuShowDots">
      <swiper-item class="tiku-swiper-item" :key="index" v-for="(swiperItem, index) in exams">
        <view class="exam-item" :key="i" v-for="(item, i) in swiperItem" @click="goPapers(item)">
          <text class="exam-item-title">{{ item.title }}</text>
          <view class="exam-item-btn">免费试做</view>
        </view>
      </swiper-item>
    </swiper>
    <!-- 最新资讯 -->
    <view class="section-box" v-if="articleList.length > 0">
      <text class="section-content-title">最新资讯</text>
      <view class="more-content" @click="openMore('headline')">
        <text class="section-more">查看全部</text>
        <text class="iconfont icon-gengduo"></text>
      </view>
    </view>
    <view class="news-box" v-if="articleList.length > 0">
      <view
        class="news-item"
        :class="index !== 2 ? 'news-border' : ''"
        v-for="(item, index) in articleList"
        :key="index"
        @click="goNews(item.id)">
        <view :class="item.cover !== null ? 'new-text-img' : 'news-text'">
          <text class="new-title">{{ item.title }}</text>
          <view class="major-hits">
            <view class="news-major">
              <text class="iconfont icon-biaoqian2"></text>
              <text class="major-name">{{ item.article_category_name }}</text>
            </view>
            <view class="news-hits">
              <text class="hits-text">{{ item.read }}人已读</text>
            </view>
          </view>
        </view>
        <!--  #ifdef  MP-WEIXIN -->
        <image v-if="item.cover" :src="item.cover != null ? item.cover.url : ''" mode="aspectFill" class="news-img"></image>
        <!--  #endif -->
        <!--  #ifdef  APP-PLUS -->
        <image v-if="item.cover" :imgUrl="item.cover != null ? item.cover.url : ''" imgMode="aspectFill" class="news-img"></image>
        <!--  #endif -->
      </view>
    </view>
    <view class="tiku-mask" v-if="isTikuMaskShow" @click="closeTikuMask" @touchmove.stop.prevent="">
      <scroll-view scroll-y class="tiku-mask-box">
        <view class="iconfont icon-close" @click="closeTikuMask"></view>
        <view class="tiku-mask-title">选择题库</view>
        <view class="blue-line"></view>
        <view v-for="(item, index) in allExams" :key="index" class="tiku-mask-item" :style="{ borderTop: index === 0 ? '1px solid #eee' : '' }" @click="chooseTiku(item.id)">
          <text>{{ item.title }}</text>
        </view>
      </scroll-view>
    </view>
    <!-- 底部 -->
    <view class="ending">
      <text class="ending-line"></text>
      <text class="ending-text">我到底了</text>
      <text class="ending-line"></text>
    </view>
    <modal
      :show="dialogShow"
      confirmText="前往确认"
      title= "提示"
      text= "为了您的正常的学习，请确认您报考的科目"
      :textShow= "true"
      @confirm="goEnroll">
    </modal>
    <modal :show="isShow" title="400-118-6070" @cancel="cancel" :noCancel="true" @confirm="confirm" confirmText="呼叫" />
    <image-cropper :src="tempFilePath" @confirm="confirmImage" @cancel="cancelImage"></image-cropper>
    <!-- #ifdef  APP-PLUS -->
    <slot-modal
      class="modal-privacy"
      :show="privacyDialogShow"
      :disableScreenClick="true"
      confirmText="同意"
      cancelText="不同意"
      @cancel="cancelPrivacy"
      @confirm="confirmPrivacy">
      <template slot="modal-head">
        <text>用户协议及隐私政策</text>
      </template>
      <template slot="modal-body">
        <text>
          我们非常重视隐私和个人信息保护，请您先认真阅读
          <text class="privacyPolicy" @click.stop="goPage('agreement')">《用户服务协议》</text>和
          <text class="privacyPolicy" @click.stop="goPage('privacy')">《隐私政策》</text>的全部条款，接受全部条款后再开始使用我们的服务。
        </text>
      </template>
    </slot-modal>
    <first-mask :showMask="showMask" maskTitle="点击这里切换考试" @changeMask="changeMask"></first-mask>
    <!-- #endif -->
  </view>
</template>

<script>
import { mapState } from 'vuex';
import cacheKeys from '@/plugins/cache/keys.js';
import services from '@/common/service-loader';
import modal from '@/components/custom/modal.vue';
import uniNavBar from "@/components/vendor/uni-nav-bar/uni-nav-bar.vue";
import "@/plugins/decodeUrl/index";
import imageCropper from "@/components/vendor/ling-imgcropper";
// #ifdef  APP-PLUS
import btnIcon from "@/components/nav/btn-icon.vue";
import cacheImage from "@/components/media/cache-image"
import firstMask from '@/components/custom/first-mask.vue';
import fuHead from "@/components/nav/fu-head.vue";
import slotModal from '@/components/custom/slot-modal.vue';
//  #endif

const ONSALE = 1;
const PER_PAGE = 4;
const VIP_PER_PAGE = 3;
const TYPE_REQUEST = 0;
const ARTICLE_COUNT = 3;
const ARTICLE_PAGE = 1;
const H5Url = getApp().globalData.H5Url;

let user;
let hasContract;
let tikuId = null;
let articlesData = null;
let currentMajorSubject = null;
let accessToken = '';
let exam = {};

	export default {
    // #ifdef  MP-WEIXIN
    components: {uniNavBar, modal, imageCropper},
    // #endif
    // #ifdef  APP-PLUS
    components: {fuHead, btnIcon, modal, firstMask, imageCropper, slotModal, cacheImage},
    // #endif
		data() {
			return {
        major: {
          id: null,
          name: '',
          category_id: null,
        },
        exams: [],
        advertisements: [],
        latestCourses: null,
        vipCourses: null,
        categories: [],
        articleList: [],
        isShow: false,
        dialogShow: false,
        swiperHeight: 462,
        tikuShowDots: false,
        defaultAvatar: 'https://cdn.laixue.com/uniapp/img-teacher-avator-male.png',
        defaultCover: '../../static/img/img-cover.jpg',
        tempFilePath: '',
        isTikuMaskShow: false,
        allExams: [],
        // #ifdef  APP-PLUS
        showMask: false,
        privacyDialogShow: false,
        // #endif
			}
    },

    computed: mapState(['hasLogin']),

    filters: {
      filterLength(dataStr) {
        let str;
        if (typeof(dataStr) == "undefined") {
          return
        } else {
          str = dataStr.name.substring(0, 7);
        }
        return str;
      }
    },

    onShow() {
      // #ifdef APP-PLUS
      if (this.hasLogin) {
        this.checkContract();
      }
      // #endif
      // issue #2826

      // #ifdef APP-PLUS
      if (plus.runtime.isAgreePrivacy()) {
      // #endif
        currentMajorSubject = uni.getStorageSync('current-major');
        if (currentMajorSubject == "") {
          this.$loc.open(`category/index`);
        }
      // #ifdef APP-PLUS
      }
      // #endif
    },

    onUnload() {
      this.removeGlobalEvents();
    },

    onLoad() {
      // #ifdef APP-PLUS
      if(!plus.runtime.isAgreePrivacy()) {
        this.privacyDialogShow = true;
        uni.hideTabBar();
      } else {
        this.init();
      }
      // #endif

      // #ifndef APP-PLUS
      this.init();
      // #endif
    },

		methods: {
      init() {
        this.initSetting();
        this.addGlobalEvents();
        this.loadData();
        this.checkUpdate();
      },

      initSetting() {
        // #ifdef APP-PLUS
        // issue #2973
        let firstActive;
        firstActive = uni.getStorageSync('first-active');
        if (!firstActive) {
          firstActive = Object.assign({}, {home: 0});
        }
        if (!firstActive.home || firstActive.home != 1) {
          uni.hideTabBar();
          this.showMask = true;
          firstActive = Object.assign(firstActive, {home: 1})
          uni.setStorageSync('first-active', firstActive);
        }

        // 初始化自动移除错题集配置
        if (uni.getStorageSync("autoSkip") == "") {
          uni.setStorageSync("autoSkip", true);
        }
        // #endif
      },

      // 添加全局事件监听
      addGlobalEvents() {
        uni.$on('getMajor', this.getMajor);
      },

      // 移除全局事件监听
      removeGlobalEvents() {
        uni.$off('getMajor', this.getMajor);
      },

      // 加载数据
      loadData() {
        // 获取登录用户信息
        this.retrieveUser();

        // 获取轮播图
        this.getAds();

        // 获取热门分类
        this.getHotCategoryData();

        currentMajorSubject = uni.getStorageSync('current-major');
        if (currentMajorSubject == "") {
          return;
        }

        // 若有选中的分类，则显示分类
        this.major = currentMajorSubject;
        this.setTitle(this.major.name);

        this.getVipCourse();
        // 获取免费课程
        this.getFreeCourse();
        // 获取最新资讯
        this.getArticles();
        this.getExam();
      },

      closeTikuMask() {
        this.isTikuMaskShow = false;
        uni.showTabBar();
      },

      showTikuMask() {
        if (this.allExams.length === 0) {
          uni.showToast({
            title: '该分类没有题库资源',
            icon: 'none'
          })
          return;
        }

        if (this.allExams.length > 1) {
          this.isTikuMaskShow = true;
          uni.hideTabBar();
          return;
        }

        tikuId = this.allExams[0].id;
        this.chooseImage();
      },

      chooseTiku(id) {
        tikuId = id;
        this.chooseImage();
      },

      chooseImage() {
        uni.chooseImage({
          count: 1,
          sizeType: ['compressed'],
          success: (res) => {
            this.tempFilePath = res.tempFilePaths.shift();
            uni.hideTabBar();
          }
        });
      },

      cancelImage() {
        uni.showTabBar();
        this.tempFilePath = "";
      },

      confirmImage(e) {
        uni.showTabBar();
        const baseUrl = getApp().globalData.API_URL;
        uni.getImageInfo({
          src: e.detail.tempFilePath,
          success: (image) => {
            setTimeout(() => {
              this.showLoading();
              uni.uploadFile({
              url: `${baseUrl}tool/image-recognize`,
              filePath: image.path,
              name: 'file',
              success: (uploadFileRes) => {
                const data = JSON.parse(uploadFileRes.data)
                this.$loc.open(`tiku/search?keywords=${data.result}&&id=${tikuId}`)
              },
              fail: (err) => {
                console.log(JSON.stringify(err))
              }
            });
            }, 300);
          }
        });
      },

      retrieveUser() {
        try {
          accessToken = uni.getStorageSync('accessToken');
        } catch (e) {
          // console.log(e);
        }
        if (!accessToken) {
          return;
        }

        user = this.$jwt.user();
        if (user == null) {
          services('user').login({"user": accessToken, "type": "access_token"}).then((res) => {
            this.$store.commit('login', res.data.token);
          }).catch((error) => {
            this.$store.commit('logout');
            this.goLogin();
          })
        }
      },

      getMajor(data) {
        this.major = data.currentMajor;
        this.setTitle(this.major.name);

        this.getVipCourse();
        // 获取免费课程
        this.getFreeCourse();
        // 获取最新资讯
        this.getArticles();
        this.getExam();
      },

      // issue 2841
      setCategoriesStorage(item) {
        uni.setStorageSync('current-major', item);
      },

      goEnroll() {
        this.dialogShow = false;
        uni.showTabBar();
        this.$loc.open(`user/enroll`);
      },

      checkUpdate() {
        uni.getSystemInfo({
          success: (res) => {
            if (res.platform === 'android') {
              plus.runtime.getProperty(plus.runtime.appid, (wgtinfo)=>{
                const version = wgtinfo.version;
                const main = plus.android.runtimeMainActivity();
                services('tool').checkAppUpdate(version, main.getPackageName()).then((res) => {
                  if (res.data.error_code) {
                    return;
                  }
                  if (res.data.hasNew == '1') {
                    uni.showTabBarRedDot({
                      index: 3,
                    })
                  }
                  uni.setStorageSync('hasUpdate', res.data.hasNew);
                })
              })
            };
          }
        });
      },

      getHotCategoryData() {
        this.categories = [];
        this.loadCacheData(
          {
            key: cacheKeys.pages.home.hotCategories,
            beforeCache: this.beforeCategoriesCache
          },
          services('category').query({"expand": "majors", "is_hot": 1}),
          'categories'
        );
      },

      beforeCategoriesCache(data) {
        if (data.total_count == 0) {
          return;
        }
        for (let i = 0; i < data.items.length; i++) {
          if (data.items[i].majors) {
            this.categories = this.categories.concat(data.items[i].majors);
          }
        }
        this.categories = this.categories.slice(0, 8);
        return this.categories;
      },

      checkCategories(major) {
        // 若有选中的分类，则显示分类
        this.major = major;
        this.setTitle(this.major.name);
        this.setCategoriesStorage(major);
        this.getVipCourse();
        // 获取免费课程
        this.getFreeCourse();
        // 获取最新资讯
        this.getArticles();
        this.getExam();
      },

      // 获取轮播图
      getAds() {
        this.loadCacheData(
          {
            key: cacheKeys.pages.home.ads,
          },
          services('advertisement').query('POS_MAC_SLIDE'),
          'advertisements'
        );
      },

      // 广告跳转
      swiperImgClicked(e) {
        if (!e.url) {
          return
        }
        if (/^http(s)?:\/\/[^\s]+/.test(e.url)){
          this.$loc.open(`out/out?url=${encodeURIComponent(e.url)}`);
          return;
        }
        if ((/wx:\/\/[a-z0-9A-Z]{18}/.test(e.url))) {
          uni.navigateToMiniProgram({
            appId: e.url.substring(5, 23),
          })
          return;
        }
        const urlObject = this.decodeUrl.decode(e.url);
        switch (urlObject.model) {
          case 'live':
            this.$loc.open(`out/out?url=${encodeURIComponent(`${H5Url}course/view.html?id=${urlObject.params.id}&token=${user.token}`)}`);
            break;
          case 'video':
            this.$loc.open(`course/view?id=${urlObject.params.id}`);
            break;
          case 'doc':
            this.$loc.open(`document/view?id=${urlObject.params.id}`);
            break;
          case 'article':
            this.$loc.open(`news/view?id=${urlObject.params.id}`)
            break;
          case 'test':
            this.$loc.open(`tiku/paper?exam_id=${urlObject.params.exam_id}&id=${urlObject.params.paper_id}&paper_title=${urlObject.params.paper_title}`);
            break;
        }
      },

      getExam() {
        this.loadCacheData(
          {
            key: cacheKeys.pages.home.exams,
            afterLoad: this.afterAllExamsLoad
          },
          services('exam').queryAll({"major_id": this.major.id}),
          'allExams'
        ).then(res => {
          if (res.data.total_count == 0) {
            return;
          }
          this.afterAllExamsLoad(res.data.items);
        })
      },

      afterAllExamsLoad(allExams) {
        this.exams = [];
        this.tikuShowDots = false;
        if (!allExams) {
          this.allExams = [];
        }
        if (allExams.length > 3) {
            this.swiperHeight = 428;
          if (allExams.length > 6) {
              this.swiperHeight = 462;
              this.tikuShowDots = true;
            }
        } else {
          this.swiperHeight = 222;
        }
        for (let i = 0; i < allExams.length; i += 6 ) {
          this.exams.push(allExams.slice(i, i + 6));
        }
      },

      goPapers(item) {
        let exam = JSON.stringify(item);
        this.$loc.open(`tiku/free?exam=${exam}&categoryID=${this.major.category_id}`)
        return;
      },
      // 获得VIP课程
      getVipCourse() {
        this.vipCourses = null;
        let condition = {
          from_price: 0,
          major_id: this.major.id,
          per_page: VIP_PER_PAGE,
          expand: 'teacher,cover'
        }
        this.loadCacheData(
          {
            key: cacheKeys.pages.home.vipCourses,
          },
          services('course').query(condition),
          'vipCourses'
        );
      },

      // issue 2765 增加免费课程
      getFreeCourse() {
        this.latestCourses = null;
        let condition = {
          end_price: 0,
          major_id: this.major.id,
          per_page: PER_PAGE,
          expand: 'cover'
        }
        this.loadCacheData(
          {
            key: cacheKeys.pages.home.freeCourses,
          },
          services('course').query(condition),
          'latestCourses');
      },

      watchCourse(id) {
        this.$loc.open(`course/view?id=${id}`);
      },

      // 获取最新资讯
      getArticles() {
        this.loadCacheData(
          {
            key: cacheKeys.pages.home.news,
            beforeCache: this.beforeArticleListCache
          },
          services('article').query({"category_id": this.major.category_id}, ARTICLE_PAGE, ARTICLE_COUNT),
          'articleList',
        );
      },

      beforeArticleListCache(data) {
        this.articleList = []; // 清空文章列表
        if (data.total_count == 0) {
          this.articleList = null; // 没有最新资讯则不展示
          return;
        }
        data.items.forEach(item => {
          this.articleList.push(item);
        });
        return this.articleList;
      },

      goNews(id) {
        this.$loc.open(`news/view?id=${id}`)
      },

      openMore(type) {
        if (type === "latest" || type === "free") {
          this.$loc.open(`course/courselist?major_id=${this.major.id}&type=${type}`);
          return;
        }
        if (type === "news") {
          this.$loc.open(`news/index?category_id=${this.major.category_id}`);
          return;
        }
        if (type === "headline") {
          this.$loc.open(`out/out?url=${encodeURIComponent(`${H5Url}headline.html?category_id=${this.major.category_id}`)}`);
          return;
        }
      },

      opencategories() {
        this.$loc.open(`category/index`);
      },

      cancel() {
        this.isShow = false;
      },

      confirm() {
        uni.makePhoneCall({
          phoneNumber: this.tel
        });
      },

      checkContract() {
        // issue 2689
        this.dialogShow = false;
        const hasContract = uni.getStorageSync('hasContract');
        const enrollShowed = uni.getStorageSync('enrollShowed');
        if (hasContract === false && !enrollShowed) {
          uni.setStorageSync('enrollShowed', true)
          this.dialogShow = true;
          uni.hideTabBar();
        }
      },

      changeMask() {
        this.showMask = false;
        uni.showTabBar();
      },

      confirmPrivacy() {
        plus.runtime.agreePrivacy();
        this.privacyDialogShow = false;
        this.init();

        this.$loc.open(`category/index`);
      },

      cancelPrivacy() {
        plus.runtime.disagreePrivacy();
        this.privacyDialogShow = false;
        try {
          if (uni.getSystemInfoSync().platform =='ios') {
            plus.ios.import("UIApplication").sharedApplication().performSelector("exit")
          } else if (uni.getSystemInfoSync().platform =='android') {
            plus.runtime.quit();
          }
        } catch(e) {
        console.log('退出失败app', e);
        }
      },

      goPage(pageUrl) {
        if (pageUrl == 'kefu') {
          this.$loc.open(`user/kefu`);
          return;
        }
        if (pageUrl == 'query-teacher') {
          this.$loc.open(`user/query`);
          return;
        }
        if (pageUrl == 'news') {
          this.$loc.open(`news/index?category_id=${this.major.category_id}`);
          return;
        }

        if (pageUrl === 'privacy') {
          this.$loc.open(`user/privacy`);
          return;
        }
        if (pageUrl === 'agreement') {
          this.$loc.open(`user/agreement`);
          return;
        }
      }
    }
	}
</script>

<style scoped>
.nav-bar >>> .icon-fenlei {
  margin-left: 24rpx;
  color: #000!important;
}

.nav-bar >>> .uni-navbar__header-container-inner {
  font-size: 34rpx;
  line-height: 34rpx;
}

.nav {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding-left: 24rpx;
  height: 80rpx;
  background: #fff;
}

.icon-biaoqian2 {
  font-size: 28rpx;
  color: #666;
}

.advertisement {
  margin-top: 20rpx;
}

.advertisement,
.advertisement-swiper,
.banner {
  margin-left: auto;
  margin-right: auto;
  width: 710rpx;
  height: 187rpx;
  border-radius: 30rpx;
}

.categories-box {
  display: flex;
  flex-wrap: wrap;
  margin: 16rpx auto 20rpx;
  width: 666rpx;
}

.categories-title {
  display: block;
  width: 222rpx;
  height: 82rpx;
  text-align: center;
  line-height: 82rpx;
  color: #333;
  font-weight: 500;
  font-size: 28rpx;
}

.categories-all {
  color: #007aff;
}

.image-content {
  display: flex;
  justify-content: space-between;
  margin: 0 auto 44rpx;
  width: 671rpx;
}

.image-content-left {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 326rpx;
  height: 202rpx;
  background: #edf7ff;
  border-radius: 7rpx;
  color: #5490f4;
}

.image-content-left .xiangji {
  display: inline-block;
  width: 88rpx;
  height: 88rpx;
}

.image-left-title-top {
  margin-top: 16rpx;
}

.image-content-right {
  width: 329rpx;
  height: 202rpx;
}

.image-content-right .img-guide {
  display: inline-block;
  margin: 13rpx 0 0 54rpx;
  width: 80rpx;
  height: 74rpx;
}

.image-content-right .img-search {
  display: inline-block;
  margin: 13rpx 0 0 54rpx;
  width: 79rpx;
  height: 66rpx;
}

.image-content-guide {
  display: flex;
  margin-bottom: 14rpx;
  width: 329rpx;
  height: 94rpx;
  background: #f8edff;
  border-radius: 7rpx;
  color: #be7ae4;
}

.image-content-search {
  display: flex;
  width: 329rpx;
  height: 94rpx;
  background: #fff8e8;
  border-radius: 7rpx;
  color: #f6a582;
}

.image-content-title {
  font-size: 32rpx;
  font-weight: 500;
}

.image-right-title {
  margin: 22rpx 0 0 36rpx;
}

.course-box {
  margin: 4rpx 0 55rpx 0;
  width: 750rpx;
  height: 365rpx;
}

.vip-box {
  width: 682rpx;
  margin: 4rpx auto 58rpx auto;
}

.vip-content-item {
  display: flex;
  justify-content: flex-start;
  flex-wrap: wrap;
  margin-bottom: 36rpx;
  height: 274rpx;
  border-radius: 7rpx;
  box-shadow: 0rpx 7rpx 24rpx 0rpx #eee;
}

.vip-teacher {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0 51rpx 0 34rpx;
  width: 124rpx;
}

.couse-item-box {
  width: 518rpx !important;
  height: 365rpx !important;
}

.couse-item {
  margin: 5rpx 0 0 34rpx;
  width: 478rpx;
  height: 346rpx;
  box-shadow: 0px 7rpx 24rpx 0px rgba(242, 236, 229, 0.76);
  border-radius: 7rpx;
}

.course-image {
  display: block;
  margin-bottom: 21rpx;
  width: 100%;
  height: 232rpx;
  border-radius: 7rpx;
}

.vip-image {
  display: block;
  margin: 40rpx 0 30rpx 0;
  width: 124rpx;
  height: 124rpx;
  border-radius: 50%;
}

.vip-teacher-name {
  display: block;
  width: 150rpx;
  font-size: 28rpx;
  color: #434a54;
  font-weight: bold;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.vip-content {
  margin-top: 31rpx;
  width: 448rpx;
  height: 217rpx;
}

.vip-star-content {
  display: flex;
  justify-content: space-between;
  margin-bottom: 29rpx;
}

.vip-star-content .vip-tag {
  display: inline-block;
  padding: 0 14rpx;
  height: 39rpx;
  line-height: 39rpx;
  font-size: 24rpx;
  font-weight: bold;
  background-color: #eef0fd;
  color: #a0a9b5;
  border-radius: 7rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.vip-content-title {
  height: 97rpx;
  font-size: 30rpx;
  font-weight: bold;
  color: #60656e;
  line-height: 48rpx;
  /* 下面是超过两行显示省略号 */
  text-overflow: -o-ellipsis-lastline;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
}

.course-title {
  display: block;
  margin-bottom: 4rpx;
  padding-right: 12rpx;
  height: 42rpx;
  line-height: 28rpx;
  font-size: 30rpx;
  color: #424242;
  font-weight:400;
  text-indent: 18rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.course-tip {
  display: flex;
  justify-content: space-between;
  margin: 0 16rpx 0 23rpx;
}

.course-tip-left {
  font-size: 24rpx;
  font-weight: 400;
  color: #999;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.course-tip-course {
  display: flex;
  justify-content: flex-end;
  min-width: 175rpx;
  font-size: 24rpx;
  font-weight: 500;
  color: #999;
}

.course-tip-course-title {
  color: #3b8bfd;
}

.vip-tip-course {
  display: inline-block;
  margin: 19rpx 0 0 3rpx;
  font-size: 24rpx;
  color: #a0a9b5;
  font-weight: bold;
}

.icon-star {
  display: flex;
  align-items: center;
  flex-direction: row;
  height: 39rpx;
  line-height: 49rpx;
}

.icon-star-title {
  display: inline-block;
  margin: 0 0 4rpx 18rpx;
  color: #60656e;
  font-size: 24rpx;
}

.vip-bottom-box {
  display: flex;
  box-sizing: border-box;
  padding-right: 19rpx;
  justify-content: space-between;
  margin-top: 7rpx;
  height: 55rpx;
}

.vip-button {
  text-align: center;
  line-height: 55rpx;
  width: 160rpx;
  height: 55rpx;
  background: #237ee2;
  color: #fff;
  font-size: 26rpx;
  border-radius: 28rpx;
}

.new-title {
  display: -webkit-box;
  margin-bottom: 12rpx;
  line-height: 45rpx;
  font-weight: 500;
  font-size: 30rpx;
  color: #363636;
  text-overflow: -o-ellipsis-lastline;
  text-overflow: ellipsis;
  line-clamp: 2;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.news-box {
  width: 674rpx;
  margin: 5rpx auto 0 auto;
}

.news-item {
  display: flex;
  justify-content: space-between;
}

.news-border {
  margin-bottom: 30rpx;
  padding-bottom: 27rpx;
  border-bottom: 1rpx solid #e5e5e5;
}

.news-text {
  width: 640rpx;
}

.new-text-img {
  margin-right: 25rpx;
  width: 457rpx;
}

.major-hits {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 32rpx;
}


.major-name {
  padding-left: 10rpx;
  font-size: 24rpx;
  color: #999;
}

.hits-text {
  font-size: 24rpx;
  color: #999;
}

.news-img {
  width: 166rpx;
  height: 118rpx;
  border-radius: 7rpx;
}

.ending {
  display: flex;
  flex-direction: row;
  justify-content: center;
  padding-top: 20rpx;
  padding-bottom: 40rpx;
}

.ending-line {
  padding-top: 16rpx;
  width: 130rpx;
  height: 1rpx;
  border-bottom: 1rpx solid #e5e5e5;
}

.ending-text {
  padding-left: 30rpx;
  padding-right: 30rpx;
  font-size: 22rpx;
  color: #666;
}

.section-box {
  margin: 0 auto 44rpx;
  display: flex;
  justify-content: space-between;
  box-sizing: border-box;
  width: 679rpx;
}

.section-content-title {
  padding-top: 4rpx;
  width: 200rpx;
  font-size: 38rpx;
  color: #121212;
  font-weight: bold;
}

.more-content {
  margin-top: 6rpx;
}

.section-more {
  width: 60rpx;
  font-size: 26rpx;
  font-weight: 500;
  color: #989898;
}

.icon-gengduo {
  margin-left: -8rpx;
  font-size: 28rpx;
  color: #999;
  font-weight: 500;
}

.icon-dafen02 {
  font-size: 24rpx;
  color: #ffbc04;
}

.study >>> .arrows {
  top: 573rpx;
  left: 80%;
  white-space: nowrap;
}

.study >>> .arrows .title {
  margin-left: -120rpx;
}

.nav-bar >>> .uni-navbar-btn-text {
  display: flex;
  justify-content: center;
  margin-right: -3rpx;
  height: 40rpx;
  line-height: 40rpx;
  width: 70rpx;
  color:#3b8bfd;
  font-size: 20rpx;
  border: 2rpx solid #3b8bfd;
  border-radius: 20%;
}

.tiku-box {
  display: flex;
  flex-wrap: wrap;
  width: 702rpx;
  margin: 0 auto 50rpx auto;
}

.tiku-swiper-item {
  display: flex;
  flex-wrap: wrap;
  height: auto !important;
}

.exam-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0 16rpx 34rpx 16rpx;
  width: 202rpx;
  height: 180rpx;
  background: #f4f9ff;
  box-shadow: 0px 8px 14px 2px rgba(232, 210, 178, 0.25);;
  border-radius: 20rpx;
}

.exam-item-title {
  margin-top: 35rpx;
  width: 180rpx;
  height: 82rpx;
  font-size: 30rpx;
  text-align: center;
  line-height: 39rpx;
  color: #333;
  font-weight: 400;
  /* 下面是超过两行显示省略号 */
  text-overflow: -o-ellipsis-lastline;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
}

.exam-item-btn {
  width: 135rpx;
  height: 41rpx;
  background: #ffae4e;
  border-radius: 10rpx;
  font-size: 26rpx;
  font-weight: 400;
  color: #fff;
  text-align: center;
  line-height: 41rpx;
}

.item-box {
  width: 400rpx;
  height: 100rpx;
}

.item-title {
  margin-top: 10rpx;
  height: 38rpx;
  font-size: 30rpx;
  color: #191919;
  font-weight: bold;
}

.item-btn {
  width: 129rpx;
  height: 49rpx;
  font-size: 26rpx;
  color: #ffffff;
  line-height: 49rpx;
  text-align: center;
  border-radius:7px;
  background: #ffa837;
}

.text-overflow {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tiku-mask-box {
  position: relative;
  margin: 0 auto;
  width: 540rpx;
  max-height: 708rpx;
  padding: 40rpx 0 52rpx;
  background: #fff;
  border-radius: 24rpx;
}

.icon-close {
  position: absolute;
  top: 20rpx;
  right: 20rpx;
  color: #666;
  font-weight: bold;
  font-size: 32rpx;
}

.tiku-mask {
  display: flex;
  align-items: center;
  position: fixed;
  top: 0;
  z-index: 999;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
}

.tiku-mask-title {
  font-size: 34rpx;
  color: #1e1a23;
  font-weight: bold;
  text-align: center;
}

.tiku-mask-item {
  height: 70rpx;
  line-height: 70rpx;
  padding: 0 30rpx;
  font-size: 30rpx;
  font-weight: bold;
  text-align: center;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  box-sizing: border-box;
  border-bottom: 1px solid #eee;
}

.blue-line {
  margin: 10rpx auto 40rpx;
  width: 64rpx;
  height: 4rpx;
  background: #3b8bfd;
}
/* #ifdef  APP-PLUS */
.status-bar {
  position: fixed;
  top: 0;
  left: 0;
  height: var(--status-bar-height);
  width: 100%;
  background: #fff;
  z-index: 9;
}

.home-head {
  position: fixed;
  top: var(--status-bar-height);
  left: 0;
  background: #fff;
  z-index: 9;
}

/* issue #3092 */
.home-head >>> .left-text {
  display: flex;
  justify-content: center;
  margin-left: -3rpx;
  height: 40rpx;
  line-height: 40rpx;
  width: 70rpx;
  color: #3b8bfd;
  font-size: 20rpx;
  border: 2rpx solid #3b8bfd;
  border-radius: 20%;
}

.home-head >>> .head-title {
  margin-right: -40rpx !important;
}

.advertisement {
  margin-top: calc(var(--status-bar-height) + 90rpx);
}

.modal-privacy >>> .privacyPolicy {
  color: #3b8bfd;
}

.modal-privacy >>> .modal-head {
  margin-bottom: -30rpx;
}

.modal-privacy >>> .modal-col-first {
  color: #333;
}

/* #endif */
</style>

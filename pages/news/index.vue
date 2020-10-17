<template>
  <view class="info">
    <view class="swiper-tab">
      <view v-for="(item, index) in articleCategories" :key="index"
        :class="['swiper-tab-list', currentTab == index ? 'active' : '']"
        @click="switchMenu(index)">{{ item.name }}</view>
    </view>
    <swiper :current="currentTab" class="swiper-box-list" @change="swiperChange" :style="{height: windowHeight + 'px'}">
      <swiper-item v-for="(item, index) in articleCategories" :key="index">
        <scroll-view scroll-y="true" v-if="articles.length > 0"
          :style="{height: windowHeight + 'px'}" @scrolltolower="scrolltolower">
          <view v-for="(item, index) in articles" :key="index" class="article-box">
            <text class="article-title" @click="goPage(item.id)">{{ item.title }}</text>
          </view>
          <uni-load-more :loadingType="loadingType" :contentText="contentText" ></uni-load-more>
        </scroll-view>
        <view class="no-news" v-if="noArticles">
          <!-- #ifdef  MP-WEIXIN -->
          <image :src="noCourseImage | handleImgUrl('420', '385')" mode="scaleToFill" style="width: 420rpx; height: 385rpx"></image>
          <!-- #endif -->
          <!-- #ifdef  APP-PLUS -->
          <cache-image :imgUrl="noCourseImage | handleImgUrl('420', '385')" imgMode="scaleToFill" style="width: 420rpx; height: 385rpx"></cache-image>
          <!-- #endif -->
          <text class="no-news-text">没有资讯哦~</text>
        </view>
      </swiper-item>
    </swiper>
  </view>
</template>

<script>
// #ifdef  APP-PLUS
import cacheImage from "@/components/media/cache-image.vue";
// #endif
import uniLoadMore from '@/components/vendor/uni-load-more/uni-load-more.vue';
import services from '@/common/service-loader';

const STATICURL = getApp().globalData.CDN;

let currentPage = 1,
    pageCount = null,
    index = null,
    categoryId = null;

export default {
  components: {
    uniLoadMore,
    // #ifdef  APP-PLUS
    cacheImage
    // #endif
  },

  data() {
    return {
      currentTab: 0,
      articleCategories: [],
      current: 0,
      articles: [],
      windowHeight: '',
      noCourseImage: `${STATICURL}img-no-exam.png`,
      loadingType: 0, // 定义加载方式 0---contentdown  1---contentrefresh 2---contentnomore
      contentText: {
        contentdown: '上拉显示更多',
        contentrefresh: '正在加载...',
        contentnomore: '没有更多资讯了'
      },
      noArticles: false, /* fix issue #1978 */
    }
  },

  onLoad(option) {
    const res = uni.getSystemInfoSync();
    this.windowHeight = res.windowHeight;
    categoryId = option.category_id;
    currentPage = 1;
  },

  onReady() {
    setTimeout(() => {
      this.showLoading();
      this.getArticleCategories();
    }, 300);
  },

  // 上拉加载
  onReachBottom() {
    this.scrolltolower();
  },

  methods: {
    scrolltolower() {
      if (currentPage < pageCount) {
        this.loadingType = 1;
        uni.showNavigationBarLoading();
        currentPage++;
        if (index == null) {
          index = 0;
        }
        this.getArticles(this.articleCategories[index].id);
      } else {
        this.loadingType = 2;
        return;
      }
    },

    switchMenu(current) {
			if (this.currentTab == current) {
				return false;
			} else {
				this.currentTab = current;
			}
    },

    swiperChange(event) {
      index = event.target.current;
      this.currentTab = index;
      currentPage = 1;
      this.articles = [];
      this.getArticles(this.articleCategories[index].id)
    },

    getArticleCategories() {
	  const refid = 3;
      services('article-category').query(refid).then(res => {
        if (res.data.error_code && res.data.error_code != 'SUCCESS') {
          this.hideLoading();
          return;
        }
        this.articleCategories = res.data.items;
        this.getArticles(this.articleCategories[0].id);
      })
    },

    getArticles(acid) {
      services('article').query({'category_id': categoryId, 'article_category_id': acid}, currentPage).then(res => {
        this.hideLoading();
        if (res.data.error_code && res.data.error_code != 'SUCCESS') {
          return;
        }

        uni.hideNavigationBarLoading();
        uni.stopPullDownRefresh();

        if (res.data.total_count == 0) {
          this.noArticles = true; /* fix issue #1978 */
          return;
        }
				pageCount = res.data.page_count;
        if (currentPage > 1) {
          this.articles = this.articles.concat(res.data.items);
        } else {
          this.articles = res.data.items;
				}
        if (currentPage >= pageCount) {
          this.loadingType = 2;
          return;
        }
      });
    },

    goPage(id) {
      this.$loc.open(`news/view?id=${id}`)
    }
  }
}
</script>

<style scoped>
	.swiper-tab {
		display: flex;
    justify-content: space-around;
    position: fixed;
    top: 0;
    margin: 0 auto;
    width: 100%;
    height: 80rpx;
    padding-left: 42rpx;
		line-height: 80rpx;
    background: #ffffff;
    box-sizing: border-box;
    z-index: 5;
	}

	.swiper-tab-list {
		padding: 0 10rpx;
		font-size: 34rpx;
    font-weight: bold;
		color: #333;
	}

	.swiper-box-list {
		margin-top: 80rpx;
	}

  .active {
		color: #3b8bfd;
		border-bottom: 4rpx solid #3b8bfd;
  }

  .article-box {
    margin: 14rpx auto 0;
    width: 702rpx;
    height: 88rpx;
    line-height: 88rpx;
    box-sizing: border-box;
    box-shadow: 0 0 6rpx 2rpx #eee;
  }

  .article-box:nth-child(1) {
    margin-top: 20rpx;
  }

  .article-title {
    display: block;
    height: 88rpx;
    line-height: 88rpx;
    padding-left: 30rpx;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 30rpx;
    font-family: PingFang-SC-Medium;
    font-weight: 500;
    color: #000;
  }

  .article-title:nth-child(1) {
    margin-top: 0;
  }

  .no-news {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 267rpx;
  }

  .no-news-text {
    display: block;
    padding-top: 45rpx;
    font-size: 28rpx;
    color: #999;
  }
</style>

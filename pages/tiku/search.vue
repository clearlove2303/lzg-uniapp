<template>
  <view class="search">
    <searchbar
      @tapToSearch="tapToSearch"
      @searchbarClicked="tapToSearch"
      placeholder="搜索题目标题"
      :defaultSearchTitle="keywords"
      cancelLabel="搜索"
    >
    </searchbar>
    <view class="view-item"
      v-for="(item, index) in searchList"
      :key="index">
      <text class="search-list" @click="openTest(index, item)">{{ item.title }}</text>
    </view>
    <uni-load-more :loadingType="loadingType" :contentText="contentText" v-if="keywords != '' && loadShow"></uni-load-more>
  </view>
</template>

<script>
import services from '@/common/service-loader';
import searchbar from '@/components/nav/searchbar.vue';
import uniLoadMore from '@/components/vendor/uni-load-more/uni-load-more.vue';
import { mapState } from 'vuex';

let currentPage = 1,
    examId = null,
    mode = null,
    pageCount = null,
    searchTitle = '',
    tackePicture = false;

export default {
  components: {
    searchbar,
    uniLoadMore
  },

  data() {
    return {
      keywords: '',
      searchList: [],
      loadingText: '加载中...',
      loadingType: 0, // 定义加载方式 0---contentdown  1---contentrefresh 2---contentnomore
      contentText: {
        contentdown: '上拉显示更多',
        contentrefresh: '正在加载...',
        contentnomore: '没有更多数据了'
      },
      loadShow: false,
    }
  },

  computed: mapState(['hasLogin']),

  onLoad(option) {
    tackePicture = false;
    examId = option.id;
    searchTitle = '';
    if (option.keywords !== undefined) {
      tackePicture = true;
      if (!option.keywords) {
        this.hideLoading();
        return;
      }
      searchTitle = option.keywords.substring(0, 20);
      searchTitle = searchTitle.replace(",", "，");
      searchTitle = searchTitle.replace("(", "（");
      this.getSearchList(searchTitle);
    } else {
      currentPage = 1;
      this.loadShow = true;
    }
  },

  mounted() {
    // issue #3378 放mounted里解决父组件值传不到子组件的问题
    if (tackePicture) {
      this.keywords = searchTitle;
    }
  },

  onReachBottom() {
    this.scrolltolower();
  },

  methods: {
    scrolltolower() {
      if (this.loadingType !== 0 || tackePicture) {
        return;
      }

      if (currentPage < this.pageCount) {
        this.loadingType = 1;
        uni.showNavigationBarLoading();
        currentPage++;
        this.getSearchList(this.keywords);
      } else {
        this.loadingType = 2;
        uni.hideNavigationBarLoading();
        return;
      }
    },


    // 获取搜索题目列表
    getSearchList(newValue) {
      if (!tackePicture) {
        services('exam').querySearchList(examId, newValue, currentPage).then((res) => {
          this.handleData(res);
        })
      } else {
        services('test').query(newValue, examId).then((res) => {
          this.handleData(res);
        })
      }
    },

    handleData(res) {
      this.hideLoading();
      if (res.error_code) {
        return;
      }
      if (!tackePicture) {
        this.loadingType = 2;
        uni.hideNavigationBarLoading();
        uni.stopPullDownRefresh();
        this.pageCount = res.data.page_count;
        this.loadingType = 0;
        uni.hideNavigationBarLoading();
        if(res.data.total_count < res.data.per_page) {
          this.loadingType = 2;
          uni.hideNavigationBarLoading();
        }
      }
      if (currentPage > 1) {
        this.searchList = this.searchList.concat(res.data.items); // 将数据拼接在一起
      } else {
        this.searchList = res.data.items;
      }
    },

    // 获取输入框关键字
    tapToSearch(e) {
      // issue #3309 去除查询内容前后空格
      this.keywords = e.value.trim();
      if (this.keywords === null) {
        return;
      }
      currentPage = 1;
      if (!this.keywords) {
        this.searchList = [];
        return;
      }
      this.getSearchList(this.keywords);
    },

    // 打开试题
    openTest(index, item) {
      if(!this.hasLogin) {
        this.goLogin();
        return;
      }
      this.$loc.open(`tiku/paper?exam_id=${examId}&test_order=${index + 1}&mode=SEARCH&search_title=${this.keywords}`);   
    },
  }
}
</script>
<style scoped>
.search {
  width: 100%;
  overflow: hidden;
  padding-bottom: 50rpx;
}
.refresh-text,
.loading-text {
  padding-top: 26rpx;
  color: #333;
  font-size: 34rpx;
}
.search-list {
  margin-top: 40rpx;
  margin-left: 24rpx;
  padding: 28rpx 34rpx 28rpx 21rpx;
  width: 702rpx;
  height: 182rpx;
  line-height: 68rpx;
  font-size: 34rpx;
  color: #333;
  text-overflow: -o-ellipsis-lastline;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  border: 1px solid #eee;
  box-sizing: border-box;
}
</style>



<template>
  <view class="messages">
    <!--  #ifdef  APP-PLUS -->
    <view class="status-bar">
      <!-- 这里占位div -->
    </view>
    <!--  #endif -->
    <!-- #ifdef  MP-WEIXIN -->
    <view class="messages-head">
      <text :class="{'gray-color': allRead}" @click="rightButtonClick">全部已读</text>
    </view>
    <!-- #endif -->
    <!--  #ifdef  APP-PLUS -->
    <view class="home-app-head">
      <fu-head
      title="我的消息">
        <template slot="right-icon">
          <btn-icon
          text="全部已读"
          :textColor="textColor"
          @click="rightButtonClick"></btn-icon>
        </template>
      </fu-head>
    </view>
    <!-- #endif -->
    <view v-if="hasMessages">
      <view class="messages-box">
        <view class="messages-list" v-for="(item, index) in messages" :key="index"  @click="jumpPage(item, index)">
          <view class="messages-sender">
            <view class="messages-sender-person">
              <!-- #ifdef  MP-WEIXIN -->
              <image :src="item.sender_avator" class="messages-sender-img"></image>
              <!-- #endif -->
              <!--  #ifdef  APP-PLUS -->
              <cache-image :imgUrl="item.sender_avator" class="messages-sender-img"></cache-image>
              <!-- #endif -->
              <text class="messages-sender-nick">{{ item.sender_nick }}</text>
            </view>
            <text class="messages-sender-time">{{ item.created_at | formatTime('yyyy-mm-dd') }}</text>
          </view>
          <view class="messages-title-box">
            <i :class="{'read-mark': item.is_read == 0 && !allRead}" ></i>
            <text class="messages-title">{{ item.content }}</text>
          </view>
          <text class="messages-beizhu" v-if="item.url">点击查看详情</text>
        </view>
      </view>
      <text class="indicator-text" v-if="noMore">没有更多了</text>
    </view>
    <view class="no-order-records" v-else>
      <!-- #ifdef  MP-WEIXIN -->
      <image
        :src="noCourseImage | handleImgUrl('507', '345')"
        mode="scaleToFill"
        style="width: 507rpx; height: 345rpx"></image>
      <!-- #endif -->
      <!--  #ifdef  APP-PLUS -->
      <cache-image
        :imgUrl="noCourseImage | handleImgUrl('507', '345')"
        imgMode="scaleToFill"
        style="width: 507rpx; height: 345rpx"></cache-image>
      <!-- #endif -->
      <text class="no-order-text">暂无历史消息~</text>
    </view>
    <modal
      :show="dialogShow"
      confirmText="前往确认"
      title= "提示"
      text= "为了您的正常的学习，请确认您报考的科目"
      :textShow= "true"
      @confirm="goEnroll">
    </modal>
  </view>
</template>
<script>
import { mapState } from 'vuex';
import service from '@/common/service-loader'
import "@/plugins/decodeUrl/index"
import modal from '@/components/custom/modal.vue';
import cacheKeys from '@/plugins/cache/keys.js';
// #ifdef  APP-PLUS
import fuHead from "@/components/nav/fu-head.vue";
import btnIcon from "@/components/nav/btn-icon.vue";
import cacheImage from "@/components/media/cache-image.vue"
// #endif

const STATICURL = getApp().globalData.CDN;
const H5Url = getApp().globalData.H5Url;

let res = {},
    page = 1,
    user = null,
    hasContract= null,
    page_Count = null;

export default {
  // #ifdef  MP-WEIXIN
  components: {modal},
  // #endif
  // #ifdef  APP-PLUS
  components: {modal, fuHead, btnIcon, cacheImage},
  // #endif
  data() {
    return {
      hasMessages: false,
      messages: [],
      noMore: false,
      noCourseImage: `${STATICURL}img-no-exam.png`,
      dialogShow: false,
      allRead: true,
      textColor: 'gray',
    }
  },

  computed: mapState(['hasLogin']),

  watch: {
    //issue #3187
    allRead(newValue) {
      if(newValue) {
        this.textColor = 'gray';
      } else {
        this.textColor = 'primary';
      }
    }
  },

  onTabItemTap() {
    if (!this.hasLogin) {
      this.goLogin();
      return;
    }
  },

  onShow() {
    if (!this.hasLogin) {
      this.hasMessages = false;
      return;
    }
    uni.hideTabBarRedDot({
      index: 2,
    })
    // #ifdef APP-PLUS
    // issue 2689
    this.dialogShow = false;
    const hasContract = uni.getStorageSync('hasContract');
    const enrollShowed = uni.getStorageSync('enrollShowed');
    if (this.hasLogin && hasContract === false && !enrollShowed) {
      this.dialogShow = true;
      uni.hideTabBar();
      uni.setStorageSync('enrollShowed', true)
    }
    // #endif
  },

  onUnload() {
    uni.$off('login', this.loadData);
    uni.$off('logout', this.logout);
  },

  onLoad() {
    if (this.hasLogin) {
      this.noMore = false;
      page = 1;
      user = this.$jwt.user();
      this.messages = this.$cache.get(cacheKeys.pages.message.list);
      if (this.messages != '') {
        this.hasMessages = true;
        this.allRead = false;
      }
      this.getMessages(page);
    }
    uni.$on('login', this.loadData);
    uni.$on('logout', this.logout);
  },

  // 下拉刷新
  onPullDownRefresh() {
    page = 1;
    this.getMessages(page);
    setTimeout(function () {
      uni.stopPullDownRefresh();
    }, 1000);
  },

  onReachBottom() {
    if (page < page_Count) {
      // 显示下拉加载
      page++;
      this.getMessages(page);
    } else {
      // 显示没有更多数据了
      this.noMore = true;
    }

  },

  methods: {
    logout() {
      this.allRead = true;
      this.hasMessages = false;
    },

    // issue#3135
    rightButtonClick() {
      if (this.allRead) {
        return;
      }
      this.allRead = true;
      service('message').updateAll(user.id).then((res) => {
        console.log(res);
      })
      for (let item of this.messages) {
        item.is_read = 1;
      }
    },

    loadData(data) {
      this.noMore = false;
      page = 1;
      user = data;
      this.getMessages(page);
    },

    goEnroll() {
      this.dialogShow = false;
      uni.showTabBar();
      this.$loc.open(`user/enroll`);
    },

    getMessages(page) {
      service('message').queryByUser(user.id, page).then((response) => {
        res = response.data;
        if (res.total_count === 0) {
          this.allRead = true;
          this.hasMessages = false;
          return;
        }
        page_Count = res.page_count;
        this.hasMessages = true;
        // 用于加载更多
        if (page > 1) {
          this.messages = this.messages.concat(res.items);
        } else {
          this.messages = res.items;
        }
        this.$cache.set(cacheKeys.pages.message.list, this.messages);
        this.checkAllRead();
      })
    },

    checkAllRead() {
      this.allRead = true;
      for (let item of this.messages) {
        if (item.is_read === 0) {
          this.allRead = false;
        }
      }
    },

    jumpPage(item, index) {
      let url = item.url;
      if (!url) {
        return;
      }
      if (item.is_read === 0) {
        service('message').update(user.id, item.id).then((res)=> {
          console.log(res);
        })
        this.messages.splice(index, 1, Object.assign(this.messages[index], { is_read: 1 }))
      }
      this.checkAllRead();
      if (/^http(s)?:\/\/[^\s]+/.test(url)){
        this.$loc.open(`out/out?url=${encodeURIComponent(url)}`);
        return;
      }
      const urlObject = this.decodeUrl.decode(url);
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
          this.$loc.open(`tiku/paper?exam_id=${urlObject.params.exam_id}&id=${urlObject.params.paper_id}&paper_title=${urlObject.params.paper_title}&test_order=${urlObject.params.test_order}`);
          break;
        case 'advice':
          this.$loc.open(`out/out?url=${encodeURIComponent(`${H5Url}advice/view.html?id=${urlObject.params.id}&token=${user.token}`)}`);
          break;
        // issue#3269 跳到纠错详情页
        case 'correction':
          this.$loc.open(`out/out?url=${encodeURIComponent(`${H5Url}correction/view.html?id=${urlObject.params.id}&token=${user.token}`)}`);
          break;
      }
    }
  }
}
</script>

<style scoped>
.messages-head {
  display: flex;
  flex-direction: row-reverse;
  margin:20rpx 24rpx 0;
  width: 702rpx;
  color: #3b8bfd;
  font-size: 30rpx;
}

.gray-color {
  color: #666;
}

.messages-list {
  padding: 0 24rpx 0 24rpx;
}

.messages-sender {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding-top: 30rpx;
}

.messages-sender-person {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.messages-sender-time {
  font-size: 22rpx;
  color: #999;
}

.messages-sender-img {
  width: 44rpx;
  height: 44rpx;
}

.messages-sender-nick {
  margin-left: 21rpx;
  font-size: 24rpx;
  color: #333;
}

.messages-title-box {
  position: relative;
}

.read-mark {
  display: block;
  position: absolute;
  width: 8px;
  height: 8px;
  background: #f00;
  border-radius: 50%;
  right: -4rpx;
  top: 10rpx;
}

.messages-title {
  display: block;
  margin: 24rpx 2rpx 29rpx 0;
  font-size: 30rpx;
  font-weight: Medium;
  color: #333;
  line-height: 44rpx;
}

.messages-beizhu {
  display: block;
  text-align: right;
  font-size: 22rpx;
  color: #3b8bfd;
}

.indicator {
  margin-top: 16rpx;
  height: 40rpx;
  width: 40rpx;
  color: #3b8bfd;
}

/* 底部状态样式 */
.indicator-text {
  display: inline-block;
  margin-top: 20rpx;
  padding-bottom: 20rpx;
  width: 100%;
  color: #888;
  font-size: 30rpx;
  text-align: center;
}

.no-order-records {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 267rpx;
}

.no-order-text {
  display: block;
  padding-top: 45rpx;
  font-size: 28rpx;
  color: #999;
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

.home-app-head {
  position: fixed;
  top: var(--status-bar-height);
  left: 0;
  background: #fff;
  z-index: 9;
}

.home-app-head >>> .head-title {
  margin-right: -70rpx;
}

.home-app-head >>> .text {
  margin-right: -8rpx;
}

.messages-box, .no-order-records  {
  margin-top: calc(var(--status-bar-height) + 90rpx);
}
/* #endif */
</style>

<template>
  <view class="category">
     <!-- #ifdef  APP-PLUS -->
    <view class="status-bar">
      <!-- 这里占位div -->
    </view>
    <view class="category-head">
      <fu-head title="分类">
        <template slot="left-icon">
          <btn-icon
          icon="icon-back1"
          @click="goBack"></btn-icon>
        </template>
      </fu-head>
    </view>
    <!-- #endif -->
    <view class="category-box">
      <!-- fix issue #2035 -->
      <view class="sidebar" :style="{height: windowHeight + 'px'}">
        <view :class="active === hot.id ? 'sidebar-list sidebar-list-active' : 'sidebar-list'"
          @click="select(hot)">
          <text :class="active === hot.id ? 'sidebar-word sidebar-word-active' : 'sidebar-word'">
            {{ hot.name }}
          </text>
        </view>
        <view :class="active === item.id ? 'sidebar-list sidebar-list-active' : 'sidebar-list'"
          v-for="item in categories" :key="item.id" @click="select(item)">
          <text :class="active === item.id ? 'sidebar-word sidebar-word-active' : 'sidebar-word'">
            {{ item.name }}
          </text>
        </view>
      </view>
      <!-- fix issue #2035 -->
      <scroll-view scroll-y="true" class="sidebar-content" :style="{height: windowHeight + 'px'}">
        <view v-for="major in majors" :key="major.id">
          <view v-if="major.majors">
            <view class="major-title">
              <text class="major-word">{{ major.name }}</text>
              <text class="iconfont icon-gengduo"></text>
            </view>
            <view class="major">
              <text class="major-subject" v-for="item in major.majors"
                :key="item.id" @click="jumpToStudy(item)">
                {{ item.name }}
              </text>
            </view>
          </view>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script>
import { mapState } from 'vuex';
import services from '@/common/service-loader';
// #ifdef  APP-PLUS
import fuHead from "@/components/nav/fu-head.vue";
import btnIcon from "@/components/nav/btn-icon.vue";
// #endif


let categoryId;
let userId;
let firstActive;

export default {
  // #ifdef  APP-PLUS
  components: {fuHead, btnIcon},
  // #endif
  data() {
    return {
      categories: [],
      majors: [],
      active: 'hot',
      hot: {name: '热门', id: 'hot'},
      tempMajorData: [],
      windowHeight: 0, // fix issue #2035
    }
  },

  computed: mapState(['hasLogin']),

  onUnload() {
    uni.$off('login', this.loadData);
  },

  onShow() {
    // #ifdef  APP-PLUS
    // issue#3194
    firstActive = uni.getStorageSync('first-active');
    if (!firstActive) {
      firstActive = Object.assign({}, {category: 0});
    }
    if (!firstActive.category || firstActive.category != 1) {
      firstActive = Object.assign(firstActive, {category: 1});
      uni.setStorageSync('first-active', firstActive);
    }
    // #endif
  },

  onLoad() {
    if (this.haslogin) {
      let user = this.$jwt.user();
      userId = user.id;
    }
    uni.$on('login', this.loadData);
    this.init();
  },

  methods: {
    loadData(data) {
      let user = data;
      userId = user.id;
    },
    init() {
      try {
        this.currentMajorSubject = uni.getStorageSync('current-major');
        if (this.currentMajorSubject == "") {
          uni.showToast({
            title: '请选择考试分类',
            icon: 'none',
            duration: 1500
          });
        }
      } catch(e) {
        //console.log(e);
      }

      this.getCategoryData();

      if(this.active === this.hot.id) {
        this.getHotCategoryData();
      }
      // #ifdef  APP-PLUS
      this.windowHeight = uni.getSystemInfoSync().windowHeight - uni.getSystemInfoSync().statusBarHeight; // issue #3194
      // #endif
      // #ifdef  MP-WEIXIN
      this.windowHeight = uni.getSystemInfoSync().windowHeight; // fix issue #2035
      // #endif
      let data = uni.getSystemInfoSync();
    },
    // #2475
    getHotCategoryData() {
      services('category').query({"expand": "majors", "is_hot": 1}).then((res) => {
        this.getHotCategories(res);
      }).catch(err => {
        if (err) {
          return;
        }
      });
    },

    getHotCategories(res) {
      if (res.data.total_count > 0) {
        this.majors = res.data.items;
        let map = new Map();
        this.tempMajorData.push(map.set(this.hot.id, res.data.items));
      }
    },

    getCategoryData() {
      services('category').query({"refid": 0}).then((res) => {
        this.categories = res.data.items;
      }).catch(err => {
        if (err) {
          return;
        }
      });
    },

    getMajorData(id) {
      return services('category').query({"expand": "majors", "refid": id});
    },

    async select(item) {
      this.active = item.id;
      let map = new Map();
      // 用map的数据结构临时保存请求数据，避免同一tab切换多次请求数据
      if (this.tempMajorData.length) {
        let temp = this.tempMajorData.filter(i => i.get(item.id))
        if (!temp.length) {
          let res = await this.getMajorData(item.id);
          this.majors = res.data.items;
          this.tempMajorData.push(map.set(item.id, res.data.items))
          return;
        }
        this.majors = temp[0].get(item.id);
      }
    },

    async jumpToStudy(item) {
      this.currentMajor = item;

      // 更新用户category_id信息
      if (this.haslogin) {
        this.patchUserCid(this.currentMajor.category_id);
      }

      uni.setStorageSync('current-major', this.currentMajor);
      uni.$emit('getMajor', {currentMajor: this.currentMajor})
      this.$loc.openTab(`study/home`);
    },

    // 更新用户category_id信息
    patchUserCid(categoryId) {
      if (!categoryId) {
        return;
      }

      services('user').update(userId, {categoryId}).then((res) => {
        return;
      })
    },

    goBack() {
      this.$loc.back();
    },
  },
}
</script>

<style scoped>
.category-box {
  display: flex;
  flex-direction: row;
}
.sidebar {
  padding-top: 40rpx;
  width: 200rpx;
  background: #eee;
}
.sidebar-list {
  justify-content: center;
  width: 200rpx;
  height: 88rpx;
  line-height: 88rpx;
  overflow: hidden;
}
.sidebar-list-active {
  background: #fff;
}
.sidebar-word {
  padding-left: 24rpx;
  font-size: 28rpx;
  color: #333333;
}
.sidebar-word-active {
  border-left: 6rpx solid #3b8bfd;
}
.sidebar-content {
  padding-top: 40rpx;
  padding-left: 20rpx;
  width: 550rpx;
  overflow: hidden;
}
.major {
  margin-top: 20rpx;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
}
.major-subject {
  margin-bottom: 20rpx;
  margin-left: 20rpx;
  padding: 17rpx 21rpx 17rpx 21rpx;
  border-radius: 30rpx;
  border:1rpx solid #dcdcdc;
  font-size: 28rpx;
  color: #333333;
}
.major-title {
  flex-direction: row;
}
.major-word {
  font-size: 30rpx;
  font-weight: bold;
}
.icon-gengduo {
  padding-top: 9rpx;
  font-size: 28rpx;
  color: #666666;
  font-weight: bold;
}
/* #ifdef  APP-PLUS */
/* issue #3194 */
.status-bar {
  position: fixed;
  top: 0;
  left: 0;
  height: var(--status-bar-height);
  width: 100%;
  background: #fff;
  z-index: 9;
}
.category-head {
  position: fixed;
  top: var(--status-bar-height);
  left: 0;
  background: #fff;
  z-index: 9;
}
.category-box {
  margin-top: calc(var(--status-bar-height) + 90rpx);
}
/* #endif */
</style>

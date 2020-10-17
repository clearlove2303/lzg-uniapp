<template>
  <view class="tike-free">
    <view class="exam-paper">
      <view
        class="paper"
        v-for="(item, index) in paperCategories"
        :key="index"
        :style="paperCategoryStyles[index%7].background"
        @click="goPapers(item)">
        <text
          class="paper-icon"
          :class="paperCategoryStyles[index%7].icon"></text>
        <text class="paper-txt">{{ item.title }}</text>
        <view v-if="item.type == 'VIP'">
          <text class="paper-vip"></text>
          <text class="paper-vip-icon">VIP</text>
        </view>
      </view>
    </view>
    <view class="no-data" v-if="showNodata">
      <!-- #ifdef  MP-WEIXIN -->
      <image :src="noDataImage | handleImgUrl('507', '345')" mode="scaleToFill" style="width: 507rpx; height: 345rpx"></image>
      <!-- #endif -->
      <!-- #ifdef  APP-PLUS -->
      <cache-image :imgUrl="noDataImage | handleImgUrl('507', '345')" imgMode="scaleToFill" style="width: 507rpx; height: 345rpx"></cache-image>
      <!-- #endif -->
      <text class="no-data-text">暂无题库~</text>
    </view>
    <modal
      :show="modalShow"
      :noCancel = "true"
      :title= "dialogTitle"
      :text="`题库名：${exam.title}`"
      :textShow="true"
      confirmText="立即购买"
      @confirm='confirm'
      cancelText="取消"
      @cancel='cancel'></modal>
  </view> 
</template>
<script>
import { mapState } from 'vuex';
import services from '@/common/service-loader';
import modal from '@/components/custom/modal.vue';
// #ifdef  APP-PLUS
import cacheImage from "@/components/media/cache-image.vue";
// #endif

let user,
    userByExams,
    categoryID;

const STATICURL = getApp().globalData.CDN;

export default {
  // #ifdef  APP-PLUS
  components: {
    cacheImage
  },
  // #endif
  data() {
    return {
      exam: {},
      modalShow: false,
      showNodata: false,
      isBuyed: false,
      dialogTitle: '此题库需要购买才可以答题',
      paperCategories: [],
      noDataImage: `${STATICURL}img-no-exam.png`,

      paperCategoryStyles: [
        {
          'background': 'background-color: #EDC293',
          'icon': 'iconfont icon-zhangjiezhuanhuan'
        },
        {
          'background': 'background-color: #ED93A5',
          'icon': 'iconfont icon-gaokaochongci'
        },
        {
          'background': 'background-color: #94D4ED',
          'icon': 'iconfont icon-linianzhenti'
        },
        {
          'background': 'background-color: #AA93ED',
          'icon': 'iconfont icon-qiehuan'
        },
        {
          'background': 'background-color: #C2ED93',
          'icon': 'iconfont icon-cuotiku'
        },
        {
          'background': 'background-color: #AAB1D2',
          'icon': 'iconfont icon-favorite_diss'
        },
        {
          'background': 'background-color: #8C9CED',
          'icon': 'iconfont icon-bought'
        },
      ]
    }
  },
  components: { modal },
  computed: mapState(['hasLogin']),
  onLoad(option) {
    this.exam = JSON.parse(option.exam);
    categoryID = option.categoryID;
    this.setTitle(this.exam.title);
    uni.$on('login', this.getExamData);
    if (!this.hasLogin) {
      this.getPaperCategories(this.exam.id);
      return;
    }
    this.getExamData();
  },
  onUnload() {
    uni.$off('login');
  },
  methods: {
    getExamData() {
      this.paperCategories = [];
      user = this.$jwt.user();
      services('exam').query(user.id).then((res) => {
        if (res.data.error_code && res.data.error_code != 'SUCCESS') {
          return;
        };
        userByExams = res.data.items;
        for (var i = 0; i < userByExams.length; i++) {
          if (userByExams[i].id == this.exam.id) {
            this.isBuyed = true;
          }
        }

        this.getPaperCategories(this.exam.id);
      });
    },
    getPaperCategories(examId) {
      const data = {
        parent: 0,
      }
      services('paper-category').query(examId, data).then(res => {
        if (res.data.total_count <= 0) {
          this.showNodata = true;
          return;
        }
        this.paperCategories = res.data.items;

        this.paperCategories.forEach(item => {
          if (item.type != 'LIANXI' && !this.isBuyed) {
            item.type = 'VIP';
          }
        });
      })
    },
    goPapers(item) {
      if (item.type == 'VIP') {
        if (!this.hasLogin) {
          this.goLogin();
          return;
        }
        this.modalShow = true;
        return;
      }
      this.$loc.open(`tiku/papers?id=${item.id}&title=${item.title}&tiku_title=${this.exam.title}&exam_id=${this.exam.id}`);
    },
    confirm() {
      this.$loc.open(`user/enroll?categoryID=${categoryID}`);
      this.modalShow = false;
    },
    cancel() {
      this.modalShow = false;
    },
  }
}
</script>
<style scoped>
.exam-paper {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  flex-wrap: wrap;
  padding: 60rpx 55rpx 0 35rpx;
}

.paper-vip {
  position: absolute;
  top: 10rpx;
  right: -30rpx;
  border-bottom: 40rpx solid #FFD200;
  border-left: 20rpx solid transparent;
  border-right: 20rpx solid transparent;
  width: 80rpx;
  transform: rotate(45deg);
}

.paper-vip-icon {
  position: absolute;
  top: 10rpx;
  right: 0rpx;
  font-size: 32rpx;
  font-weight: bold;
  color: #D81E06;
  transform: rotate(45deg);
}
.paper {
  position: relative;
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
  overflow: hidden;
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

.no-data {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 267rpx;
}

.no-data-text {
  display: block;
  padding-top: 45rpx;
  font-size: 28rpx;
  color: #999;
}
</style>
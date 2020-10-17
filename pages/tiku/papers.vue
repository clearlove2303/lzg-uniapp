<template>
  <view class="papers" >
    <uni-collapse @change="change">
      <uni-collapse-item :open="isOpen"
        v-for="category in subPaperCategories" :key="category.id" :title="category.title" >
          <template v-if="category.papers">
            <view class="paper-box">
              <view class="paper-title"
                v-for="item in category.papers.items" :key="item.id" @click="goPaper(item)">
                <text>{{ item.title }}</text>
              </view>
            </view>
            <view class="text" v-if="category.papers.page <= category.papers.page_count&&category.papers.page_count != 1">
              <text @click="getPapers(category.id, category.papers.page - 1)"
                v-if="category.papers.page >= 2">上一页</text>
              <text @click="getPapers(category.id, category.papers.page + 1)"
                v-if="category.papers.page < category.papers.page_count">下一页</text>
            </view>
          </template>
      </uni-collapse-item>
    </uni-collapse>
    <view class="no-paper" v-if="noPapers">
      <!-- #ifdef  MP-WEIXIN -->
      <image
        :src="getUrl('img-no-exam.png') | handleImgUrl('507', '345')"
        style="width: 507rpx; height: 345rpx"
      ></image>
      <!-- #endif -->
      <!-- #ifdef  APP-PLUS -->
      <cache-image
        :imgUrl="getUrl('img-no-exam.png') | handleImgUrl('507', '345')"
        style="width: 507rpx; height: 345rpx"
      ></cache-image>
      <!-- #endif -->
      <text class="no-paper-text">该分类没有试卷哦~</text>
    </view>
  </view>
</template>

<script>
import { mapState } from 'vuex';
// #ifdef  APP-PLUS
import cacheImage from "@/components/media/cache-image.vue";
// #endif
import uniCollapse from '@/components/vendor/uni-collapse.vue';
import uniCollapseItem from '@/components/vendor/uni-collapse-item.vue';
import services from '@/common/service-loader';

let exam = {};
let subPaperCategoriesId = 0;
let pageCount = 0;
let page = 1;
export default {
  components: {
    uniCollapse, 
    uniCollapseItem,
    // #ifdef  APP-PLUS
    cacheImage
    // #endif 
  },
  computed: mapState(['hasLogin']),
  data() {
    return {
      subPaperCategories: [],
      papers: [],
      isOpen: false,
      noPapers: false,
    }
  },

  onLoad(option) {
    this.setTitle(option.title);

    // fix issue #2072
    exam = {
      id: option.exam_id,
    };

    subPaperCategoriesId = option.id;
    this.getSubPaperCategories();
  },

  onReachBottom() {
    if (page < pageCount) {
      this.showLoading();
      page++;
      this.getSubPaperCategories()
    }
  },

  onUnload() {
    page = 1;
  },

  methods: {
    goPaper(paper) {
      if (!this.hasLogin) {
        this.goLogin();
        return;
      }
      this.$loc.open(`tiku/paper?exam_id=${exam.id}&id=${paper.id}&paper_title=${paper.title}`);
    },

    // 获取试卷分类
    getSubPaperCategories() {
      const data = {
        parent: subPaperCategoriesId,
        page: page
      }
      services('paper-category').query(exam.id, data).then((res) => {
        this.hideLoading();
        if (res.data.error_code && res.data.error_code != 'SUCCESS') {
          this.noPapers = true;
          return;
        }
        pageCount = res.data.page_count;
        if (page > 1) {
          this.subPaperCategories = this.subPaperCategories.concat(res.data.items);
        } else {
          this.subPaperCategories = res.data.items;
        }
        this.subPaperCategories.forEach(item => {
          this.getPapers(item.id, 1);
        })
      }).catch(err => {
        if (err) {
          this.noPapers = true;
        }
      })
    },

    // 获取试卷列表
    getPapers(cid, current) {
      services('paper').queryByPaperCategory(cid, current).then((res) => {
        if (res.data.error_code && res.data.error_code != 'SUCCESS') {
          return;
        }
        this.subPaperCategories.forEach((item) => {
          if(item.id == cid) {
            this.$set(item,'papers', res.data)
          }
        })
      });
    },

    change(){
      this.isOpen = true;
    },

  }
}
</script>

<style scoped>
  .papers {
    overflow: hidden;
  }

  .paper-title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 750rpx;
    height: 88rpx;
    line-height: 88rpx;
    padding-left: 75rpx;
    padding-right: 25rpx;
    font-size: 28rpx;
    background: #fff;
    color: #666;
    box-sizing: border-box;
  }

  .paper-title text:nth-child(1) {
    width: 600rpx;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .paper-title text {
    display: block;
  }

  .no-paper {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 267rpx;
  }

  .no-paper-text {
    display: block;
    padding-top: 45rpx;
    font-size: 28rpx;
    color: #999999;
  }

  .text {
    display: flex;
    justify-content: space-around;
    line-height: 60rpx;
    height: 60rpx;
    text-align: center;
    color: #333;
    font-size: 26rpx;
  }

  .text text {
    display: block;
  }

  .paper-box {
    height: auto;
  }

  .icon-vip {
    font-size: 40rpx;
    color: #cb391c;
  }
</style>
